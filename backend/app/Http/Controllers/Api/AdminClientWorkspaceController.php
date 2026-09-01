<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientRequest;
use App\Models\ManagedClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminClientWorkspaceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));

        $clients = ManagedClient::query()
            ->with('owner:id,full_name,name,email')
            ->withCount([
                'communications',
                'requests as open_requests_count' => fn ($query) => $query->whereNotIn('status', ['closed', 'completed']),
                'files',
                'invoices as open_invoices_count' => fn ($query) => $query->whereIn('status', ['draft', 'sent', 'overdue']),
            ])
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('full_name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('owner', fn ($owner) => $owner
                        ->where('full_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            }))
            ->latest()
            ->get();

        return response()->json(['data' => $clients->map(fn (ManagedClient $client) => $this->client($client))]);
    }

    public function show(ManagedClient $managedClient): JsonResponse
    {
        $managedClient->load([
            'owner:id,full_name,name,email',
            'communications' => fn ($query) => $query->latest('occurred_at'),
            'requests' => fn ($query) => $query->latest(),
            'files' => fn ($query) => $query->latest(),
            'invoices' => fn ($query) => $query->latest(),
            'histories' => fn ($query) => $query->latest('occurred_at'),
        ]);

        return response()->json(['data' => [
            ...$this->client($managedClient),
            'communications' => $managedClient->communications->map(fn ($item) => [
                'id' => $item->id, 'channel' => $item->channel, 'direction' => $item->direction,
                'summary' => $item->summary, 'details' => $item->details,
                'translated_summary' => $item->translated_summary, 'occurred_at' => optional($item->occurred_at)->toISOString(),
            ]),
            'requests' => $managedClient->requests->map(fn ($item) => [
                'id' => $item->id, 'number' => $item->request_number, 'subject' => $item->subject,
                'description' => $item->description, 'status' => $item->status, 'priority' => $item->priority,
                'assigned_to' => $item->assigned_to, 'due_at' => optional($item->due_at)->toDateString(),
            ]),
            'files' => $managedClient->files->map(fn ($item) => [
                'id' => $item->id, 'name' => $item->name, 'url' => $item->file_url,
            ]),
            'invoices' => $managedClient->invoices->map(fn ($item) => [
                'id' => $item->id, 'number' => $item->invoice_number, 'title' => $item->title,
                'amount' => (float) $item->amount, 'currency' => $item->currency, 'status' => $item->status,
            ]),
            'history' => $managedClient->histories->map(fn ($item) => [
                'id' => $item->id, 'title' => $item->title, 'description' => $item->description,
                'actor_name' => $item->actor_name, 'occurred_at' => optional($item->occurred_at)->toISOString(),
            ]),
        ]]);
    }

    public function updateRequest(Request $request, ManagedClient $managedClient, ClientRequest $clientRequest): JsonResponse
    {
        abort_unless($clientRequest->managed_client_id === $managedClient->id, 404);
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['open', 'in_progress', 'waiting_client', 'completed', 'closed'])],
            'assigned_to' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);
        $clientRequest->update($data);

        return response()->json(['data' => [
            'id' => $clientRequest->id,
            'status' => $clientRequest->status,
            'assigned_to' => $clientRequest->assigned_to,
        ]]);
    }

    private function client(ManagedClient $client): array
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
            'owner_name' => $client->owner?->full_name ?: $client->owner?->name,
            'owner_email' => $client->owner?->email,
            'communications_count' => $client->communications_count ?? $client->communications()->count(),
            'open_requests_count' => $client->open_requests_count ?? $client->requests()->whereNotIn('status', ['closed', 'completed'])->count(),
            'files_count' => $client->files_count ?? $client->files()->count(),
            'open_invoices_count' => $client->open_invoices_count ?? $client->invoices()->whereIn('status', ['draft', 'sent', 'overdue'])->count(),
            'created_at' => optional($client->created_at)->toISOString(),
        ];
    }
}
