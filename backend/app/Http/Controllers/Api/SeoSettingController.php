<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SeoSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SeoSettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = SeoSetting::query()
            ->orderBy('page_name')
            ->get()
            ->map(fn (SeoSetting $setting) => $this->serializeSetting($setting));

        return response()->json(['data' => $settings]);
    }

    public function store(Request $request): JsonResponse
    {
        $setting = SeoSetting::create($request->validate($this->rules()));

        return response()->json(['data' => $this->serializeSetting($setting)], 201);
    }

    public function show(SeoSetting $seoSetting): JsonResponse
    {
        return response()->json(['data' => $this->serializeSetting($seoSetting)]);
    }

    public function update(Request $request, SeoSetting $seoSetting): JsonResponse
    {
        $seoSetting->update($request->validate($this->rules(partial: true)));

        return response()->json(['data' => $this->serializeSetting($seoSetting->fresh())]);
    }

    public function destroy(SeoSetting $seoSetting): JsonResponse
    {
        $seoSetting->delete();

        return response()->json(null, 204);
    }

    public function byPage(string $pageName): JsonResponse
    {
        $setting = SeoSetting::query()->where('page_name', $pageName)->first();

        return response()->json(['data' => $setting ? $this->serializeSetting($setting) : null]);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        $current = request()->route('seoSetting');

        return [
            'page_name' => [$required, 'string', 'max:255', Rule::unique('seo_settings', 'page_name')->ignore($current)],
            'meta_title_de' => ['sometimes', 'nullable', 'string', 'max:255'],
            'meta_title_ar' => ['sometimes', 'nullable', 'string', 'max:255'],
            'meta_title_en' => ['sometimes', 'nullable', 'string', 'max:255'],
            'meta_description_de' => ['sometimes', 'nullable', 'string'],
            'meta_description_ar' => ['sometimes', 'nullable', 'string'],
            'meta_description_en' => ['sometimes', 'nullable', 'string'],
            'keywords_de' => ['sometimes', 'nullable', 'string'],
            'keywords_ar' => ['sometimes', 'nullable', 'string'],
            'keywords_en' => ['sometimes', 'nullable', 'string'],
            'og_image' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'canonical_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'no_index' => ['sometimes', 'boolean'],
            'priority' => ['sometimes', 'numeric', 'min:0', 'max:1'],
            'change_frequency' => ['sometimes', Rule::in(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'])],
        ];
    }

    private function serializeSetting(SeoSetting $setting): array
    {
        return [
            'id' => $setting->id,
            'page_name' => $setting->page_name,
            'meta_title_de' => $setting->meta_title_de,
            'meta_title_ar' => $setting->meta_title_ar,
            'meta_title_en' => $setting->meta_title_en,
            'meta_description_de' => $setting->meta_description_de,
            'meta_description_ar' => $setting->meta_description_ar,
            'meta_description_en' => $setting->meta_description_en,
            'keywords_de' => $setting->keywords_de,
            'keywords_ar' => $setting->keywords_ar,
            'keywords_en' => $setting->keywords_en,
            'og_image' => $setting->og_image,
            'canonical_url' => $setting->canonical_url,
            'no_index' => $setting->no_index,
            'priority' => (float) $setting->priority,
            'change_frequency' => $setting->change_frequency,
            'created_at' => $setting->created_at?->toISOString(),
            'updated_at' => $setting->updated_at?->toISOString(),
        ];
    }
}
