<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\ServiceExtension;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_bookings_can_be_listed_and_updated(): void
    {
        $this->withApiUser('admin');
        $booking = Booking::create([
            'booking_number' => 'ES-TEST-001',
            'customer_name' => 'Test Customer',
            'customer_email' => 'customer@example.com',
            'status' => 'pending',
            'payment_status' => 'authorized',
            'price' => 45,
        ]);

        $this->getJson('/api/bookings')
            ->assertOk()
            ->assertJsonPath('data.0.booking_number', 'ES-TEST-001')
            ->assertJsonPath('data.0.status', 'pending')
            ->assertJsonPath('data.0.payment_status', 'authorized');

        $this->patchJson("/api/bookings/{$booking->id}", [
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('data.payment_status', 'paid');
    }

    public function test_invalid_booking_status_is_rejected(): void
    {
        $this->withApiUser('admin');
        $booking = Booking::create([
            'booking_number' => 'ES-TEST-002',
            'customer_name' => 'Test Customer',
            'customer_email' => 'customer@example.com',
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ]);

        $this->patchJson("/api/bookings/{$booking->id}", [
            'status' => 'unknown',
        ])->assertUnprocessable();
    }

    public function test_service_extensions_can_be_listed_and_updated(): void
    {
        $this->withApiUser('admin');
        $extension = ServiceExtension::create([
            'booking_number' => 'ES-TEST-003',
            'customer_name' => 'Test Customer',
            'customer_email' => 'customer@example.com',
            'status' => 'pending',
            'payment_status' => 'authorized',
            'amount' => 15,
        ]);

        $this->getJson('/api/service-extensions')
            ->assertOk()
            ->assertJsonPath('data.0.status', 'pending')
            ->assertJsonPath('data.0.payment_status', 'authorized');

        $this->patchJson("/api/service-extensions/{$extension->id}", [
            'status' => 'accepted',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');
    }

    public function test_booking_reports_can_be_listed_and_confirmed(): void
    {
        $this->withApiUser('admin');
        $booking = Booking::create([
            'booking_number' => 'ES-REPORT-001',
            'customer_name' => 'Report Customer',
            'customer_email' => 'report@example.com',
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'required_documents_hint' => 'Passport and current documents.',
        ]);

        $this->getJson('/api/reports/bookings')
            ->assertOk()
            ->assertJsonPath('data.summary.total', 1)
            ->assertJsonPath('data.summary.pending', 1)
            ->assertJsonPath('data.bookings.0.booking_number', 'ES-REPORT-001')
            ->assertJsonPath('data.bookings.0.required_documents_hint', 'Passport and current documents.');

        $this->patchJson("/api/reports/bookings/{$booking->id}/confirm", [
            'confirmed_by_provider_id' => 'admin',
            'confirmed_by_provider_name' => 'Admin',
            'confirmed_by_provider_email' => 'admin@example.com',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('data.confirmed_by_provider_name', 'Admin')
            ->assertJsonPath('data.confirmed_by_provider_email', 'admin@example.com');
    }
}
