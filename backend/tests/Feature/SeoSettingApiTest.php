<?php

namespace Tests\Feature;

use App\Models\SeoSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoSettingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_seo_settings_can_be_created_listed_updated_and_read_by_page(): void
    {
        $this->withApiUser('admin');
        $setting = $this->postJson('/api/admin/seo-settings', [
            'page_name' => 'Home',
            'meta_title_de' => 'EinStein Home',
            'meta_description_de' => 'Home description',
            'keywords_de' => 'einstein, home',
            'priority' => 1,
            'change_frequency' => 'weekly',
            'no_index' => false,
        ])
            ->assertCreated()
            ->assertJsonPath('data.page_name', 'Home')
            ->json('data');

        $this->getJson('/api/admin/seo-settings')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.meta_title_de', 'EinStein Home');

        $this->patchJson("/api/admin/seo-settings/{$setting['id']}", [
            'meta_title_en' => 'EinStein Home EN',
            'no_index' => true,
        ])
            ->assertOk()
            ->assertJsonPath('data.meta_title_en', 'EinStein Home EN')
            ->assertJsonPath('data.no_index', true);

        $this->getJson('/api/seo-settings/page/Home')
            ->assertOk()
            ->assertJsonPath('data.page_name', 'Home')
            ->assertJsonPath('data.meta_title_en', 'EinStein Home EN');
    }

    public function test_seo_setting_can_be_deleted(): void
    {
        $this->withApiUser('admin');
        $setting = SeoSetting::create([
            'page_name' => 'Services',
            'meta_title_de' => 'Services',
        ]);

        $this->deleteJson("/api/admin/seo-settings/{$setting->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('seo_settings', [
            'page_name' => 'Services',
        ]);
    }
}
