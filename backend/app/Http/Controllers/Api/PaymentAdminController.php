<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->integer('limit', 500), 1000);

        $payments = Booking::query()
            ->whereNotNull('price')
            ->where('price', '>', 0)
            ->when($request->filled('payment_status') && $request->string('payment_status')->toString() !== 'all', function ($query) use ($request) {
                $query->where('payment_status', $request->string('payment_status'));
            })
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (Booking $booking) => $this->serializePayment($booking));

        return response()->json(['data' => $payments]);
    }

    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'payment_status' => ['required', Rule::in(Booking::PAYMENT_STATUSES)],
            'refund_reason' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        $booking->update(['payment_status' => $data['payment_status']]);

        return response()->json(['data' => $this->serializePayment($booking->fresh())]);
    }

    public function refund(Request $request, Booking $booking): JsonResponse
    {
        $request->validate([
            'refund_reason' => ['required', 'string', 'max:2000'],
        ]);

        $booking->update(['payment_status' => 'refunded']);

        return response()->json(['data' => $this->serializePayment($booking->fresh())]);
    }

    public function deleteUnpaid(Booking $booking): JsonResponse
    {
        if (! in_array($booking->payment_status, ['unpaid', 'failed'], true)) {
            return response()->json([
                'message' => 'Only unpaid or failed bookings can be deleted from payment administration.',
            ], 422);
        }

        $booking->delete();

        return response()->json(null, 204);
    }

    private function serializePayment(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'booking_number' => $booking->booking_number,
            'customer_name' => $booking->customer_name,
            'customer_email' => $booking->customer_email,
            'customer_phone' => $booking->customer_phone,
            'service_name' => $booking->service_name,
            'category' => $booking->category,
            'date' => $booking->date,
            'status' => $booking->status,
            'payment_status' => $booking->payment_status,
            'price' => (float) $booking->price,
            'invoice_url' => $booking->invoice_url,
            'created_date' => $booking->created_at?->toISOString(),
            'created_at' => $booking->created_at?->toISOString(),
            'updated_at' => $booking->updated_at?->toISOString(),
        ];
    }
}
