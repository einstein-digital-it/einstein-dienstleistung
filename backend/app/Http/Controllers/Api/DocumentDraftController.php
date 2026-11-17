<?php

namespace App\Http\Controllers\Api;

use App\Jobs\ProcessCustomerDocument;
use App\Models\CustomerDocument;
use App\Models\DocumentDraft;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Throwable;

/**
 * "What do I do with this letter?" The AI decides whether the letter needs a reply,
 * writes it in German, fills the fields of a form from the customer's saved details
 * and says how to send it. The apps turn it into a PDF the customer signs, mails,
 * copies or shares. Uses one AI question of the month (like a chat question).
 */
class DocumentDraftController extends DocumentQuestionController
{
    private const LANGUAGES = ['ar' => 'Arabic', 'de' => 'German', 'en' => 'English', 'tr' => 'Turkish', 'es' => 'Spanish', 'uk' => 'Ukrainian'];

    /** GET customer/documents/{document}/draft — the last prepared reply, or null. */
    public function show(Request $request, CustomerDocument $document): JsonResponse
    {
        $this->authorizeOwner($request, $document);
        $draft = DocumentDraft::where('customer_document_id', $document->id)->latest('id')->first();

        return response()->json(['data' => $draft ? $this->present($draft) : null]);
    }

    /** POST customer/documents/{document}/draft { lang? } */
    public function store(Request $request, CustomerDocument $document): JsonResponse
    {
        $this->authorizeOwner($request, $document);
        $data = $request->validate(['lang' => ['sometimes', 'nullable', Rule::in(array_keys(self::LANGUAGES))]]);
        $user = $request->user();

        if (! $user->hasFileAbo()) {
            return $this->refuse('needs_subscription', 'Replies to letters are part of the monthly subscription.', 402);
        }
        if (! ProcessCustomerDocument::enabled()) {
            return $this->refuse('not_available', 'The AI is not set up.', 503);
        }
        if ($document->ai_status === 'too_long') {
            return $this->refuse('too_long', 'This document is too long for the AI.', 422);
        }
        if (! $user->consumeFileAboQuestion()) {
            return $this->refuse('limit_reached', 'The questions of this month are used up.', 429);
        }

        $lang = $data['lang'] ?? $user->preferred_language ?? 'de';
        $language = self::LANGUAGES[$lang] ?? 'German';

        try {
            [$result, $usage] = $this->prepare($document, $language, $user);
        } catch (Throwable $e) {
            Log::warning('document draft failed', ['document' => $document->id, 'error' => $e->getMessage()]);
            $user->returnFileAboQuestion();

            return $this->refuse('failed', 'The AI could not prepare a reply. Please try again.', 502);
        }

        $draft = DocumentDraft::create([
            'customer_document_id' => $document->id,
            'user_id' => $user->id,
            'language' => $lang,
            'payload' => $result,
            'ai_input_tokens' => $usage['input_tokens'] ?? null,
            'ai_output_tokens' => $usage['output_tokens'] ?? null,
        ]);

        return response()->json([
            'data' => $this->present($draft),
            'subscription' => CustomerSubscriptionController::stateFor($user->refresh()),
        ], 201);
    }

