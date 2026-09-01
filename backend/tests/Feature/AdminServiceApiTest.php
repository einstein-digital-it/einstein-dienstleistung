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
        $this->withApiUser('admin');
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
        $this->withApiUser('admin');
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

    public function test_a_service_can_be_created_with_localized_names_and_descriptions(): void
    {
        $this->withApiUser('admin');

        $this->postJson('/api/admin/services', [
            'name_de' => 'Formularhilfe',
            'name_ar' => 'دعم النماذج',
            'name_en' => 'Form Support',
            'description_de' => 'Hilfe bei Formularen.',
            'description_ar' => 'مساعدة في تعبئة النماذج.',
            'description_en' => 'Help with forms.',
            'category' => 'forms',
            'price_from' => 35,
            'price_unit' => 'hour',
            'status' => 'active',
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Formularhilfe')
            ->assertJsonPath('data.name_ar', 'دعم النماذج')
            ->assertJsonPath('data.description_en', 'Help with forms.');

        $this->assertDatabaseHas('services', [
            'name' => 'Formularhilfe',
            'name_en' => 'Form Support',
        ]);
    }

    public function test_a_service_can_be_deleted(): void
    {
        $this->withApiUser('admin');
        $service = Service::create([
            'name' => 'Disposable Service',
            'category' => 'office',
            'status' => 'draft',
        ]);

        $this->deleteJson("/api/admin/services/{$service->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('services', ['id' => $service->id]);
    }
}
