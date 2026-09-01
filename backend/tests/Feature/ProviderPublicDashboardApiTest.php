<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Notification;
use App\Models\ServiceExtension;
use App\Models\PriceGroup;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProviderPublicDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_provider_dashboard_actions_profile_and_documents_work(): void
    {
        $user = $this->withApiUser('provider', 'provider@example.com');
        $provider = ServiceProvider::create([
            'user_id' => $user->id,
            'full_name' => 'Provider One',
            'email' => 'provider@example.com',
            'phone' => '123',
            'categories' => ['forms'],
            'status' => 'approved',
            'login_enabled' => true,
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
            'action' => 'start',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'in_progress');

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

    public function test_provider_login_requires_an_enabled_approved_provider(): void
    {
        $user = User::create([
            'name' => 'Provider User',
            'full_name' => 'Provider User',
            'email' => 'provider-login@example.com',
            'role' => 'provider',
            'is_active' => true,
            'password' => Hash::make('secret123'),
        ]);

        $provider = ServiceProvider::create([
            'user_id' => $user->id,
            'full_name' => 'Provider User',
            'email' => $user->email,
            'status' => 'approved',
            'login_enabled' => true,
        ]);

        $this->postJson('/api/auth/provider/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.role', 'provider')
            ->assertJsonPath('data.provider.id', $provider->id)
            ->assertJsonPath('data.provider.login_enabled', true)
            ->assertJsonStructure(['data' => ['session' => ['token']]]);

        $provider->update(['login_enabled' => false]);

        $this->postJson('/api/auth/provider/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ])->assertUnprocessable();
    }

    public function test_provider_cannot_access_another_provider_data(): void
    {
        $providerUser = $this->withApiUser('provider', 'first-provider@example.com');
        $provider = ServiceProvider::create([
            'user_id' => $providerUser->id,
            'full_name' => 'First Provider',
            'email' => $providerUser->email,
            'categories' => ['forms'],
            'status' => 'approved',
            'login_enabled' => true,
        ]);

        $otherUser = User::create([
            'name' => 'Second Provider',
            'full_name' => 'Second Provider',
            'email' => 'second-provider@example.com',
            'role' => 'provider',
            'is_active' => true,
            'password' => Hash::make('secret123'),
        ]);
        $otherProvider = ServiceProvider::create([
            'user_id' => $otherUser->id,
            'full_name' => 'Second Provider',
            'email' => $otherUser->email,
            'categories' => ['office'],
            'status' => 'approved',
            'login_enabled' => true,
        ]);
        $otherBooking = Booking::create([
            'booking_number' => 'ES-PROVIDER-PRIVATE',
            'customer_name' => 'Customer',
            'customer_email' => 'customer@example.com',
            'category' => 'office',
            'provider_id' => (string) $otherProvider->id,
            'confirmed_by_provider_id' => (string) $otherProvider->id,
            'confirmed_by_provider_email' => $otherProvider->email,
            'status' => 'confirmed',
            'payment_status' => 'unpaid',
        ]);

        $this->getJson('/api/provider/dashboard?email='.$otherProvider->email)
            ->assertOk()
            ->assertJsonPath('data.provider.id', $provider->id)
            ->assertJsonCount(0, 'data.bookings');

        $this->patchJson("/api/provider/bookings/{$otherBooking->id}/action", [
            'provider_id' => $otherProvider->id,
            'action' => 'complete',
        ])->assertForbidden();
    }

    public function test_provider_can_read_only_its_own_notifications(): void
    {
        $user = $this->withApiUser('provider', 'provider-notifications@example.com');
        ServiceProvider::create([
            'user_id' => $user->id,
            'full_name' => 'Provider Notifications',
            'email' => $user->email,
            'status' => 'approved',
            'login_enabled' => true,
        ]);
        $own = Notification::create([
            'user_email' => $user->email,
            'type' => 'new_booking_request',
            'title_en' => 'New request',
            'is_read' => false,
        ]);
        Notification::create([
            'user_email' => 'other-provider@example.com',
            'type' => 'new_booking_request',
            'title_en' => 'Private request',
            'is_read' => false,
        ]);

        $this->getJson('/api/provider/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $own->id);

        $this->patchJson("/api/provider/notifications/{$own->id}/read")
            ->assertOk()
            ->assertJsonPath('data.is_read', true);
    }

    public function test_provider_can_upload_a_document_file(): void
    {
        $this->withApiUser('provider', 'provider-upload@example.com');
        Storage::fake('public');

        $this->post('/api/uploads', [
            'files' => [UploadedFile::fake()->create('provider-license.pdf', 12, 'application/pdf')],
        ])
            ->assertOk()
            ->assertJsonPath('data.files.0.name', 'provider-license.pdf')
            ->assertJsonPath('data.files.0.mime_type', 'application/pdf');
    }

    public function test_new_matching_booking_creates_a_provider_notification(): void
    {
        $providerUser = User::create([
            'name' => 'Notified Provider',
            'full_name' => 'Notified Provider',
            'email' => 'notified-provider@example.com',
            'role' => 'provider',
            'is_active' => true,
            'password' => Hash::make('secret123'),
        ]);
        ServiceProvider::create([
            'user_id' => $providerUser->id,
            'full_name' => 'Notified Provider',
            'email' => $providerUser->email,
            'categories' => ['forms'],
            'status' => 'approved',
            'login_enabled' => true,
        ]);
        $this->withApiUser('user', 'new-customer@example.com');

        $this->postJson('/api/bookings', [
            'customer_name' => 'New Customer',
            'customer_email' => 'new-customer@example.com',
            'category' => 'forms',
            'status' => 'pending',
        ])->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'user_email' => $providerUser->email,
            'type' => 'new_booking_request',
            'is_read' => false,
        ]);
    }

    public function test_provider_decline_releases_booking_for_other_providers(): void
    {
        $firstUser = $this->withApiUser('provider', 'first-decline@example.com');
        $firstProvider = ServiceProvider::create([
            'user_id' => $firstUser->id,
            'full_name' => 'First Provider',
            'email' => $firstUser->email,
            'categories' => ['forms'],
            'status' => 'approved',
            'login_enabled' => true,
        ]);
        $booking = Booking::create([
            'booking_number' => 'ES-DECLINE-001',
            'customer_name' => 'Customer',
            'customer_email' => 'customer@example.com',
            'category' => 'forms',
            'status' => 'pending',
        ]);

        $this->patchJson("/api/provider/bookings/{$booking->id}/action", [
            'provider_id' => $firstProvider->id,
            'action' => 'decline',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.provider_declined_ids.0', (string) $firstProvider->id);

        $this->getJson('/api/provider/dashboard')
            ->assertOk()
            ->assertJsonCount(0, 'data.bookings');

        $secondUser = $this->withApiUser('provider', 'second-decline@example.com');
        ServiceProvider::create([
            'user_id' => $secondUser->id,
            'full_name' => 'Second Provider',
            'email' => $secondUser->email,
            'categories' => ['forms'],
            'status' => 'approved',
            'login_enabled' => true,
        ]);
        $this->getJson('/api/provider/dashboard')
            ->assertOk()
            ->assertJsonPath('data.bookings.0.id', $booking->id);
    }

    public function test_provider_can_edit_cancel_extensions_and_read_earnings(): void
    {
        $user = $this->withApiUser('provider', 'earnings-provider@example.com');
        $provider = ServiceProvider::create([
            'user_id' => $user->id,
            'full_name' => 'Earnings Provider',
            'email' => $user->email,
            'status' => 'approved',
            'login_enabled' => true,
        ]);
        $booking = Booking::create([
            'booking_number' => 'ES-EARN-001',
            'customer_name' => 'Customer',
            'customer_email' => 'customer@example.com',
            'provider_id' => (string) $provider->id,
            'confirmed_by_provider_id' => (string) $provider->id,
            'status' => 'completed',
            'payment_status' => 'paid',
            'price' => 120,
            'date' => now()->toDateString(),
            'invoice_url' => '/storage/invoices/ES-EARN-001.pdf',
        ]);
        $extension = ServiceExtension::create([
            'booking_id' => $booking->id,
            'booking_number' => $booking->booking_number,
            'customer_name' => 'Customer',
            'customer_email' => 'customer@example.com',
            'provider_id' => (string) $provider->id,
            'provider_email' => $provider->email,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'amount' => 30,
        ]);

        $this->patchJson("/api/service-extensions/{$extension->id}", [
            'amount' => 45,
            'description' => 'Extended work',
        ])
            ->assertOk()
            ->assertJsonPath('data.amount', '45.00');

        $this->patchJson("/api/service-extensions/{$extension->id}", [
            'status' => 'cancelled',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        ServiceExtension::create([
            'booking_id' => $booking->id,
            'booking_number' => $booking->booking_number,
            'customer_name' => 'Customer',
            'customer_email' => 'customer@example.com',
            'provider_id' => (string) $provider->id,
            'provider_email' => $provider->email,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'amount' => 30,
        ]);

        $this->getJson('/api/provider/earnings')
            ->assertOk()
            ->assertJsonPath('data.summary.total_earned', 150)
            ->assertJsonPath('data.summary.paid_amount', 120)
            ->assertJsonPath('data.summary.pending_amount', 30)
            ->assertJsonPath('data.items.0.invoice_url', '/storage/invoices/ES-EARN-001.pdf');
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
