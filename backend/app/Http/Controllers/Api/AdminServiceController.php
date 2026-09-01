<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $services = Service::query()
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('category'), fn ($query) => $query->where('category', $request->string('category')))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Service $service) => $this->serializeService($service));

        return response()->json(['data' => $services]);
    }

    public function store(Request $request): JsonResponse
    {
        $service = Service::create($this->normalizeForPersistence(
            $request->validate($this->rules())
        ));

        return response()->json(['data' => $this->serializeService($service)], 201);
    }

    public function show(Service $service): JsonResponse
    {
        return response()->json(['data' => $this->serializeService($service)]);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        $service->update($this->normalizeForPersistence(
            $request->validate($this->rules(partial: true))
        ));

        return response()->json(['data' => $this->serializeService($service->fresh())]);
    }

    public function destroy(Service $service): JsonResponse
    {
        $service->delete();

        return response()->json(null, 204);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'name' => [$partial ? 'sometimes' : 'required_without:name_de', 'nullable', 'string', 'max:255'],
            'name_de' => [$partial ? 'sometimes' : 'required_without:name', 'nullable', 'string', 'max:255'],
            'name_ar' => ['sometimes', 'nullable', 'string', 'max:255'],
            'name_en' => ['sometimes', 'nullable', 'string', 'max:255'],
            'category' => [$required, 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'description_de' => ['sometimes', 'nullable', 'string'],
            'description_ar' => ['sometimes', 'nullable', 'string'],
            'description_en' => ['sometimes', 'nullable', 'string'],
            'price_from' => ['sometimes', 'numeric', 'min:0'],
            'price_unit' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(Service::STATUSES)],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    private function normalizeForPersistence(array $data): array
    {
        if (! empty($data['name_de'])) {
            $data['name'] = $data['name_de'];
        }

        if (array_key_exists('description_de', $data) && ! array_key_exists('description', $data)) {
            $data['description'] = $data['description_de'];
        }

        return $data;
    }

    private function serializeService(Service $service): array
    {
        return [
            'id' => $service->id,
            'name' => $service->name,
            'name_de' => $service->name_de,
            'name_ar' => $service->name_ar,
            'name_en' => $service->name_en,
            'category' => $service->category,
            'description' => $service->description,
            'description_de' => $service->description_de,
            'description_ar' => $service->description_ar,
            'description_en' => $service->description_en,
            'price_from' => (float) $service->price_from,
            'price_unit' => $service->price_unit,
            'status' => $service->status,
            'sort_order' => $service->sort_order,
            'bookings' => Booking::query()->where('category', $service->category)->count(),
            'created_at' => $service->created_at?->toISOString(),
            'updated_at' => $service->updated_at?->toISOString(),
        ];
    }
}
