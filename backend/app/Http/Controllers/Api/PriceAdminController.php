<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PriceGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PriceAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $groups = PriceGroup::query()
            ->with('items')
            ->orderBy('sort_order')
            ->orderBy('category')
            ->get()
            ->map(fn (PriceGroup $group) => $this->serializeGroup($group));

        return response()->json(['data' => $groups]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $group = PriceGroup::create($data);
        $this->syncItems($group, $data['items'] ?? []);

        return response()->json(['data' => $this->serializeGroup($group->fresh('items'))], 201);
    }

    public function show(PriceGroup $priceGroup): JsonResponse
    {
        return response()->json(['data' => $this->serializeGroup($priceGroup->load('items'))]);
    }

    public function update(Request $request, PriceGroup $priceGroup): JsonResponse
    {
        $data = $request->validate($this->rules(partial: true));
        $priceGroup->update($data);

        if (array_key_exists('items', $data)) {
            $this->syncItems($priceGroup, $data['items']);
        }

        return response()->json(['data' => $this->serializeGroup($priceGroup->fresh('items'))]);
    }

    public function destroy(PriceGroup $priceGroup): JsonResponse
    {
        $priceGroup->delete();

        return response()->json(null, 204);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'category' => [$required, 'string', 'max:255'],
            'status' => ['sometimes', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'items' => ['sometimes', 'array'],
            'items.*.label' => ['nullable', 'string', 'max:255'],
            'items.*.label_de' => ['nullable', 'string', 'max:255'],
            'items.*.label_en' => ['nullable', 'string', 'max:255'],
            'items.*.label_tr' => ['nullable', 'string', 'max:255'],
            'items.*.label_ar' => ['nullable', 'string', 'max:255'],
            'items.*.unit_de' => ['nullable', 'string', 'max:255'],
            'items.*.unit_en' => ['nullable', 'string', 'max:255'],
            'items.*.unit_tr' => ['nullable', 'string', 'max:255'],
            'items.*.unit_ar' => ['nullable', 'string', 'max:255'],
            'items.*.price' => ['required_with:items', 'string', 'max:255'],
            'items.*.unit' => ['nullable', 'string', 'max:255'],
            'items.*.status' => ['sometimes', 'string', 'max:255'],
            'items.*.sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    private function syncItems(PriceGroup $group, array $items): void
    {
        $group->items()->delete();

        foreach (array_values($items) as $index => $item) {
            // German is the main language; fall back to any filled translation.
            $label = $item['label_de'] ?? $item['label'] ?? $item['label_en'] ?? $item['label_tr'] ?? $item['label_ar'] ?? null;
            if ($label === null || trim($label) === '') {
                continue;
            }

            $group->items()->create([
                'label' => $label,
                'label_de' => $item['label_de'] ?? $item['label'] ?? null,
                'label_en' => $item['label_en'] ?? null,
                'label_tr' => $item['label_tr'] ?? null,
                'label_ar' => $item['label_ar'] ?? null,
                'price' => $item['price'],
                'unit' => $item['unit_de'] ?? $item['unit'] ?? null,
                'unit_de' => $item['unit_de'] ?? $item['unit'] ?? null,
                'unit_en' => $item['unit_en'] ?? null,
                'unit_tr' => $item['unit_tr'] ?? null,
                'unit_ar' => $item['unit_ar'] ?? null,
                'status' => $item['status'] ?? 'active',
                'sort_order' => $item['sort_order'] ?? $index,
            ]);
        }
    }

    private function serializeGroup(PriceGroup $group): array
    {
        return [
            'id' => $group->id,
            'category' => $group->category,
            'status' => $group->status,
            'sort_order' => $group->sort_order,
            'items' => $group->items->map(fn ($item) => [
                'id' => $item->id,
                'label' => $item->label,
                'price' => $item->price,
                'unit' => $item->unit,
                'label_de' => $item->label_de,
                'label_en' => $item->label_en,
                'label_tr' => $item->label_tr,
                'label_ar' => $item->label_ar,
                'unit_de' => $item->unit_de,
                'unit_en' => $item->unit_en,
                'unit_tr' => $item->unit_tr,
                'unit_ar' => $item->unit_ar,
                'status' => $item->status,
                'sort_order' => $item->sort_order,
            ])->values(),
            'created_at' => $group->created_at?->toISOString(),
            'updated_at' => $group->updated_at?->toISOString(),
        ];
    }
}
