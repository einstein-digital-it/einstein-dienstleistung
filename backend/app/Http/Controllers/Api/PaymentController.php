<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
    public function show(Request $request, Booking $booking): JsonResponse
    {
        // Customers only see their own bookings
        $user = $request->user();
        $isStaff = in_array($user?->role, ['admin', 'provider'], true);
        if (! $isStaff && strcasecmp((string) $user?->email, (string) $booking->customer_email) !== 0) {
            abort(403, 'This booking belongs to another customer.');
        }

        // The customer usually lands here right after paying: do not wait for the webhook
        StripeController::syncBookingPayment($booking);

        return response()->json(['data' => $booking->refresh()]);
    }

    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'payment_status' => ['required', Rule::in(Booking::PAYMENT_STATUSES)],
        ]);

        $booking->update(['payment_status' => $data['payment_status']]);

        if ($data['payment_status'] === 'paid') {
            Notification::create([
                'user_email' => $booking->customer_email,
                'type' => 'payment_received',
                'title_de' => 'Zahlung erhalten',
                'title_ar' => 'تم استلام الدفع',
                'title_en' => 'Payment received',
                'message_de' => "Ihre Zahlung für Buchung {$booking->booking_number} wurde registriert.",
                'message_ar' => "تم تسجيل الدفع للحجز {$booking->booking_number}.",
                'message_en' => "Your payment for booking {$booking->booking_number} has been recorded.",
                'link' => 'MyBookings',
                'booking_id' => (string) $booking->id,
            ]);
        }

        return response()->json(['data' => $booking->fresh()]);
    }
}
