<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\ServiceExtension;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RevenueReportApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_revenue_report_returns_bookings_extensions_and_summary(): void
    {
        Booking::create([
            'booking_number' => 'ES-REV-001',
            'customer_name' => 'Revenue Customer',
            'customer_email' => 'revenue@example.com',
            'category' => 'forms',
            'date' => '2026-06-10',
            'status' => 'completed',
            'payment_status' => 'paid',
            'price' => 100,
        ]);

        ServiceExtension::create([
            'booking_number' => 'ES-REV-001',
            'customer_name' => 'Revenue Customer',
            'customer_email' => 'revenue@example.com',
            'service_name' => 'Extra document',
            'payment_status' => 'paid',
            'status' => 'completed',
            'amount' => 25,
        ]);

        $this->getJson('/api/admin/revenue-reports?year=2026')
            ->assertOk()
            ->assertJsonCount(1, 'data.bookings')
            ->assertJsonCount(1, 'data.extensions')
            ->assertJsonPath('data.summary.booking_revenue', 100)
            ->assertJsonPath('data.summary.total_revenue', 125);
    }
}
