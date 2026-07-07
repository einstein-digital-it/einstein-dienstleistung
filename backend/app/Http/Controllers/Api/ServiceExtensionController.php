<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceExtension;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceExtensionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->integer('limit', 200), 500);

        $extensions = ServiceExtension::query()
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('payment_status'), fn ($query) => $query->where('payment_status', $request->string('payment_status')))
            ->when($request->filled('provider_id'), fn ($query) => $query->where('provider_id', $request->string('provider_id')))
            ->when($request->filled('provider_email'), fn ($query) => $query->where('provider_email', $request->string('provider_email')))
            ->when($request->filled('customer_email'), fn ($query) => $query->where('customer_email', $request->string('customer_email')))
            ->latest()
            ->limit($limit)
            ->get();

        return response()->json(['data' => $extensions]);
    }

    public function store(Request $request): JsonResponse
    {
        $extension = ServiceExtension::create($request->validate($this->rules()));

        return response()->json(['data' => $extension], 201);
    }

    public function update(Request $request, ServiceExtension $serviceExtension): JsonResponse
    {
        $data = $request->validate($this->rules(partial: true));

        $serviceExtension->update($data);

        return response()->json(['data' => $serviceExtension->fresh()]);
    }

    public function authorizePayment(ServiceExtension $serviceExtension): JsonResponse
    {
        $serviceExtension->update([
            'payment_status' => 'authorized',
            'status' => 'pending',
        ]);

        return response()->json([
            'data' => [
                'extension' => $serviceExtension->fresh(),
                'payment' => [
                    'status' => 'authorized',
                    'provider' => 'manual',
                    'message' => 'Payment authorization recorded. Connect a payment gateway here for live capture.',
                ],
            ],
        ]);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'booking_id' => ['sometimes', 'nullable', 'exists:bookings,id'],
            'booking_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'customer_name' => [$required, 'string', 'max:255'],
            'customer_email' => [$required, 'email', 'max:255'],
            'provider_id' => ['sometimes', 'nullable', 'string', 'max:255'],
            'provider_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'service_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'provider_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(ServiceExtension::STATUSES)],
            'payment_status' => ['sometimes', Rule::in(ServiceExtension::PAYMENT_STATUSES)],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'description' => ['sometimes', 'nullable', 'string'],
            'documents_urls' => ['sometimes', 'nullable', 'array'],
            'documents_urls.*' => ['string', 'max:2048'],
        ];
    }
}
