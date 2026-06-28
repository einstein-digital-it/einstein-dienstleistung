<?php

namespace Tests\Feature;

use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentAdminApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_payments_can_be_listed_and_status_can_be_updated(): void
    {
        $booking = Booking::create([
            'booking_number' => 'ES-PAY-001',
            'customer_name' => 'Pay Customer',
            'customer_email' => 'pay@example.com',
            'service_name' => 'Office Support',
            'payment_status' => 'unpaid',
            'status' => 'confirmed',
            'price' => 99,
        ]);

        $this->getJson('/api/admin/payments')
            ->assertOk()
            ->assertJsonPath('data.0.booking_number', 'ES-PAY-001')
            ->assertJsonPath('data.0.payment_status', 'unpaid');

        $this->patchJson("/api/admin/payments/{$booking->id}/status", [
            'payment_status' => 'paid',
        ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'paid');
    }

    public function test_payments_can_be_refunded_and_unpaid_bookings_can_be_deleted(): void
    {
        $paid = Booking::create([
            'booking_number' => 'ES-PAY-002',
            'customer_name' => 'Paid Customer',
            'customer_email' => 'paid@example.com',
            'payment_status' => 'paid',
            'status' => 'completed',
            'price' => 120,
        ]);

        $unpaid = Booking::create([
            'booking_number' => 'ES-PAY-003',
            'customer_name' => 'Unpaid Customer',
            'customer_email' => 'unpaid@example.com',
            'payment_status' => 'unpaid',
            'status' => 'pending',
            'price' => 80,
        ]);

        $this->patchJson("/api/admin/payments/{$paid->id}/refund", [
            'refund_reason' => 'Customer request',
        ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'refunded');

        $this->deleteJson("/api/admin/payments/{$unpaid->id}/delete-unpaid")
            ->assertNoContent();

        $this->assertDatabaseMissing('bookings', [
            'booking_number' => 'ES-PAY-003',
        ]);
    }
}
