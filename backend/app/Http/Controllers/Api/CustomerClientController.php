<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientCommunication;
use App\Models\ClientFile;
use App\Models\ClientHistory;
use App\Models\ClientInvoice;
use App\Models\ClientRequest;
use App\Models\ManagedClient;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CustomerClientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $clients = ManagedClient::query()
            ->where('owner_user_id', $request->user()->id)
            ->withCount(['communications', 'requests as open_requests_count' => fn ($query) => $query->whereNotIn('status', ['closed', 'completed']), 'files', 'invoices as open_invoices_count' => fn ($query) => $query->whereIn('status', ['draft', 'sent', 'overdue'])])
            ->latest()
            ->get()
            ->map(fn (ManagedClient $client) => $this->serializeClient($client));

        return response()->json(['data' => $clients]);
    }

    public function store(Request $request): JsonResponse
    {
        $client = ManagedClient::create([
            ...$request->validate($this->clientRules()),
            'owner_user_id' => $request->user()->id,
        ]);

        $this->history($client, 'client_created', 'Client profile created', 'The client profile is ready for the EinStein team.', $request);
        $this->notify($request, 'client_created', 'Client profile created', "{$client->full_name} was added to your client workspace.", $client);

        return response()->json(['data' => $this->serializeClient($client)], 201);
    }

    public function show(Request $request, ManagedClient $managedClient): JsonResponse
    {
        $client = $this->ownedClient($request, $managedClient);
        $client->load([
            'communications' => fn ($query) => $query->latest('occurred_at'),
            'requests' => fn ($query) => $query->latest(),
            'files' => fn ($query) => $query->latest(),
            'invoices' => fn ($query) => $query->latest(),
            'histories' => fn ($query) => $query->latest('occurred_at'),
        ]);

        return response()->json(['data' => [
            ...$this->serializeClient($client),
            'communications' => $client->communications->map(fn (ClientCommunication $item) => $this->serializeCommunication($item)),
            'requests' => $client->requests->map(fn (ClientRequest $item) => $this->serializeRequest($item)),
            'files' => $client->files->map(fn (ClientFile $item) => $this->serializeFile($item)),
            'invoices' => $client->invoices->map(fn (ClientInvoice $item) => $this->serializeInvoice($item)),
            'history' => $client->histories->map(fn (ClientHistory $item) => $this->serializeHistory($item)),
        ]]);
    }

    public function update(Request $request, ManagedClient $managedClient): JsonResponse
    {
        $client = $this->ownedClient($request, $managedClient);
        $client->update($request->validate($this->clientRules(partial: true)));
        $this->history($client, 'client_updated', 'Client profile updated', null, $request);

        return response()->json(['data' => $this->serializeClient($client->fresh())]);
    }

    public function storeCommunication(Request $request, ManagedClient $managedClient): JsonResponse
    {
        $client = $this->ownedClient($request, $managedClient);
        $data = $request->validate([
            'channel' => ['required', Rule::in(['call', 'whatsapp', 'email', 'message', 'meeting'])],
            'direction' => ['required', Rule::in(['inbound', 'outbound'])],
            'summary' => ['required', 'string', 'max:4000'],
            'details' => ['nullable', 'string', 'max:12000'],
            'translated_summary' => ['nullable', 'string', 'max:4000'],
            'attachment_name' => ['nullable', 'string', 'max:255'],
            'attachment_url' => ['nullable', 'string', 'max:2048'],
            'occurred_at' => ['nullable', 'date'],
        ]);
        $item = $client->communications()->create([
            ...$data,
            'performed_by' => $request->user()->full_name ?: $request->user()->name,
            'occurred_at' => $data['occurred_at'] ?? now(),
        ]);
        $this->history($client, 'communication_logged', ucfirst($item->channel).' communication logged', $item->summary, $request, ['communication_id' => $item->id]);
        $this->notify($request, 'client_communication', 'Client communication updated', "A {$item->channel} update was added for {$client->full_name}.", $client);

        return response()->json(['data' => $this->serializeCommunication($item)], 201);
    }

    public function storeRequest(Request $request, ManagedClient $managedClient): JsonResponse
    {
        $client = $this->ownedClient($request, $managedClient);
        $data = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:12000'],
            'priority' => ['nullable', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'assigned_to' => ['nullable', 'string', 'max:255'],
            'due_at' => ['nullable', 'date'],
        ]);
        $item = $client->requests()->create([
            ...$data,
            'request_number' => 'CR-'.strtoupper(Str::random(8)),
            'status' => 'open',
            'priority' => $data['priority'] ?? 'normal',
        ]);
        $this->history($client, 'request_created', "Request {$item->request_number} opened", $item->subject, $request, ['request_id' => $item->id]);
        $this->notify($request, 'client_request', 'Client request created', "{$item->request_number} was opened for {$client->full_name}.", $client);

        return response()->json(['data' => $this->serializeRequest($item)], 201);
    }

    public function updateRequest(Request $request, ManagedClient $managedClient, ClientRequest $clientRequest): JsonResponse
    {
        $client = $this->ownedClient($request, $managedClient);
        abort_unless($clientRequest->managed_client_id === $client->id, 404);
        $data = $request->validate([
            'subject' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:12000'],
            'status' => ['sometimes', Rule::in(['open', 'in_progress', 'waiting_client', 'completed', 'closed'])],
            'priority' => ['sometimes', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'assigned_to' => ['sometimes', 'nullable', 'string', 'max:255'],
            'due_at' => ['sometimes', 'nullable', 'date'],
        ]);
        $clientRequest->update($data);
        $this->history($client, 'request_updated', "Request {$clientRequest->request_number} updated", $clientRequest->subject, $request, ['request_id' => $clientRequest->id]);

        return response()->json(['data' => $this->serializeRequest($clientRequest->fresh())]);
    }

    public function storeFile(Request $request, ManagedClient $managedClient): JsonResponse
    {
        $client = $this->ownedClient($request, $managedClient);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'file_url' => ['required', 'string', 'max:2048'],
            'mime_type' => ['nullable', 'string', 'max:255'],
            'size_bytes' => ['nullable', 'integer', 'min:0'],
        ]);
        $item = $client->files()->create([...$data, 'uploaded_by' => $request->user()->full_name ?: $request->user()->name]);
        $this->history($client, 'file_added', 'File added: '.$item->name, null, $request, ['file_id' => $item->id]);

        return response()->json(['data' => $this->serializeFile($item)], 201);
    }

    public function storeInvoice(Request $request, ManagedClient $managedClient): JsonResponse
    {
        $client = $this->ownedClient($request, $managedClient);
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'status' => ['nullable', Rule::in(['draft', 'sent', 'paid', 'overdue'])],
            'due_date' => ['nullable', 'date'],
            'invoice_url' => ['nullable', 'string', 'max:2048'],
        ]);
        $item = $client->invoices()->create([
            ...$data,
            'invoice_number' => 'INV-'.strtoupper(Str::random(8)),
            'currency' => strtoupper($data['currency'] ?? 'EUR'),
            'status' => $data['status'] ?? 'draft',
            'sent_at' => ($data['status'] ?? 'draft') === 'sent' ? now() : null,
        ]);
        $this->history($client, 'invoice_created', "Invoice {$item->invoice_number} created", $item->title, $request, ['invoice_id' => $item->id]);
        $this->notify($request, 'client_invoice', 'Client invoice updated', "Invoice {$item->invoice_number} was created for {$client->full_name}.", $client);

        return response()->json(['data' => $this->serializeInvoice($item)], 201);
    }

    private function ownedClient(Request $request, ManagedClient $client): ManagedClient
    {
        abort_unless($client->owner_user_id === $request->user()->id, 404);

        return $client;
    }

    private function clientRules(bool $partial = false): array
    {
        $prefix = $partial ? 'sometimes' : 'required';

        return [
            'full_name' => [$prefix, 'string', 'max:255'],
            'company_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:255'],
            'preferred_language' => ['sometimes', 'string', 'max:10'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
            'notes' => ['sometimes', 'nullable', 'string', 'max:12000'],
        ];
    }

    private function history(ManagedClient $client, string $type, string $title, ?string $description, Request $request, array $metadata = []): void
    {
        $client->histories()->create([
            'event_type' => $type,
            'title' => $title,
            'description' => $description,
            'actor_name' => $request->user()->full_name ?: $request->user()->name,
            'metadata' => $metadata,
            'occurred_at' => now(),
        ]);
    }

    private function notify(Request $request, string $type, string $title, string $message, ManagedClient $client): void
    {
        Notification::create([
            'user_email' => $request->user()->email,
            'type' => $type,
            'title_en' => $title,
            'title_de' => $title,
            'title_ar' => $title,
            'message_en' => $message,
            'message_de' => $message,
            'message_ar' => $message,
            'link' => '/customer-clients/'.$client->id,
            'is_read' => false,
        ]);
    }

    private function serializeClient(ManagedClient $client): array
    {
        return [
            'id' => $client->id,
            'full_name' => $client->full_name,
            'company_name' => $client->company_name,
            'email' => $client->email,
            'phone' => $client->phone,
            'preferred_language' => $client->preferred_language,
            'status' => $client->status,
            'notes' => $client->notes,
            'communications_count' => $client->communications_count ?? $client->communications()->count(),
            'open_requests_count' => $client->open_requests_count ?? $client->requests()->whereNotIn('status', ['closed', 'completed'])->count(),
            'files_count' => $client->files_count ?? $client->files()->count(),
            'open_invoices_count' => $client->open_invoices_count ?? $client->invoices()->whereIn('status', ['draft', 'sent', 'overdue'])->count(),
            'created_at' => $client->created_at?->toISOString(),
            'updated_at' => $client->updated_at?->toISOString(),
        ];
    }

    private function serializeCommunication(ClientCommunication $item): array
    {
        return ['id' => $item->id, 'channel' => $item->channel, 'direction' => $item->direction, 'summary' => $item->summary, 'details' => $item->details, 'translated_summary' => $item->translated_summary, 'attachment_name' => $item->attachment_name, 'attachment_url' => $item->attachment_url, 'performed_by' => $item->performed_by, 'occurred_at' => $item->occurred_at?->toISOString()];
    }

    private function serializeRequest(ClientRequest $item): array
    {
        return ['id' => $item->id, 'request_number' => $item->request_number, 'subject' => $item->subject, 'description' => $item->description, 'status' => $item->status, 'priority' => $item->priority, 'assigned_to' => $item->assigned_to, 'due_at' => $item->due_at?->toISOString(), 'created_at' => $item->created_at?->toISOString()];
    }

    private function serializeFile(ClientFile $item): array
    {
        return ['id' => $item->id, 'name' => $item->name, 'file_url' => $item->file_url, 'mime_type' => $item->mime_type, 'size_bytes' => $item->size_bytes, 'uploaded_by' => $item->uploaded_by, 'created_at' => $item->created_at?->toISOString()];
    }

    private function serializeInvoice(ClientInvoice $item): array
    {
        return ['id' => $item->id, 'invoice_number' => $item->invoice_number, 'title' => $item->title, 'amount' => (float) $item->amount, 'currency' => $item->currency, 'status' => $item->status, 'due_date' => $item->due_date?->format('Y-m-d'), 'invoice_url' => $item->invoice_url, 'sent_at' => $item->sent_at?->toISOString(), 'paid_at' => $item->paid_at?->toISOString()];
    }

    private function serializeHistory(ClientHistory $item): array
    {
        return ['id' => $item->id, 'event_type' => $item->event_type, 'title' => $item->title, 'description' => $item->description, 'actor_name' => $item->actor_name, 'metadata' => $item->metadata, 'occurred_at' => $item->occurred_at?->toISOString()];
    }
}
