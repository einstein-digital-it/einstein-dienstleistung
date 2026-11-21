<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** The services that used to be written in the website code live in the table now. */
class DefaultServicesTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_website_services_are_in_the_table_in_six_languages(): void
    {
        $this->assertSame(
            ['office', 'secretariat', 'forms', 'admin', 'coordination', 'mercosur', 'print', 'dokumentabo', 'bueromanagement'],
            Service::orderBy('sort_order')->pluck('category')->all()
        );

        $forms = Service::where('category', 'forms')->first();
        foreach (['de', 'ar', 'en', 'tr', 'es', 'uk'] as $lang) {
            $this->assertNotEmpty($forms->{"name_$lang"}, "name_$lang");
            $this->assertNotEmpty($forms->{"description_$lang"}, "description_$lang");
            $this->assertNotEmpty($forms->features[$lang] ?? [], "features.$lang");
        }
        $this->assertSame($forms->name_de, $forms->name);

        $this->getJson('/api/public/services')
            ->assertOk()
            ->assertJsonCount(9, 'data')
            ->assertJsonPath('data.0.category', 'office');
    }

    public function test_the_admin_edits_hides_and_deletes_a_service(): void
    {
        $this->withApiUser('admin');
        $print = Service::where('category', 'print')->first();

        $this->patchJson("/api/admin/services/{$print->id}", [
            'name_tr' => 'Baskı',
            'features' => ['de' => ['Kopien', 'Stempel'], 'ar' => []],
        ])->assertOk()
            ->assertJsonPath('data.name_tr', 'Baskı')
            ->assertJsonPath('data.features.de.1', 'Stempel');

        $this->patchJson("/api/admin/services/{$print->id}", ['status' => 'inactive'])->assertOk();
        $this->getJson('/api/public/services')->assertOk()->assertJsonCount(8, 'data');

        $this->deleteJson("/api/admin/services/{$print->id}")->assertNoContent();
        $this->assertDatabaseMissing('services', ['category' => 'print']);
    }

    public function test_a_new_service_with_its_own_category_shows_on_the_website(): void
    {
        $this->withApiUser('admin');

        $this->postJson('/api/admin/services', [
            'name_de' => 'Übersetzung',
            'name_ar' => 'ترجمة',
            'category' => 'uebersetzung',
            'price_from' => 25,
            'price_unit' => 'service',
            'status' => 'active',
            'sort_order' => 200,
        ])->assertCreated()->assertJsonPath('data.category', 'uebersetzung');

        $this->getJson('/api/public/services')->assertOk()->assertJsonPath('data.9.name_ar', 'ترجمة');
    }
}
