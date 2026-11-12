<?php

namespace App\Jobs;

use App\Models\CustomerDocument;
use App\Models\CustomerReminder;
use Illuminate\Support\Carbon;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Reads an uploaded document with Claude. After an upload it only sorts the paper
 * (folder, title, sender, short summary, dates); the full translation is the
 * expensive part and is made only when the customer asks for it ($translate).
 * Runs right after the response is sent (dispatchAfterResponse), so no queue worker is needed.
 */
class ProcessCustomerDocument
{
    use Dispatchable;

    private const LANGUAGES = ['ar' => 'Arabic', 'de' => 'German', 'en' => 'English', 'tr' => 'Turkish', 'es' => 'Spanish', 'uk' => 'Ukrainian'];

    /** File types Claude can read directly. */
    private const SUPPORTED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    /** Suggested sub-folders, so papers uploaded at the same time land in the same ones. */
    private const STANDARD_SECTIONS = [
        'Personalfragebogen', 'Arbeitsvertrag', 'Unterrichtungen', 'Befreiung_Rentenversicherung', 'Uebernahme',
        'Lohnunterlagen', 'Betriebsleiter', 'Ausweise', 'Bescheide', 'Vertraege', 'Rechnungen', 'Korrespondenz', 'Sonstiges',
    ];

    /** Tokens billed for the last call to Claude. */
    private array $usage = [];

    public function __construct(
        public int $documentId,
        public bool $autoFolder,
        public bool $countsAgainstAllowance = true,
        public bool $translate = false,
    ) {}

    public static function enabled(): bool
    {
        return (string) config('services.anthropic.key') !== '';
    }

    public function handle(): void
    {
        $doc = CustomerDocument::find($this->documentId);
        if (! $doc) {
            return;
        }

        $mime = $this->mimeOf($doc);
        if (! self::enabled() || ! in_array($mime, self::SUPPORTED, true)) {
            $doc->update(['ai_status' => 'skipped']);

            return;
        }

        $lang = $doc->translation_language ?: 'ar';
        try {
            $result = $this->ask($doc, $mime, self::LANGUAGES[$lang] ?? 'Arabic');
        } catch (\LengthException) {
            $doc->update(['ai_status' => 'too_long']);
            $this->giveBackAllowance($doc);

            return;
        } catch (Throwable $e) {
            Log::warning('document processing failed', ['id' => $doc->id, 'error' => $e->getMessage()]);
            // A cut-off answer is still billed, so keep its tokens for documents:ai-cost
            $doc->update(['ai_status' => 'failed'] + $this->tokens($doc));
            $this->giveBackAllowance($doc);

            return;
        }

        if ($this->translate) {
            $doc->update([
                'summary' => $result['summary'] ?? $doc->summary,
                'translation' => $result['translation'] ?? null,
                'ai_status' => 'done',
            ] + $this->tokens($doc));
            $this->notify($doc, [
                'de' => ['Dokument übersetzt', "„{$doc->title}“ ist übersetzt."],
                'ar' => ['تمت ترجمة مستند', "تمت ترجمة «{$doc->title}»."],
                'en' => ['Document translated', "“{$doc->title}” has been translated."],
            ]);

            return;
        }

        $folder = $result['folder'] ?? null;
        $doc->update([
            'folder' => $this->autoFolder && in_array($folder, CustomerDocument::FOLDERS, true) ? $folder : $doc->folder,
            'title' => $this->autoFolder && ! empty($result['title']) ? mb_substr($result['title'], 0, 255) : $doc->title,
            'sender' => isset($result['sender']) ? mb_substr((string) $result['sender'], 0, 255) : null,
            'sender_email' => filter_var($result['sender_email'] ?? null, FILTER_VALIDATE_EMAIL) ?: null,
            'summary' => $result['summary'] ?? null,
            'translation' => null, // made on request, see $translate
            'deadline' => $this->validDate($result['deadline'] ?? null),
            'section' => $doc->customer_file_id ? $this->sectionFrom($doc, $result['section'] ?? null) : null,
            'ai_status' => 'done',
        ] + $this->tokens($doc));
        $this->saveReminders($doc, $result['dates'] ?? []);

        $this->notify($doc, [
            'de' => ['Dokument sortiert', "„{$doc->title}“ ist einsortiert. Die Übersetzung können Sie mit einem Klick anfordern."],
            'ar' => ['تم ترتيب مستند', "تم ترتيب «{$doc->title}». يمكنك طلب الترجمة بضغطة زر."],
            'en' => ['Document sorted', "“{$doc->title}” has been sorted. You can ask for the translation with one click."],
        ]);
    }

