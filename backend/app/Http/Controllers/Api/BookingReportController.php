<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class BookingReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->integer('limit', 200), 500);

        $query = Booking::query()
            ->when($request->filled('status') && $request->string('status')->toString() !== 'all', function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            });

        $bookings = (clone $query)->latest()->limit($limit)->get();

        $summary = Booking::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json([
            'data' => [
                'bookings' => $bookings,
                'summary' => [
                    'total' => Booking::count(),
                    'pending' => (int) ($summary['pending'] ?? 0),
                    'confirmed' => (int) ($summary['confirmed'] ?? 0),
                    'in_progress' => (int) ($summary['in_progress'] ?? 0),
                    'completed' => (int) ($summary['completed'] ?? 0),
                    'cancelled' => (int) ($summary['cancelled'] ?? 0),
                ],
            ],
        ]);
    }

    public function confirm(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'confirmed_by_provider_id' => ['nullable', 'string', 'max:255'],
            'confirmed_by_provider_name' => ['required', 'string', 'max:255'],
            'confirmed_by_provider_email' => ['nullable', 'email', 'max:255'],
            'status' => ['nullable', Rule::in(['confirmed'])],
        ]);

        $booking->update([
            'status' => 'confirmed',
            'confirmed_by_provider_id' => $data['confirmed_by_provider_id'] ?? 'admin',
            'confirmed_by_provider_name' => $data['confirmed_by_provider_name'],
            'confirmed_by_provider_email' => $data['confirmed_by_provider_email'] ?? null,
            'confirmed_at' => Carbon::now(),
        ]);

        return response()->json(['data' => $booking->fresh()]);
    }
}
