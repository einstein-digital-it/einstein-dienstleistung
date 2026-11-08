<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessCustomerDocument;
use App\Models\CustomerDocument;
use App\Models\CustomerFile;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * "Meine Unterlagen" — a customer's documents sorted into folders.
 * Customers manage their own; admins can view and add documents for any customer.
 * Files are stored on the private disk and only served to the owner or an admin.
 */
class CustomerDocumentController extends Controller
{
    private const DISK = 'local';

    private const FILE_RULES = ['required', 'file', 'max:20480', 'mimes:pdf,jpg,jpeg,png,heic,webp,doc,docx,xls,xlsx,txt'];

    // ------------------------------------------------------------ customer

    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->listFor($request->user()->email)]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        // Sorting and translation are part of the Unterlagen-Abo; without it the file is only stored.
        $doc = $this->save($request, $user->email, 'customer', $user->hasFileAbo(), null, $user);

        return response()->json(['data' => $doc, 'needs_subscription' => ! $user->hasFileAbo()], 201);
    }

    /** POST customer/files/{customerFile}/documents — add a paper to a file the customer created. */
    public function storeInFile(Request $request, CustomerFile $customerFile): JsonResponse
    {
        CustomerFileController::authorizeOwner($request, $customerFile);
        $user = $request->user();
        $doc = $this->save($request, $user->email, 'customer', $user->hasFileAbo(), $customerFile, $user);

        return response()->json(['data' => $doc, 'needs_subscription' => ! $user->hasFileAbo()], 201);
    }

    public function download(Request $request, CustomerDocument $document): StreamedResponse
    {
        $this->authorizeAccess($request, $document);

        return Storage::disk(self::DISK)->download($document->file_path, $document->original_name);
    }

    public function destroy(Request $request, CustomerDocument $document): JsonResponse
    {
        $this->authorizeAccess($request, $document);
        Storage::disk(self::DISK)->delete($document->file_path);
        $document->delete();

        return response()->json(null, 204);
    }

    /** POST customer/documents/{document}/translate { lang } — translate again into another language. */
    public function translate(Request $request, CustomerDocument $document): JsonResponse
    {
        $this->authorizeAccess($request, $document);
        $data = $request->validate(['lang' => ['required', Rule::in(['ar', 'de', 'en', 'tr', 'es', 'uk'])]]);
        if (! $request->user()->hasFileAbo()) {
            return response()->json(['message' => 'Translation is part of the monthly subscription.', 'needs_subscription' => true], 402);
        }
        if (! ProcessCustomerDocument::enabled()) {
            return response()->json(['message' => 'Automatic translation is not set up.'], 503);
        }
        if (! $request->user()->consumeFileAboQuota()) {
            return response()->json(['message' => 'The monthly allowance is used up.', 'limit_reached' => true], 429);
        }
        $document->update(['translation_language' => $data['lang'], 'ai_status' => 'pending']);
        ProcessCustomerDocument::dispatchAfterResponse($document->id, false);

        return response()->json(['data' => $document->fresh()]);
    }

    // ------------------------------------------------------------ admin

    /** GET admin/customer-documents?email=... — one customer's folders, or a list of customers with documents. */
    public function adminIndex(Request $request): JsonResponse
    {
        $email = trim((string) $request->query('email', ''));
        if ($email !== '') {
            return response()->json(['data' => $this->listFor($email)]);
        }

        $customers = CustomerDocument::query()
            ->selectRaw('user_email, COUNT(*) as documents, MAX(created_at) as last_upload')
            ->groupBy('user_email')->orderByDesc('last_upload')->get();

        return response()->json(['data' => ['customers' => $customers]]);
    }

    public function adminStore(Request $request): JsonResponse
    {
        $request->validate(['user_email' => ['required', 'email', 'max:255']]);
        $email = strtolower(trim($request->input('user_email')));
        $doc = $this->save($request, $email, 'einstein');

        Notification::create([
            'user_email' => $email,
            'type' => 'document_added',
            'title_de' => 'Neues Dokument', 'title_ar' => 'مستند جديد', 'title_en' => 'New document',
            'message_de' => "EinStein hat „{$doc->title}“ zu Ihren Unterlagen hinzugefügt.",
            'message_ar' => "أضاف آينشتاين «{$doc->title}» إلى ملفاتك.",
            'message_en' => "EinStein added “{$doc->title}” to your documents.",
            'link' => 'MyDocuments',
        ]);

        return response()->json(['data' => $doc], 201);
    }

    // ------------------------------------------------------------ helpers

    private function listFor(string $email): array
    {
        $docs = CustomerDocument::query()
            ->whereRaw('LOWER(user_email) = ?', [strtolower($email)])
            ->whereNull('customer_file_id') // papers in a customer-created file are listed there
            ->latest()->get();

        return ['folders' => CustomerDocument::FOLDERS, 'documents' => $docs];
    }

    private function save(Request $request, string $email, string $uploadedBy, bool $allowProcessing = true, ?CustomerFile $customerFile = null, ?User $quotaUser = null): CustomerDocument
    {
        $data = $request->validate([
            // "auto" = let Claude pick the folder
            'folder' => ['required', Rule::in([...CustomerDocument::FOLDERS, 'auto'])],
            'lang' => ['nullable', Rule::in(['ar', 'de', 'en', 'tr', 'es', 'uk'])],
            // false for files the app made itself (e.g. a filled application)
            'process' => ['nullable', 'boolean'],
            'title' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:2000'],
            'file' => self::FILE_RULES,
        ]);

        $process = $allowProcessing && ProcessCustomerDocument::enabled() && $request->boolean('process', true);
        // Over the monthly allowance the paper is still stored, just not sorted
        if ($process && $quotaUser && ! $quotaUser->consumeFileAboQuota()) {
            $process = false;
        }
        $file = $request->file('file');
        $path = $file->store('customer-documents/'.sha1(strtolower($email)), self::DISK);

        $doc = CustomerDocument::create([
            'user_email' => strtolower($email),
            'customer_file_id' => $customerFile?->id,
            'folder' => $data['folder'] === 'auto' ? 'sonstiges' : $data['folder'],
            'title' => ($data['title'] ?? null) ?:pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'uploaded_by' => $uploadedBy,
            'note' => $data['note'] ?? null,
            'translation_language' => $data['lang'] ?? $this->languageOf($email),
            'ai_status' => $process ? 'pending' : 'none',
        ]);
        if ($process) {
            ProcessCustomerDocument::dispatchAfterResponse($doc->id, $data['folder'] === 'auto');
        }
        Log::info('customer document uploaded', ['id' => $doc->id, 'by' => $uploadedBy]);

        return $doc;
    }

    /** The customer's chosen language (profile), Arabic by default. */
    private function languageOf(string $email): string
    {
        $lang = strtolower((string) User::whereRaw('LOWER(email) = ?', [strtolower($email)])->value('preferred_language'));
        $map = ['arabic' => 'ar', 'german' => 'de', 'deutsch' => 'de', 'english' => 'en', 'turkish' => 'tr', 'spanish' => 'es', 'ukrainian' => 'uk'];
        $lang = $map[$lang] ?? substr($lang, 0, 2);

        return in_array($lang, ['ar', 'de', 'en', 'tr', 'es', 'uk'], true) ? $lang : 'ar';
    }

        private function authorizeAccess(Request $request, CustomerDocument $document): void
    {
        $user = $request->user();
        $isOwner = strcasecmp((string) $user?->email, $document->user_email) === 0;
        // Admins and EinStein's providers may open every customer's file
        if (! $isOwner && ! in_array($user?->role, ['admin', 'provider'], true)) {
            abort(404);
        }
    }
}
