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
            'items.*.label' => ['required_with:items', 'string', 'max:255'],
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
            $group->items()->create([
                'label' => $item['label'],
                'price' => $item['price'],
                'unit' => $item['unit'] ?? null,
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
                'status' => $item->status,
                'sort_order' => $item->sort_order,
            ])->values(),
            'created_at' => $group->created_at?->toISOString(),
            'updated_at' => $group->updated_at?->toISOString(),
        ];
    }
}
