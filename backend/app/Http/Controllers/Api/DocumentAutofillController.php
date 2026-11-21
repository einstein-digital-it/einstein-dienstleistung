<?php

namespace App\Http\Controllers\Api;

use App\Jobs\ProcessCustomerDocument;
use App\Models\CustomerDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * "Auto-fill" a PDF form, like a browser's autofill: the fields of the customer's PDF are
 * read (front_end/scripts/pdf-form.mjs, pdf-lib), the AI picks a value for each from the
 * customer's saved details and the letter, and the filled PDF comes back together with the
 * place of the signature. The apps put the customer's signature there and send it.
 * The filled copy is not stored on the server. Uses one AI question of the month.
 */
class DocumentAutofillController extends DocumentQuestionController
{
    /** POST customer/documents/{document}/autofill */
    public function store(Request $request, CustomerDocument $document): JsonResponse
    {
        $this->authorizeOwner($request, $document);
        $user = $request->user();

        if (! $user->hasFileAbo()) {
            return $this->refuse('needs_subscription', 'Auto-fill is part of the monthly subscription.', 402);
        }
        if ($this->mimeOf($document) !== 'application/pdf' || ! $document->file_path || ! Storage::disk('local')->exists($document->file_path)) {
            return $this->refuse('not_pdf', 'Only PDF forms can be filled in automatically.', 422);
        }

        $path = Storage::disk('local')->path($document->file_path);
        try {
            $info = $this->runScript(['fields', $path]);
        } catch (Throwable $e) {
            Log::warning('autofill: reading fields failed', ['document' => $document->id, 'error' => $e->getMessage()]);

            return $this->refuse('failed', 'The form could not be read.', 502);
        }

        $fields = array_values(array_filter((array) ($info['fields'] ?? []), 'is_array'));
        $base = ['signature' => $info['signature'] ?? null, 'pages' => $info['pages'] ?? []];
        // A scanned letter has no fields: nothing to fill, but the signature can still be placed
        if ($fields === []) {
            return response()->json(['data' => ['fillable' => false, 'filled' => 0, 'missing' => []] + $base]);
        }

        if (! ProcessCustomerDocument::enabled()) {
            return $this->refuse('not_available', 'The AI is not set up.', 503);
        }
        if (! $user->consumeFileAboQuestion()) {
            return $this->refuse('limit_reached', 'The questions of this month are used up.', 429);
        }

        try {
            $values = $this->askValues($document, $user, $fields);
            $tmp = tempnam(sys_get_temp_dir(), 'af');
            file_put_contents($tmp.'.json', json_encode($values, JSON_UNESCAPED_UNICODE));
            $result = $this->runScript(['fill', $path, $tmp.'.json', $tmp.'.pdf']);
            $pdf = base64_encode((string) file_get_contents($tmp.'.pdf'));
            @unlink($tmp);
            @unlink($tmp.'.json');
            @unlink($tmp.'.pdf');
        } catch (Throwable $e) {
            Log::warning('autofill failed', ['document' => $document->id, 'error' => $e->getMessage()]);
            $user->returnFileAboQuestion();

            return $this->refuse('failed', 'The form could not be filled in. Please try again.', 502);
        }

        $missing = array_values(array_map(
            fn ($f) => $f['name'],
            array_filter($fields, fn ($f) => ($values[$f['name']] ?? '') === '' && ($f['type'] ?? '') !== 'checkbox')
        ));

        return response()->json([
            'data' => ['fillable' => true, 'filled' => (int) ($result['filled'] ?? 0), 'missing' => $missing, 'pdf' => $pdf] + $base,
            'subscription' => CustomerSubscriptionController::stateFor($user->refresh()),
        ]);
    }

    /** @return array<string, string|bool> field name => value (only names that exist on the form) */
    private function askValues(CustomerDocument $document, \App\Models\User $user, array $fields): array
    {
        $list = collect($fields)->map(fn ($f) => array_filter([
            'name' => $f['name'],
            'type' => $f['type'] ?? 'text',
            'options' => $f['options'] ?? null,
        ]))->values()->all();

        $system = <<<TXT
        You fill in a German PDF form for a customer of EinStein, like a browser's autofill.
        You get the form itself, the customer's saved details and the list of its fields (technical names).
        Answer only by calling the tool "fill_form" with a value for every field you can fill.
        - Use only the customer's details and what is printed on the form; never invent data. Leave a field out if unsure.
        - Text in German; dates as TT.MM.JJJJ; for a checkbox give true or false; for a dropdown/radio/list one of its options exactly.
        - Do not fill signature fields, fields for the authority ("nur für Behörde", "Bearbeitungsvermerk") or legal statements
          the customer has to decide on themselves (e.g. objections).
        TXT;

        $content = $this->letterContent($document, $user);
        $content[] = ['type' => 'text', 'text' => 'Fields of the form: '.json_encode($list, JSON_UNESCAPED_UNICODE)];

        $response = Http::withHeaders([
            'x-api-key' => (string) config('services.anthropic.key'),
            'anthropic-version' => '2023-06-01',
        ])->timeout(90)->post('https://api.anthropic.com/v1/messages', [
            'model' => (string) config('services.anthropic.model'),
            'max_tokens' => 3000,
            'system' => $system,
            'tools' => [[
                'name' => 'fill_form',
                'description' => 'The value for each form field that can be filled.',
                'input_schema' => [
                    'type' => 'object',
                    'properties' => ['values' => ['type' => 'object', 'additionalProperties' => ['type' => ['string', 'boolean']]]],
                    'required' => ['values'],
                ],
            ]],
            'tool_choice' => ['type' => 'tool', 'name' => 'fill_form'],
            'messages' => [['role' => 'user', 'content' => $content]],
        ]);
        if ($response->failed()) {
            throw new \RuntimeException('Claude API: '.($response->json('error.message') ?? $response->status()));
        }
        $input = collect($response->json('content', []))->firstWhere('type', 'tool_use')['input'] ?? null;
        $values = is_array($input['values'] ?? null) ? $input['values'] : null;
        if ($values === null) {
            throw new \RuntimeException('Claude API: no values');
        }

        // Only fields that exist, only plain values
        $names = array_column($fields, 'name');
        $clean = [];
        foreach ($values as $name => $value) {
            if (in_array($name, $names, true) && (is_string($value) || is_bool($value))) {
                $clean[$name] = is_string($value) ? mb_substr(trim($value), 0, 500) : $value;
            }
        }

        return $clean;
    }

    /** Runs front_end/scripts/pdf-form.mjs with Node; returns its JSON output. */
    private function runScript(array $args): array
    {
        $script = (string) config('services.pdf_form.script', base_path('../front_end/scripts/pdf-form.mjs'));
        $result = Process::timeout(60)->run(array_merge([(string) config('services.pdf_form.node', 'node'), $script], $args));
        if ($result->failed()) {
            throw new \RuntimeException('pdf-form: '.trim($result->errorOutput()));
        }
        $json = json_decode($result->output(), true);
        if (! is_array($json)) {
            throw new \RuntimeException('pdf-form: no JSON');
        }

        return $json;
    }
}
