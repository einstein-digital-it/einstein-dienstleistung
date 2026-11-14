<?php

namespace Tests\Feature;

use App\Models\PriceGroup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PriceAdminApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_price_groups_can_be_created_listed_and_updated_with_items(): void
    {
        $this->withApiUser('admin');
        $group = $this->postJson('/api/admin/price-groups', [
            'category' => 'Behoerden & Formularhilfe',
            'items' => [
                ['label' => 'Standard Formularhilfe', 'price' => '40 EUR', 'unit' => '/ Stunde'],
                ['label' => 'Dokumentenpruefung', 'price' => '25 EUR', 'unit' => '/ Vorgang'],
            ],
        ])
            ->assertCreated()
            ->assertJsonPath('data.items.0.label', 'Standard Formularhilfe')
            ->json('data');

        $this->getJson('/api/admin/price-groups')
            ->assertOk()
            ->assertJsonPath('data.0.category', 'Behoerden & Formularhilfe')
            ->assertJsonCount(2, 'data.0.items');

        $this->patchJson("/api/admin/price-groups/{$group['id']}", [
            'items' => [
                ['label' => 'Express Formularhilfe', 'price' => '60 EUR', 'unit' => '/ Stunde'],
            ],
        ])
            ->assertOk()
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.label', 'Express Formularhilfe');

        $this->assertDatabaseHas('price_items', [
            'label' => 'Express Formularhilfe',
        ]);
    }

    public function test_price_group_deletion_removes_items(): void
    {
        $this->withApiUser('admin');
        $group = PriceGroup::create(['category' => 'Print']);
        $group->items()->create(['label' => 'Print page', 'price' => '1 EUR']);

        $this->deleteJson("/api/admin/price-groups/{$group->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('price_items', [
            'label' => 'Print page',
        ]);
    }

    public function test_price_items_store_four_languages(): void
    {
        $this->withApiUser('admin');
        $this->postJson('/api/admin/price-groups', [
            'category' => 'tutoring',
            'items' => [[
                'label_de' => 'Einzelunterricht', 'label_en' => 'Private lesson',
                'label_tr' => 'Özel ders', 'label_ar' => 'درس فردي',
                'price' => '25 EUR',
                'unit_de' => 'pro Stunde', 'unit_en' => 'per hour',
                'unit_tr' => 'saat başı', 'unit_ar' => 'بالساعة',
            ]],
        ])
            ->assertCreated()
            ->assertJsonPath('data.items.0.label', 'Einzelunterricht')
            ->assertJsonPath('data.items.0.label_tr', 'Özel ders')
            ->assertJsonPath('data.items.0.label_ar', 'درس فردي')
            ->assertJsonPath('data.items.0.unit_en', 'per hour');
    }
}
