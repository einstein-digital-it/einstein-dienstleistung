<?php

namespace App\Jobs;

use App\Models\CustomerDocument;
use App\Models\Notification;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Reads an uploaded document with Claude, sorts it into the right folder and
 * translates it into the customer's language. Runs right after the upload
 * response is sent (dispatchAfterResponse), so no queue worker is needed.
 */
class ProcessCustomerDocument
{
    use Dispatchable;

    private const LANGUAGES = ['ar' => 'Arabic', 'de' => 'German', 'en' => 'English', 'tr' => 'Turkish', 'es' => 'Spanish'];

    /** File types Claude can read directly. */
    private const SUPPORTED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    public function __construct(public int $documentId, public bool $autoFolder) {}

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
        } catch (Throwable $e) {
            Log::warning('document processing failed', ['id' => $doc->id, 'error' => $e->getMessage()]);
            $doc->update(['ai_status' => 'failed']);

            return;
        }

        $folder = $result['folder'] ?? null;
        $doc->update([
            'folder' => $this->autoFolder && in_array($folder, CustomerDocument::FOLDERS, true) ? $folder : $doc->folder,
            'title' => $this->autoFolder && ! empty($result['title']) ? mb_substr($result['title'], 0, 255) : $doc->title,
            'sender' => isset($result['sender']) ? mb_substr((string) $result['sender'], 0, 255) : null,
            'summary' => $result['summary'] ?? null,
            'translation' => $result['translation'] ?? null,
            'deadline' => $this->validDate($result['deadline'] ?? null),
            'ai_status' => 'done',
        ]);

        $titles = ['ar' => 'تمت ترجمة مستند', 'de' => 'Dokument übersetzt', 'en' => 'Document translated'];
        Notification::create([
            'user_email' => $doc->user_email,
            'type' => 'document_processed',
            'title_de' => $titles['de'], 'title_ar' => $titles['ar'], 'title_en' => $titles['en'],
            'message_de' => "„{$doc->title}“ ist sortiert und übersetzt.",
            'message_ar' => "تم ترتيب «{$doc->title}» وترجمته.",
            'message_en' => "“{$doc->title}” has been sorted and translated.",
            'link' => 'MyDocuments',
        ]);
    }

    private function ask(CustomerDocument $doc, string $mime, string $language): array
    {
        $data = base64_encode(Storage::disk('local')->get($doc->file_path));
        $block = $mime === 'application/pdf'
            ? ['type' => 'document', 'source' => ['type' => 'base64', 'media_type' => $mime, 'data' => $data]]
            : ['type' => 'image', 'source' => ['type' => 'base64', 'media_type' => $mime, 'data' => $data]];

        $folders = implode(', ', CustomerDocument::FOLDERS);
        $prompt = <<<TXT
        This is a letter or document a customer of a German administrative service uploaded.
        Reply with ONE JSON object only, no other text:
        {
          "folder": one of [$folders] — the authority or topic it belongs to (jobcenter = Jobcenter/Bürgergeld, auslaenderbehoerde = immigration office/residence permit, familienkasse = Kindergeld/child benefits, wohnen = landlord/rent/housing, arbeit = employer/payslips/contracts, sonstiges if unclear),
          "title": a short title in $language (max 8 words, e.g. sender + subject + date),
          "sender": who sent it (organisation name as written),
          "summary": 2-4 plain sentences in $language: what it is about, what the customer must do, and any deadline or amount,
          "translation": a faithful full translation of the document text into $language (keep names, numbers, dates, reference numbers; use line breaks),
          "deadline": the most important deadline as YYYY-MM-DD, or null
        }
        TXT;

        $response = Http::withHeaders([
            'x-api-key' => (string) config('services.anthropic.key'),
            'anthropic-version' => '2023-06-01',
        ])->timeout(180)->post('https://api.anthropic.com/v1/messages', [
            'model' => (string) config('services.anthropic.model'),
            'max_tokens' => 8000,
            'messages' => [['role' => 'user', 'content' => [$block, ['type' => 'text', 'text' => $prompt]]]],
        ]);

        if ($response->failed()) {
            throw new \RuntimeException('Claude API: '.($response->json('error.message') ?? $response->status()));
        }

        $text = collect($response->json('content', []))->where('type', 'text')->pluck('text')->implode('');
        $start = strpos($text, '{');
        $end = strrpos($text, '}');
        $json = ($start !== false && $end !== false) ? json_decode(substr($text, $start, $end - $start + 1), true) : null;
        if (! is_array($json)) {
            throw new \RuntimeException('Claude API: no JSON in answer');
        }

        return $json;
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
