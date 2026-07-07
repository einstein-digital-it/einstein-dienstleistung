<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\PriceGroup;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProviderPublicDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_provider_dashboard_actions_profile_and_documents_work(): void
    {
        $this->withApiUser('provider', 'provider@example.com');
        $provider = ServiceProvider::create([
            'full_name' => 'Provider One',
            'email' => 'provider@example.com',
            'phone' => '123',
            'categories' => ['forms'],
            'status' => 'approved',
            'hourly_rate' => 40,
        ]);

        $booking = Booking::create([
            'booking_number' => 'ES-PROVIDER-001',
            'customer_name' => 'Customer',
            'customer_email' => 'customer@example.com',
            'category' => 'forms',
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'price' => 80,
        ]);

        $this->getJson('/api/provider/dashboard?email=provider@example.com')
            ->assertOk()
            ->assertJsonPath('data.provider.email', 'provider@example.com')
            ->assertJsonPath('data.bookings.0.booking_number', 'ES-PROVIDER-001');

        $this->patchJson("/api/provider/bookings/{$booking->id}/action", [
            'provider_id' => $provider->id,
            'action' => 'accept',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('data.confirmed_by_provider_email', 'provider@example.com');

        $this->patchJson("/api/provider/bookings/{$booking->id}/documents", [
            'provider_id' => $provider->id,
            'document_urls' => ['/storage/uploads/result.pdf'],
        ])
            ->assertOk()
            ->assertJsonPath('data.provider_documents_urls.0', '/storage/uploads/result.pdf');

        $this->patchJson("/api/provider/bookings/{$booking->id}/action", [
            'provider_id' => $provider->id,
            'action' => 'complete',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $this->patchJson("/api/provider/profile/{$provider->id}", [
            'phone' => '999',
            'availability' => ['monday'],
            'qualifications' => 'Updated',
        ])
            ->assertOk()
            ->assertJsonPath('data.phone', '999')
            ->assertJsonPath('data.availability.0', 'monday');
    }

    public function test_public_content_and_admin_dashboard_return_live_data(): void
    {
        $this->withApiUser('admin');
        User::create([
            'name' => 'Admin',
            'full_name' => 'Admin',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        Service::create([
            'name' => 'Forms help',
            'category' => 'forms',
            'price_from' => 40,
            'status' => 'active',
        ]);

        $group = PriceGroup::create([
            'category' => 'forms',
            'status' => 'active',
        ]);
        $group->items()->create([
            'label' => 'Forms help',
            'price' => '40 EUR',
            'unit' => '/ hour',
            'status' => 'active',
        ]);

        Booking::create([
            'booking_number' => 'ES-DASH-001',
            'customer_name' => 'Customer',
            'customer_email' => 'customer@example.com',
            'status' => 'completed',
            'payment_status' => 'paid',
            'price' => 100,
        ]);

        $this->getJson('/api/public/services')
            ->assertOk()
            ->assertJsonPath('data.0.category', 'forms');

        $this->getJson('/api/public/pricing')
            ->assertOk()
            ->assertJsonPath('data.0.items.0.label', 'Forms help');

        $this->getJson('/api/public/home')
            ->assertOk()
            ->assertJsonPath('data.summary.active_services', 1);

        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('data.stats.total_bookings', 1)
            ->assertJsonPath('data.stats.revenue', 100);
    }
}