    /** @param array<string, array{0: string, 1: string}> $texts */
    private function notify(CustomerDocument $doc, array $texts): void
    {
        Notification::create([
            'user_email' => $doc->user_email,
            'type' => 'document_processed',
            'title_de' => $texts['de'][0], 'title_ar' => $texts['ar'][0], 'title_en' => $texts['en'][0],
            'message_de' => $texts['de'][1], 'message_ar' => $texts['ar'][1], 'message_en' => $texts['en'][1],
            'link' => 'MyDocuments',
        ]);
    }

    /** Tokens of this call; a translation is added to what sorting already cost. */
    private function tokens(CustomerDocument $doc): array
    {
        $in = $this->usage['input_tokens'] ?? null;
        $out = $this->usage['output_tokens'] ?? null;
        if ($this->translate) {
            return [
                'ai_input_tokens' => $in === null ? $doc->ai_input_tokens : (int) $doc->ai_input_tokens + (int) $in,
                'ai_output_tokens' => $out === null ? $doc->ai_output_tokens : (int) $doc->ai_output_tokens + (int) $out,
            ];
        }

        return ['ai_input_tokens' => $in, 'ai_output_tokens' => $out];
    }

    private function ask(CustomerDocument $doc, string $mime, string $language): array
    {
        $data = base64_encode(Storage::disk('local')->get($doc->file_path));
        $block = $mime === 'application/pdf'
            ? ['type' => 'document', 'source' => ['type' => 'base64', 'media_type' => $mime, 'data' => $data]]
            : ['type' => 'image', 'source' => ['type' => 'base64', 'media_type' => $mime, 'data' => $data]];

        $folders = implode(', ', CustomerDocument::FOLDERS);
        $sectionField = '';
        if ($doc->customer_file_id) {
            $existing = implode(', ', $this->existingSections($doc)) ?: 'none yet';
            $standard = implode(', ', self::STANDARD_SECTIONS);
            $sectionField = <<<TXT

              "section": the sub-folder of the customer's file this paper belongs in: a short German name of 1-3 words joined by underscores, using ae/oe/ue/ss instead of umlauts and no number. Use an existing one if it fits (existing: $existing). Otherwise prefer one of: $standard, or make a similar one,
            TXT;
        }
        $translatePrompt = <<<TXT
        This is a letter or document a customer of a German administrative service uploaded.
        Reply with ONE JSON object only, no other text:
        {
          "summary": 2-4 plain sentences in $language: what it is about, what the customer must do, and any deadline or amount,
          "translation": a faithful full translation of the document text into $language (keep names, numbers, dates, reference numbers; use line breaks)
        }
        TXT;
        $prompt = <<<TXT
        This is a letter or document a customer of a German administrative service uploaded.
        Reply with ONE JSON object only, no other text:
        { $sectionField
          "folder": one of [$folders] — the authority or topic it belongs to (jobcenter = Jobcenter/Bürgergeld, auslaenderbehoerde = immigration office/residence permit, familienkasse = Kindergeld/child benefits, wohnen = landlord/rent/housing, arbeit = employer/payslips/contracts, sonstiges if unclear),
          "title": a short title in $language (max 8 words, e.g. sender + subject + date),
          "sender": who sent it (organisation name as written),
          "sender_email": the sender's e-mail address if one is printed on the letter, else null,
          "summary": 2-4 plain sentences in $language: what it is about, what the customer must do, and any deadline or amount,
          "deadline": the most important deadline as YYYY-MM-DD, or null,
          "dates": a list of every future date the customer must act on, each
            {"date": "YYYY-MM-DD",
             "kind": "deadline" (reply/pay/submit by), "expiry" (something ends: residence permit, Bürgergeld approval period (Bewilligungszeitraum), contract, ID) or "appointment",
             "title": short action in $language (e.g. "Apply for extension of residence permit", "Submit continuation application (WBA) to Jobcenter"),
             "details": one sentence in $language on what to do and where,
             "remind_days_before": how many days before the date to remind (residence permit expiry: 56, Bürgergeld period end: 35, passport/ID expiry: 60, other deadlines: 7, appointments: 2)}
            — an empty list if there are none
        }
        TXT;

        $messages = [['role' => 'user', 'content' => [$block, ['type' => 'text', 'text' => $this->translate ? $translatePrompt : $prompt]]]];
        $this->refuseIfTooLong($messages);

        $response = $this->claude()->timeout(300)->post('https://api.anthropic.com/v1/messages', [
            'model' => (string) config('services.anthropic.model'),
            // A full translation is often longer than the original; sorting needs only a short answer
            'max_tokens' => $this->translate ? 16000 : 3000,
            'messages' => $messages,
        ]);

        if ($response->failed()) {
            throw new \RuntimeException('Claude API: '.($response->json('error.message') ?? $response->status()));
        }

        $this->usage = (array) $response->json('usage', []);

        $text = collect($response->json('content', []))->where('type', 'text')->pluck('text')->implode('');
        $start = strpos($text, '{');
        $end = strrpos($text, '}');
        $json = ($start !== false && $end !== false) ? json_decode(substr($text, $start, $end - $start + 1), true) : null;
        if (! is_array($json)) {
            throw new \RuntimeException('Claude API: no JSON in answer');
        }

        return $json;
    }

