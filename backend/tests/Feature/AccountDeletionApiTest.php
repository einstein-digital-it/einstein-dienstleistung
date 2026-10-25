<?php

namespace Tests\Feature;

use App\Models\AuthSession;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountDeletionApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_delete_own_account_and_bookings_are_kept(): void
    {
        $user = $this->withApiUser('user', 'leaving@example.com');
        Notification::create([
            'user_email' => 'leaving@example.com',
            'type' => 'booking_received',
            'title_en' => 'Booking received',
            'message_en' => 'Thanks',
        ]);
        $booking = Booking::create([
            'booking_number' => 'ES-DEL-001',
            'customer_name' => 'Leaving Customer',
            'customer_email' => 'leaving@example.com',
            'service_name' => 'Forms help',
            'payment_status' => 'paid',
            'status' => 'completed',
            'price' => 40,
        ]);

        $this->deleteJson('/api/auth/account', ['password' => 'wrong-password'])
            ->assertStatus(422);
        $this->assertDatabaseHas('users', ['id' => $user->id]);

        $this->deleteJson('/api/auth/account', ['password' => 'secret123'])
            ->assertNoContent();

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertSame(0, AuthSession::query()->where('user_id', $user->id)->count());
        $this->assertDatabaseMissing('notifications', ['user_email' => 'leaving@example.com']);
        // Invoices/bookings must be retained for accounting.
        $this->assertDatabaseHas('bookings', ['id' => $booking->id]);

        // The old token no longer works.
        $this->getJson('/api/profile')->assertUnauthorized();
    }

    public function test_account_with_active_document_subscription_cannot_be_deleted(): void
    {
        $user = $this->withApiUser('user', 'abo@example.com');
        Booking::create([
            'booking_number' => 'ES-ABO-001',
            'customer_name' => 'Abo Customer',
            'customer_email' => 'abo@example.com',
            'service_name' => 'Dokumenten-Abo',
            'category' => 'dokumentabo',
            'payment_status' => 'paid',
            'status' => 'confirmed',
            'price' => 49,
            'stripe_subscription_id' => 'sub_test_123',
        ]);

        $this->deleteJson('/api/auth/account', ['password' => 'secret123'])
            ->assertStatus(409)
            ->assertJsonPath('code', 'active_subscription');

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_staff_accounts_cannot_use_self_deletion(): void
    {
        $admin = $this->withApiUser('admin');

        $this->deleteJson('/api/auth/account', ['password' => 'secret123'])
            ->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
        $this->assertInstanceOf(User::class, $admin->fresh());
    }
}
