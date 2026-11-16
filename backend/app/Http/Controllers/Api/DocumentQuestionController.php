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
 * The AI explains the letter in the customer's language, drafts simple German replies
 * and tells what to write in each field of a form. No legal advice: objections,
 * lawsuits and disputes are left to lawyers (RDG).
 */
class DocumentQuestionController extends Controller
{
    private const LANGUAGES = ['ar' => 'Arabic', 'de' => 'German', 'en' => 'English', 'tr' => 'Turkish', 'es' => 'Spanish', 'uk' => 'Ukrainian'];

    private const SUPPORTED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    /** Earlier questions sent along, so follow-up questions make sense. */
    private const HISTORY = 6;

    /** A drafted German letter sits between these lines, so the apps can offer "copy". */
    public const LETTER_START = '---BRIEF---';

    public const LETTER_END = '---ENDE---';

    /** The customer's own saved details the AI may use to fill letters and forms. */
    private const PERSONAL = [
        'full_name' => 'Name', 'birth_date' => 'Date of birth', 'address_street' => 'Street', 'address_zip_city' => 'Postcode and city',
        'phone' => 'Phone', 'nationality' => 'Nationality', 'bg_number' => 'Jobcenter BG-Nr.', 'tax_id' => 'Tax ID',
        'kindergeld_number' => 'Kindergeld number', 'passport_number' => 'Passport number',
        'permit_type' => 'Residence permit type', 'permit_expiry' => 'Residence permit valid until',
    ];

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
            [$answer, $usage] = $this->ask($document, $data['question'], $language, $user);
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
    private function ask(CustomerDocument $document, string $question, string $language, \App\Models\User $user): array
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
        $content[] = ['type' => 'text', 'text' => "This is the customer's letter.".($facts ? "\nWhat we already know about it:\n$facts" : '')
            ."\nThe customer's own details (use them to fill letters and forms):\n".$this->customerDetails($user)
            ."\nToday: ".now()->format('d.m.Y')];

        // Earlier questions about the same letter (oldest first), then the new one
        $messages = [['role' => 'user', 'content' => $content], ['role' => 'assistant', 'content' => 'I have read the letter. What would you like to know?']];
        $history = DocumentQuestion::where('customer_document_id', $document->id)->where('status', 'answered')
            ->latest('id')->limit(self::HISTORY)->get()->reverse();
        foreach ($history as $item) {
            $messages[] = ['role' => 'user', 'content' => $item->question];
            $messages[] = ['role' => 'assistant', 'content' => $item->answer];
        }
        $messages[] = ['role' => 'user', 'content' => $question];

        $start = self::LETTER_START;
        $end = self::LETTER_END;
        $system = <<<TXT
        You help a customer of EinStein, an administrative service in Frankfurt, with an official letter they received.
        Talk to the customer in $language, in plain and friendly words. Use the customer's letter as your source.

        1. Explaining: say what the letter says, what it asks the customer to do, by when, and what usually happens next.
           Keep explanations short (at most about 150 words).
        2. Reply letters: when the customer asks for a reply or a letter to the authority, write it in German, ready to send:
           sender (the customer's name and address), recipient (the authority from the letter), place and today's date,
           the reference numbers from the letter (Aktenzeichen, Kundennummer, BG-Nr.), a clear subject line, a short polite
           text, "Mit freundlichen Grüßen" and the customer's name. Put the whole German letter alone between a line
           "$start" and a line "$end". After it, explain in $language in two or three sentences what the letter says
           and how to send it (post, e-mail or the authority's online portal) and that attachments must be added.
        3. Forms: when the letter is or contains a form, or the customer asks how to fill one, go through it field by field:
           the field name as printed on the form, then what to write there in German. Use the customer's details and the
           letter; never guess personal data. Put the filled fields (as "Field: value" lines) between "$start" and "$end",
           and explain in $language what to tick, sign and attach.
        Where you do not know a value, write a placeholder like [bitte ergänzen: Geburtsdatum] and tell the customer.
        Never invent amounts, dates, names or reference numbers; if the letter does not contain something, say so.
        Simple letters are fine: sending documents, confirming or asking for an appointment, reporting a change
        (address, income, family, bank account), asking for more time, asking for an explanation or a copy, applications
        such as a Weiterbewilligungsantrag. You do not give legal or tax advice, do not judge whether a decision is right,
        and do not write objections (Widerspruch), lawsuits or legal arguments: for those recommend a lawyer or an advice
        centre (e.g. a Sozialberatung). The customer checks the letter and sends it themselves. For personal help the
        customer can book EinStein's "Behörden & Formularhilfe" in the app or on the website.
        TXT;

        $response = Http::withHeaders([
            'x-api-key' => (string) config('services.anthropic.key'),
            'anthropic-version' => '2023-06-01',
        ])->timeout(90)->post('https://api.anthropic.com/v1/messages', [
            'model' => (string) config('services.anthropic.model'),
            'max_tokens' => 2500,
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

    /** Name, address and the details saved for applications (users.form_data), as plain lines. */
    private function customerDetails(\App\Models\User $user): string
    {
        $saved = is_array($user->form_data) ? $user->form_data : [];
        $values = ['full_name' => $user->full_name ?: $user->name, 'phone' => $user->phone, 'address_street' => $user->address];
        foreach (self::PERSONAL as $key => $label) {
            if (filled($saved[$key] ?? null) && is_scalar($saved[$key])) {
                $values[$key] = (string) $saved[$key];
            }
        }
        $lines = [];
        foreach (self::PERSONAL as $key => $label) {
            if (filled($values[$key] ?? null)) {
                $lines[] = "$label: ".mb_substr((string) $values[$key], 0, 200);
            }
        }
        $lines[] = 'E-mail: '.$user->email;

        return implode("\n", $lines);
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
