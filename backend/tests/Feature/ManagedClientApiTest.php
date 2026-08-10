<?php

namespace Tests\Feature;

use App\Models\ClientRequest;
use App\Models\ManagedClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ManagedClientApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_manage_a_client_workspace_without_exposing_it_to_another_user(): void
    {
        $this->withApiUser('user', 'owner@example.com');

        $client = $this->postJson('/api/customer/clients', [
            'full_name' => 'Mueller GmbH',
            'company_name' => 'Mueller Software',
            'email' => 'mueller@example.com',
            'phone' => '+49 170 111111',
            'preferred_language' => 'de',
            'notes' => 'Communicate as part of our team.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.full_name', 'Mueller GmbH')
            ->assertJsonPath('data.open_requests_count', 0);

        $clientId = $client->json('data.id');

        $this->postJson("/api/customer/clients/{$clientId}/communications", [
            'channel' => 'call',
            'direction' => 'outbound',
            'summary' => 'Discussed the requested program changes.',
            'translated_summary' => 'Besprochene Programmänderungen.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.channel', 'call');

        $request = $this->postJson("/api/customer/clients/{$clientId}/requests", [
            'subject' => 'Prepare a price quote',
            'description' => 'Send the proposal by email.',
            'priority' => 'high',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'open')
            ->assertJsonPath('data.priority', 'high');

        $this->patchJson("/api/customer/clients/{$clientId}/requests/{$request->json('data.id')}", [
            'status' => 'completed',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $this->postJson("/api/customer/clients/{$clientId}/files", [
            'name' => 'requirements.pdf',
            'file_url' => '/storage/uploads/requirements.pdf',
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'requirements.pdf');

        $this->postJson("/api/customer/clients/{$clientId}/invoices", [
            'title' => 'Software consultation',
            'amount' => 249.50,
            'currency' => 'EUR',
            'status' => 'sent',
        ])
            ->assertCreated()
            ->assertJsonPath('data.amount', 249.5)
            ->assertJsonPath('data.status', 'sent');

        $this->getJson("/api/customer/clients/{$clientId}")
            ->assertOk()
            ->assertJsonCount(1, 'data.communications')
            ->assertJsonCount(1, 'data.requests')
            ->assertJsonCount(1, 'data.files')
            ->assertJsonCount(1, 'data.invoices')
            ->assertJsonPath('data.history.0.event_type', 'invoice_created');

        $this->withApiUser('user', 'other@example.com');
        $this
            ->getJson("/api/customer/clients/{$clientId}")
            ->assertNotFound();
    }

    public function test_client_workspace_api_is_only_available_to_customer_users(): void
    {
        $this->withApiUser('admin');

        $this->getJson('/api/customer/clients')->assertForbidden();
    }

    public function test_admin_can_review_all_client_workspaces_and_update_requests(): void
    {
        $owner = $this->withApiUser('user', 'workspace-owner@example.com');
        $client = ManagedClient::query()->create([
            'owner_user_id' => $owner->id,
            'full_name' => 'Mueller GmbH',
            'email' => 'mueller@example.com',
            'preferred_language' => 'de',
            'status' => 'active',
        ]);
        $request = ClientRequest::query()->create([
            'managed_client_id' => $client->id,
            'request_number' => 'CR-ADMIN-1',
            'subject' => 'Prepare a quote',
            'status' => 'open',
            'priority' => 'high',
        ]);

        $this->withApiUser('admin', 'admin-workspace@example.com');

        $this->getJson('/api/admin/client-workspaces')
            ->assertOk()
            ->assertJsonPath('data.0.full_name', 'Mueller GmbH')
            ->assertJsonPath('data.0.owner_email', 'workspace-owner@example.com');

        $this->getJson("/api/admin/client-workspaces/{$client->id}")
            ->assertOk()
            ->assertJsonPath('data.requests.0.number', 'CR-ADMIN-1');

        $this->patchJson("/api/admin/client-workspaces/{$client->id}/requests/{$request->id}", [
            'status' => 'in_progress',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'in_progress');
    }
}
