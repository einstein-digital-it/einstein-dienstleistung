<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CustomerFlowApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_booking_dashboard_notifications_and_payment_flow(): void
    {
        $this->withApiUser('user', 'customer@example.com');
        User::create([
            'name' => 'Admin',
            'full_name' => 'Admin',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/bookings', [
            'customer_name' => 'Customer One',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '12345',
            'service_name' => 'Forms help',
            'service_id' => 'forms_main',
            'category' => 'forms',
            'date' => '2026-07-02',
            'time' => '10:00',
            'address' => 'Frankfurt',
            'provider_id' => '7',
            'provider_name' => 'Provider One',
            'price' => 90,
            'duration_hours' => 2,
            'documents_urls' => ['/storage/uploads/doc.pdf'],
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.customer_email', 'customer@example.com')
            ->assertJsonPath('data.provider_id', '7')
            ->assertJsonPath('data.duration_hours', 2);

        $bookingId = $response->json('data.id');

        $this->assertDatabaseHas('notifications', [
            'user_email' => 'customer@example.com',
            'type' => 'booking_received',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_email' => 'admin@example.com',
            'type' => 'new_booking_request',
        ]);

        $this->getJson('/api/customer/dashboard?email=customer@example.com')
            ->assertOk()
            ->assertJsonPath('data.summary.total_bookings', 1)
            ->assertJsonPath('data.summary.open_payments', 1)
            ->assertJsonPath('data.upcoming_bookings.0.service_name', 'Forms help');

        $this->patchJson("/api/payments/bookings/{$bookingId}/status", [
            'payment_status' => 'paid',
        ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'paid');

        $this->assertDatabaseHas('notifications', [
            'user_email' => 'customer@example.com',
            'type' => 'payment_received',
        ]);
    }

    public function test_profile_preferences_notifications_and_upload_api_work(): void
    {
        $this->withApiUser('user', 'customer@example.com');
        Storage::fake('public');

        $this->getJson('/api/profile?email=customer@example.com')
            ->assertOk()
            ->assertJsonPath('data.email', 'customer@example.com')
            ->assertJsonPath('data.role', 'user');

        $this->patchJson('/api/profile', [
            'email' => 'customer@example.com',
            'full_name' => 'Updated Customer',
            'phone' => '999',
            'address' => 'Berlin',
            'preferred_language' => 'en',
        ])
            ->assertOk()
            ->assertJsonPath('data.full_name', 'Updated Customer')
            ->assertJsonPath('data.address', 'Berlin');

        $this->getJson('/api/customer/notification-preferences?email=customer@example.com')
            ->assertOk()
            ->assertJsonPath('data.user_email', 'customer@example.com');

        $this->putJson('/api/customer/notification-preferences', [
            'user_email' => 'customer@example.com',
            'booking_confirmed' => false,
            'notification_language' => 'en',
            'reminder_timing' => ['24h'],
        ])
            ->assertOk()
            ->assertJsonPath('data.booking_confirmed', false)
            ->assertJsonPath('data.notification_language', 'en');

        $notification = Notification::create([
            'user_email' => 'customer@example.com',
            'type' => 'general',
            'title_en' => 'Hello',
            'message_en' => 'Message',
            'is_read' => false,
        ]);

        $this->patchJson("/api/customer/notifications/{$notification->id}/read")
            ->assertOk()
            ->assertJsonPath('data.is_read', true);

        $this->post('/api/uploads', [
            'files' => [UploadedFile::fake()->create('document.pdf', 10, 'application/pdf')],
        ])
            ->assertOk()
            ->assertJsonCount(1, 'data.files')
            ->assertJsonPath('data.files.0.name', 'document.pdf');
    }
}
