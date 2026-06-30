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
    public function show(Booking $booking): JsonResponse
    {
        return response()->json(['data' => $booking]);
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
