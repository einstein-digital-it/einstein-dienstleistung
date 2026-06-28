<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->integer('limit', 200), 500);

        $bookings = Booking::query()
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('payment_status'), fn ($query) => $query->where('payment_status', $request->string('payment_status')))
            ->latest()
            ->limit($limit)
            ->get();

        return response()->json(['data' => $bookings]);
    }

    public function show(Booking $booking): JsonResponse
    {
        return response()->json(['data' => $booking]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $booking = Booking::create($data);

        return response()->json(['data' => $booking], 201);
    }

    public function update(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate($this->rules(partial: true));
        $booking->update($data);

        return response()->json(['data' => $booking->fresh()]);
    }

    public function destroy(Booking $booking): JsonResponse
    {
        $booking->delete();

        return response()->json(null, 204);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'booking_number' => [$required, 'string', 'max:255'],
            'customer_name' => [$required, 'string', 'max:255'],
            'customer_email' => [$required, 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:255'],
            'service_name' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'date' => ['nullable', 'date'],
            'time' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:2048'],
            'provider_name' => ['nullable', 'string', 'max:255'],
            'confirmed_by_provider_id' => ['nullable', 'string', 'max:255'],
            'confirmed_by_provider_name' => ['nullable', 'string', 'max:255'],
            'confirmed_by_provider_email' => ['nullable', 'email', 'max:255'],
            'confirmed_at' => ['nullable', 'date'],
            'status' => [$partial ? 'sometimes' : 'nullable', Rule::in(Booking::STATUSES)],
            'payment_status' => [$partial ? 'sometimes' : 'nullable', Rule::in(Booking::PAYMENT_STATUSES)],
            'price' => ['nullable', 'numeric', 'min:0'],
            'invoice_url' => ['nullable', 'string', 'max:2048'],
            'documents_urls' => ['nullable', 'array'],
            'documents_urls.*' => ['string', 'max:2048'],
            'provider_documents_urls' => ['nullable', 'array'],
            'provider_documents_urls.*' => ['string', 'max:2048'],
            'description' => ['nullable', 'string'],
            'required_documents_hint' => ['nullable', 'string'],
        ];
    }
}
