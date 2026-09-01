<?php

namespace Tests\Feature;

use App\Models\CustomerRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerRequestApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_requests_can_be_created_listed_accepted_and_rejected(): void
    {
        $this->withApiUser('admin');
        $response = $this->postJson('/api/customer-requests', [
            'customer_name' => 'Customer One',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '12345',
            'service_name' => 'Forms help',
            'category' => 'forms',
            'date' => '2026-07-01',
            'time' => '10:30',
            'address' => 'Frankfurt',
            'price' => 85,
            'status' => 'new',
            'description' => 'Document review',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.customer_name', 'Customer One')
            ->assertJsonPath('data.status', 'new');

        $requestId = $response->json('data.id');

        $this->getJson('/api/customer-requests?status=all')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.service_name', 'Forms help');

        $this->patchJson("/api/customer-requests/{$requestId}/accept")
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');

        $this->patchJson("/api/customer-requests/{$requestId}/reject")
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');
    }

    public function test_customer_requests_can_be_updated_and_deleted(): void
    {
        $this->withApiUser('admin');
        $customerRequest = CustomerRequest::create([
            'request_number' => 'CR-TEST',
            'customer_name' => 'Original',
            'status' => 'new',
        ]);

        $this->patchJson("/api/customer-requests/{$customerRequest->id}", [
            'customer_name' => 'Updated',
            'status' => 'reviewing',
        ])
            ->assertOk()
            ->assertJsonPath('data.customer_name', 'Updated')
            ->assertJsonPath('data.status', 'reviewing');

        $this->deleteJson("/api/customer-requests/{$customerRequest->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('customer_requests', [
            'id' => $customerRequest->id,
        ]);
    }
}
