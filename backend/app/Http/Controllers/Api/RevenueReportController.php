<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ServiceExtension;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RevenueReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $year = (int) $request->integer('year', now()->year);

        $bookings = Booking::query()
            ->where('status', 'completed')
            ->whereIn('payment_status', ['paid', 'authorized'])
            ->orderByDesc('date')
            ->get();

        $extensions = ServiceExtension::query()
            ->where('payment_status', 'paid')
            ->latest()
            ->get();

        return response()->json([
            'data' => [
                'year' => $year,
                'bookings' => $bookings,
                'extensions' => $extensions,
                'summary' => $this->summary($bookings, $extensions, $year),
            ],
        ]);
    }

    private function summary($bookings, $extensions, int $year): array
    {
        $bookingRevenue = $bookings
            ->filter(fn (Booking $booking) => $booking->date?->year === $year)
            ->sum(fn (Booking $booking) => (float) $booking->price);

        $extensionRevenue = $extensions
            ->filter(fn (ServiceExtension $extension) => $extension->created_at?->year === $year)
            ->sum(fn (ServiceExtension $extension) => (float) $extension->amount);

        return [
            'booking_revenue' => round($bookingRevenue, 2),
            'extension_revenue' => round($extensionRevenue, 2),
            'total_revenue' => round($bookingRevenue + $extensionRevenue, 2),
            'completed_bookings' => $bookings->filter(fn (Booking $booking) => $booking->date?->year === $year)->count(),
        ];
    }
}
