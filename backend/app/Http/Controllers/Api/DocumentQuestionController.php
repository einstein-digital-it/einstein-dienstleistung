<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessCustomerDocument;
use App\Models\CustomerDocument;
use App\Models\DocumentQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Throwable;

/**
 * Customers ask the AI (Claude) questions about one of their letters. Part of the
 * Unterlagen-Abo; the plan sets how many questions per month (App\Support\FileAboPlans).
 * The answer explains the letter in the customer's language; it is no legal advice.
 */
class DocumentQuestionController extends Controller
{
    private const LANGUAGES = ['ar' => 'Arabic', 'de' => 'German', 'en' => 'English', 'tr' => 'Turkish', 'es' => 'Spanish', 'uk' => 'Ukrainian'];

    private const SUPPORTED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    /** Earlier questions sent along, so follow-up questions make sense. */
    private const HISTORY = 6;

    /** GET customer/documents/{document}/questions */
    public function index(Request $request, CustomerDocument $document): JsonResponse
    {
        $this->authorizeOwner($request, $document);

        return response()->json(['data' => $this->list($document)]);
    }

    /** POST customer/documents/{document}/questions { question, lang? } */
    public function store(Request $request, CustomerDocument $document): JsonResponse
    {
        $this->authorizeOwner($request, $document);
        $data = $request->validate([
            'question' => ['required', 'string', 'min:2', 'max:1000'],
            'lang' => ['sometimes', 'nullable', Rule::in(array_keys(self::LANGUAGES))],
        ]);
        $user = $request->user();

        if (! $user->hasFileAbo()) {
            return $this->refuse('needs_subscription', 'Questions about letters are part of the monthly subscription.', 402);
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

        $lang = $data['lang'] ?? $user->preferred_language ?? $document->translation_language ?? 'de';
        $language = self::LANGUAGES[$lang] ?? 'German';

        try {
            [$answer, $usage] = $this->ask($document, $data['question'], $language);
        } catch (Throwable $e) {
            Log::warning('document question failed', ['document' => $document->id, 'error' => $e->getMessage()]);
            $user->returnFileAboQuestion();

            return $this->refuse('failed', 'The AI could not answer. Please try again.', 502);
        }

        DocumentQuestion::create([
            'customer_document_id' => $document->id,
            'user_id' => $user->id,
            'question' => $data['question'],
            'answer' => $answer,
            'status' => 'answered',
            'ai_input_tokens' => $usage['input_tokens'] ?? null,
            'ai_output_tokens' => $usage['output_tokens'] ?? null,
        ]);

        return response()->json([
            'data' => $this->list($document),
            'subscription' => CustomerSubscriptionController::stateFor($user->refresh()),
        ], 201);
    }

    /** @return array{0: string, 1: array} answer and token usage */
    private function ask(CustomerDocument $document, string $question, string $language): array
    {
        $content = [];
        $mime = $this->mimeOf($document);
        if (in_array($mime, self::SUPPORTED, true) && $document->file_path && Storage::disk('local')->exists($document->file_path)) {
            $data = base64_encode(Storage::disk('local')->get($document->file_path));
            $content[] = [
                'type' => $mime === 'application/pdf' ? 'document' : 'image',
                'source' => ['type' => 'base64', 'media_type' => $mime, 'data' => $data],
                // Follow-up questions within a few minutes reuse the letter at a lower price
                'cache_control' => ['type' => 'ephemeral'],
            ];
        }
        $known = array_filter([
            'Title' => $document->title,
            'Sender' => $document->sender,
            'Summary' => $document->summary,
            'Deadline' => $document->deadline?->format('Y-m-d'),
        ]);
        $facts = collect($known)->map(fn ($v, $k) => "$k: $v")->implode("\n");
        $content[] = ['type' => 'text', 'text' => "This is the customer's letter.".($facts ? "\nWhat we already know about it:\n$facts" : '')];

        // Earlier questions about the same letter (oldest first), then the new one
        $messages = [['role' => 'user', 'content' => $content], ['role' => 'assistant', 'content' => 'I have read the letter. What would you like to know?']];
        $history = DocumentQuestion::where('customer_document_id', $document->id)->where('status', 'answered')
            ->latest('id')->limit(self::HISTORY)->get()->reverse();
        foreach ($history as $item) {
            $messages[] = ['role' => 'user', 'content' => $item->question];
            $messages[] = ['role' => 'assistant', 'content' => $item->answer];
        }
        $messages[] = ['role' => 'user', 'content' => $question];

        $system = <<<TXT
        You help a customer of EinStein, an administrative service in Frankfurt, understand an official letter they received.
        Answer in $language, in plain and friendly words, short (at most about 150 words). Use the customer's letter as your source.
        Explain what the letter says, what it asks the customer to do, by when, and what usually happens next.
        If the letter does not contain the answer, say so honestly; never invent amounts, dates or names.
        You do not give legal or tax advice and do not judge whether a decision is right. For objections (Widerspruch),
        lawsuits or legal disputes, recommend a lawyer or an advice centre. For help with forms, replies or appointments,
        the customer can book EinStein's "Behörden & Formularhilfe" in the app or on the website.
        TXT;

        $response = Http::withHeaders([
            'x-api-key' => (string) config('services.anthropic.key'),
            'anthropic-version' => '2023-06-01',
        ])->timeout(90)->post('https://api.anthropic.com/v1/messages', [
            'model' => (string) config('services.anthropic.model'),
            'max_tokens' => 1200,
            'system' => $system,
            'messages' => $messages,
        ]);

        if ($response->failed()) {
            throw new \RuntimeException('Claude API: '.($response->json('error.message') ?? $response->status()));
        }
        $answer = trim(collect($response->json('content', []))->where('type', 'text')->pluck('text')->implode(''));
        if ($answer === '') {
            throw new \RuntimeException('Claude API: empty answer');
        }

        return [$answer, (array) $response->json('usage', [])];
    }

    private function list(CustomerDocument $document): array
    {
        return DocumentQuestion::where('customer_document_id', $document->id)->oldest('id')->get()
            ->map(fn (DocumentQuestion $q) => [
                'id' => $q->id,
                'question' => $q->question,
                'answer' => $q->answer,
                'created_at' => $q->created_at?->toIso8601String(),
            ])->values()->all();
    }

    private function refuse(string $code, string $message, int $status): JsonResponse
    {
        return response()->json(['message' => $message, 'code' => $code], $status);
    }

    /** Only the customer the letter belongs to may ask about it. */
    private function authorizeOwner(Request $request, CustomerDocument $document): void
    {
        if (strcasecmp((string) $request->user()?->email, $document->user_email) !== 0) {
            abort(404);
        }
    }

    private function mimeOf(CustomerDocument $doc): string
    {
        $ext = strtolower(pathinfo((string) $doc->original_name, PATHINFO_EXTENSION));

        return match (true) {
            $ext === 'pdf' => 'application/pdf',
            in_array($ext, ['jpg', 'jpeg'], true) => 'image/jpeg',
            $ext === 'png' => 'image/png',
            $ext === 'webp' => 'image/webp',
            default => strtolower((string) $doc->mime_type),
        };
    }
}