    /** A paper we could not sort does not use up the customer's allowance. */
    private function giveBackAllowance(CustomerDocument $doc): void
    {
        if ($this->countsAgainstAllowance && $doc->uploaded_by === 'customer') {
            User::whereRaw('LOWER(email) = ?', [strtolower($doc->user_email)])
                ->where('file_abo_used', '>', 0)->decrement('file_abo_used');
        }
    }

    private function claude(): PendingRequest
    {
        return Http::withHeaders([
            'x-api-key' => (string) config('services.anthropic.key'),
            'anthropic-version' => '2023-06-01',
        ]);
    }

    /** Counting tokens is free; a whole book must not be paid for and then fail. */
    private function refuseIfTooLong(array $messages): void
    {
        try {
            $response = $this->claude()->timeout(60)->post('https://api.anthropic.com/v1/messages/count_tokens', [
                'model' => (string) config('services.anthropic.model'),
                'messages' => $messages,
            ]);
        } catch (Throwable) {
            return; // the count is only a safeguard; the real call reports real problems
        }

        if ($response->successful() && (int) $response->json('input_tokens') > (int) config('services.anthropic.max_input_tokens')) {
            throw new \LengthException('Document too long');
        }
    }

    /** @return array<int, string> sections already used in this document's file */
    private function existingSections(CustomerDocument $doc): array
    {
        return CustomerDocument::where('customer_file_id', $doc->customer_file_id)
            ->whereNotNull('section')->distinct()->pluck('section')->all();
    }

    /** Clean the section name; reuse an existing spelling so one topic stays one folder. */
    private function sectionFrom(CustomerDocument $doc, mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }
        $name = trim(preg_replace('/_+/', '_', preg_replace('/[^\pL\pN]+/u', '_', preg_replace('/^\d+[_\s-]*/', '', trim($value)))), '_');
        if ($name === '') {
            return null;
        }
        foreach ($this->existingSections($doc) as $existing) {
            if (mb_strtolower($existing) === mb_strtolower($name)) {
                return $existing;
            }
        }

        return mb_substr($name, 0, 100);
    }

    /** Turn the dates Claude found into reminders (replacing earlier ones for this document). */
    private function saveReminders(CustomerDocument $doc, mixed $dates): void
    {
        CustomerReminder::where('customer_document_id', $doc->id)->where('status', 'open')->delete();
        if (! is_array($dates)) {
            return;
        }
        $today = Carbon::today();
        $defaults = ['expiry' => 56, 'deadline' => 7, 'appointment' => 2];
        foreach (array_slice($dates, 0, 10) as $item) {
            if (! is_array($item) || ! ($date = $this->validDate($item['date'] ?? null))) {
                continue;
            }
            $due = Carbon::parse($date);
            if ($due->lt($today)) {
                continue;
            }
            $kind = in_array($item['kind'] ?? '', ['deadline', 'expiry', 'appointment'], true) ? $item['kind'] : 'deadline';
            $before = (int) ($item['remind_days_before'] ?? $defaults[$kind]);
            $before = max(1, min(120, $before ?: $defaults[$kind]));
            $remindOn = $due->copy()->subDays($before);
            CustomerReminder::create([
                'user_email' => $doc->user_email,
                'customer_document_id' => $doc->id,
                'folder' => $doc->folder,
                'kind' => $kind,
                'title' => mb_substr((string) ($item['title'] ?? $doc->title), 0, 255),
                'details' => isset($item['details']) ? mb_substr((string) $item['details'], 0, 2000) : null,
                'due_date' => $due->toDateString(),
                'remind_on' => ($remindOn->lt($today) ? $today : $remindOn)->toDateString(),
            ]);
        }
    }

    private function mimeOf(CustomerDocument $doc): string
    {
        $mime = strtolower((string) $doc->mime_type);
        $ext = strtolower(pathinfo($doc->original_name, PATHINFO_EXTENSION));

        return match (true) {
            $ext === 'pdf' => 'application/pdf',
            in_array($ext, ['jpg', 'jpeg'], true) => 'image/jpeg',
            $ext === 'png' => 'image/png',
            $ext === 'webp' => 'image/webp',
            default => $mime,
        };
    }

    private function validDate(mixed $value): ?string
    {
        return is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) && strtotime($value) ? $value : null;
    }
}
