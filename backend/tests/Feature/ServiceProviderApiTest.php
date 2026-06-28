<?php

namespace Tests\Feature;

use App\Models\ServiceProvider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceProviderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_provider_applications_can_be_listed_approved_and_rejected(): void
    {
        $provider = ServiceProvider::create([
            'full_name' => 'Provider One',
            'email' => 'provider@example.com',
            'phone' => '12345',
            'categories' => ['forms'],
            'languages' => ['Deutsch', 'English'],
            'status' => 'pending',
        ]);

        $this->getJson('/api/admin/provider-applications?status=pending')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'provider@example.com')
            ->assertJsonPath('data.0.status', 'pending');

        $this->patchJson("/api/admin/provider-applications/{$provider->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.login_enabled', true);

        $this->assertDatabaseHas('users', [
            'email' => 'provider@example.com',
            'role' => 'provider',
        ]);

        $rejected = ServiceProvider::create([
            'full_name' => 'Provider Two',
            'email' => 'rejected@example.com',
            'status' => 'pending',
        ]);

        $this->patchJson("/api/admin/provider-applications/{$rejected->id}/reject")
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.login_enabled', false);
    }

    public function test_providers_can_be_listed_and_welcome_email_can_be_requested(): void
    {
        $provider = ServiceProvider::create([
            'full_name' => 'Approved Provider',
            'email' => 'approved@example.com',
            'status' => 'approved',
            'documents_urls' => ['https://example.com/doc.pdf'],
        ]);

        $this->getJson('/api/admin/providers?status=all')
            ->assertOk()
            ->assertJsonPath('data.0.full_name', 'Approved Provider')
            ->assertJsonPath('data.0.documents', 1);

        $this->postJson("/api/admin/provider-applications/{$provider->id}/welcome-email-request")
            ->assertOk()
            ->assertJsonPath('data.email', 'approved@example.com');

        $this->assertNotNull($provider->fresh()->welcome_email_requested_at);
    }

    public function test_provider_application_fields_can_be_created_and_shown(): void
    {
        $response = $this->postJson('/api/admin/providers', [
            'full_name' => 'Applicant Provider',
            'email' => 'applicant@example.com',
            'phone' => '55555',
            'address' => 'Frankfurt',
            'bio_de' => 'Experienced provider',
            'experience_years' => 4,
            'service_area' => 'Frankfurt',
            'availability' => ['monday', 'friday'],
            'working_hours_start' => '09:00',
            'working_hours_end' => '17:00',
            'categories' => ['forms'],
            'languages' => ['Deutsch', 'English'],
            'qualifications' => 'Certificates',
            'documents_urls' => ['https://example.com/doc.pdf'],
            'status' => 'pending',
            'notes' => 'en',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.email', 'applicant@example.com')
            ->assertJsonPath('data.address', 'Frankfurt')
            ->assertJsonPath('data.availability.0', 'monday')
            ->assertJsonPath('data.working_hours_start', '09:00');

        $providerId = $response->json('data.id');

        $this->getJson("/api/admin/providers/{$providerId}")
            ->assertOk()
            ->assertJsonPath('data.full_name', 'Applicant Provider')
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.notes', 'en');
    }
}