    /** @return array{0: array, 1: array} the structured reply and token usage */
    private function prepare(CustomerDocument $document, string $language, \App\Models\User $user): array
    {
        $system = <<<TXT
        You help a customer of EinStein, an administrative service in Frankfurt, deal with an official letter.
        Read the letter and decide what the customer has to do. Answer only by calling the tool "prepare_reply".

        - reply_needed: "none" if nothing has to be sent back (information only, a confirmation, a bill paid by direct debit,
          an approval that needs no answer); "required" if the letter asks for an answer, documents or a form by a date;
          "optional" if a reply is useful but not demanded.
        - reason and next_steps: written in $language, plain and friendly, short.
        - If a reply is needed: write it in German, ready to send, in "letter" (sender = customer's name and address,
          recipient = the authority, place and today's date, reference numbers from the letter, subject, short polite text,
          "Mit freundlichen Grüßen", the customer's name). Leave out the signature line; the app adds the signature.
        - If the letter is or contains a form: list its fields in "form_fields" with the field name as printed and the value
          in German, taken from the customer's details or the letter.
        - recipient_email only if it is printed in the letter or among the customer's saved authority e-mails; never guess.
        - Never invent amounts, dates, names or reference numbers. Where a value is unknown write [bitte ergänzen: …] and
          list it in "missing" (in $language).
        - Simple letters only: sending documents, appointments, reporting changes, asking for more time or an explanation,
          applications. Do not write objections (Widerspruch), lawsuits or legal arguments; if that is what the letter
          calls for, set reply_needed "required", leave "letter" empty and say in next_steps to see a lawyer or an advice centre.
        TXT;

        $tool = [
            'name' => 'prepare_reply',
            'description' => 'What the customer has to do with the letter, and the reply or form values if needed.',
            'input_schema' => [
                'type' => 'object',
                'properties' => [
                    'reply_needed' => ['type' => 'string', 'enum' => ['none', 'optional', 'required']],
                    'reason' => ['type' => 'string', 'description' => "Why, in the customer's language"],
                    'next_steps' => ['type' => 'string', 'description' => "What to do and by when, in the customer's language"],
                    'deadline' => ['type' => ['string', 'null'], 'description' => 'YYYY-MM-DD if the letter sets one'],
                    'recipient_name' => ['type' => ['string', 'null']],
                    'recipient_email' => ['type' => ['string', 'null']],
                    'subject' => ['type' => ['string', 'null'], 'description' => 'German subject line'],
                    'letter' => ['type' => ['string', 'null'], 'description' => 'The German reply without signature'],
                    'form_fields' => [
                        'type' => 'array',
                        'items' => [
                            'type' => 'object',
                            'properties' => ['label' => ['type' => 'string'], 'value' => ['type' => 'string']],
                            'required' => ['label', 'value'],
                        ],
                    ],
                    'attachments' => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => "Documents to enclose, in the customer's language"],
                    'missing' => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => "Details the customer must add, in the customer's language"],
                    'needs_signature' => ['type' => 'boolean'],
                    'send_by' => ['type' => 'string', 'enum' => ['email', 'post', 'portal', 'in_person', 'none']],
                ],
                'required' => ['reply_needed', 'reason', 'next_steps', 'needs_signature', 'send_by'],
            ],
        ];

        $response = Http::withHeaders([
            'x-api-key' => (string) config('services.anthropic.key'),
            'anthropic-version' => '2023-06-01',
        ])->timeout(90)->post('https://api.anthropic.com/v1/messages', [
            'model' => (string) config('services.anthropic.model'),
            'max_tokens' => 3000,
            'system' => $system,
            'tools' => [$tool],
            'tool_choice' => ['type' => 'tool', 'name' => 'prepare_reply'],
            'messages' => [['role' => 'user', 'content' => $this->letterContent($document, $user)]],
        ]);

        if ($response->failed()) {
            throw new \RuntimeException('Claude API: '.($response->json('error.message') ?? $response->status()));
        }
        $input = collect($response->json('content', []))->firstWhere('type', 'tool_use')['input'] ?? null;
        if (! is_array($input) || ! in_array($input['reply_needed'] ?? null, ['none', 'optional', 'required'], true)) {
            throw new \RuntimeException('Claude API: no usable answer');
        }

        return [$this->clean($input), (array) $response->json('usage', [])];
    }

    /** Only the known keys, as plain strings/lists, so the apps can rely on the shape. */
    private function clean(array $in): array
    {
        $str = fn ($v) => is_scalar($v) && trim((string) $v) !== '' ? trim((string) $v) : null;
        $list = fn ($v) => array_values(array_filter(array_map($str, is_array($v) ? $v : [])));
        $email = $str($in['recipient_email'] ?? null);

        return [
            'reply_needed' => $in['reply_needed'],
            'reason' => $str($in['reason'] ?? null) ?? '',
            'next_steps' => $str($in['next_steps'] ?? null) ?? '',
            'deadline' => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($in['deadline'] ?? '')) ? $in['deadline'] : null,
            'recipient_name' => $str($in['recipient_name'] ?? null),
            'recipient_email' => $email && filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null,
            'subject' => $str($in['subject'] ?? null),
            'letter' => $str($in['letter'] ?? null),
            'form_fields' => array_values(array_filter(array_map(
                fn ($f) => is_array($f) && $str($f['label'] ?? null) ? ['label' => $str($f['label']), 'value' => $str($f['value'] ?? null) ?? ''] : null,
                is_array($in['form_fields'] ?? null) ? $in['form_fields'] : []
            ))),
            'attachments' => $list($in['attachments'] ?? []),
            'missing' => $list($in['missing'] ?? []),
            'needs_signature' => (bool) ($in['needs_signature'] ?? false),
            'send_by' => in_array($in['send_by'] ?? null, ['email', 'post', 'portal', 'in_person', 'none'], true) ? $in['send_by'] : 'none',
        ];
    }

    private function present(DocumentDraft $draft): array
    {
        return ['id' => $draft->id, 'language' => $draft->language, 'created_at' => $draft->created_at?->toIso8601String()] + (array) $draft->payload;
    }
}
