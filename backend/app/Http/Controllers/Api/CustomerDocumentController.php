<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerDocument;
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
        $doc = $this->save($request, $request->user()->email, 'customer');

        return response()->json(['data' => $doc], 201);
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
            ->latest()->get();

        return ['folders' => CustomerDocument::FOLDERS, 'documents' => $docs];
    }

    private function save(Request $request, string $email, string $uploadedBy): CustomerDocument
    {
        $data = $request->validate([
            'folder' => ['required', Rule::in(CustomerDocument::FOLDERS)],
            'title' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:2000'],
            'file' => self::FILE_RULES,
        ]);

        $file = $request->file('file');
        $path = $file->store('customer-documents/'.sha1(strtolower($email)), self::DISK);

        $doc = CustomerDocument::create([
            'user_email' => strtolower($email),
            'folder' => $data['folder'],
            'title' => $data['title'] ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'uploaded_by' => $uploadedBy,
            'note' => $data['note'] ?? null,
        ]);
        Log::info('customer document uploaded', ['id' => $doc->id, 'by' => $uploadedBy]);

        return $doc;
    }

    private function authorizeAccess(Request $request, CustomerDocument $document): void
    {
        $user = $request->user();
        $isOwner = strcasecmp((string) $user?->email, $document->user_email) === 0;
        if (! $isOwner && $user?->role !== 'admin') {
            abort(404);
        }
    }
}
