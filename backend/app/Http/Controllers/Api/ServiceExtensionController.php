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
            ->latest()
            ->limit($limit)
            ->get();

        return response()->json(['data' => $extensions]);
    }

    public function update(Request $request, ServiceExtension $serviceExtension): JsonResponse
    {
        $data = $request->validate([
            'booking_id' => ['sometimes', 'nullable', 'exists:bookings,id'],
            'booking_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'customer_name' => ['sometimes', 'string', 'max:255'],
            'customer_email' => ['sometimes', 'email', 'max:255'],
            'service_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'provider_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(ServiceExtension::STATUSES)],
            'payment_status' => ['sometimes', Rule::in(ServiceExtension::PAYMENT_STATUSES)],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'description' => ['sometimes', 'nullable', 'string'],
            'documents_urls' => ['sometimes', 'nullable', 'array'],
            'documents_urls.*' => ['string', 'max:2048'],
        ]);

        $serviceExtension->update($data);

        return response()->json(['data' => $serviceExtension->fresh()]);
    }
}
