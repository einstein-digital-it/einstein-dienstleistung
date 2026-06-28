<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminServiceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_services_can_be_listed_with_booking_counts(): void
    {
        Service::create([
            'name' => 'Form Help',
            'category' => 'forms',
            'description' => 'Help with forms.',
            'price_from' => 40,
            'price_unit' => 'Stunde',
            'status' => 'active',
        ]);

        Booking::create([
            'booking_number' => 'ES-SERVICE-001',
            'customer_name' => 'Service Customer',
            'customer_email' => 'service@example.com',
            'category' => 'forms',
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ]);

        $this->getJson('/api/admin/services')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Form Help')
            ->assertJsonPath('data.0.category', 'forms')
            ->assertJsonPath('data.0.bookings', 1);
    }

    public function test_services_can_be_created_and_updated(): void
    {
        $service = $this->postJson('/api/admin/services', [
            'name' => 'Office Support',
            'category' => 'office',
            'description' => 'Office tasks.',
            'price_from' => 45,
            'price_unit' => 'Stunde',
            'status' => 'draft',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft')
            ->json('data');

        $this->patchJson("/api/admin/services/{$service['id']}", [
            'status' => 'active',
            'price_from' => 50,
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'active')
            ->assertJsonPath('data.price_from', 50);
    }
}
