<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\SeoSetting;
use App\Models\ServiceProvider;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $completedRevenue = Booking::query()
            ->where('status', 'completed')
            ->whereIn('payment_status', ['paid', 'authorized'])
            ->sum('price');

        $stats = [
            'total_bookings' => Booking::query()->count(),
            'pending_bookings' => Booking::query()->whereNotIn('status', ['completed', 'cancelled'])->count(),
            'revenue' => round((float) $completedRevenue, 2),
            'users' => User::query()->count(),
            'admins' => User::query()->where('role', 'admin')->count(),
            'providers' => ServiceProvider::query()->where('status', 'approved')->count(),
            'pending_providers' => ServiceProvider::query()->where('status', 'pending')->count(),
            'seo_pages' => SeoSetting::query()->count(),
        ];

        $activities = collect()
            ->merge(Booking::query()->latest()->limit(5)->get()->map(fn (Booking $booking) => [
                'title' => 'Booking',
                'detail' => "{$booking->booking_number} - {$booking->customer_name}",
                'time' => $booking->created_at?->toISOString(),
                'status' => $booking->status,
            ]))
            ->merge(User::query()->latest()->limit(3)->get()->map(fn (User $user) => [
                'title' => 'User',
                'detail' => "{$user->email} - {$user->role}",
                'time' => $user->created_at?->toISOString(),
                'status' => $user->role ?: 'user',
            ]))
            ->sortByDesc('time')
            ->take(8)
            ->values();

        return response()->json([
            'data' => [
                'stats' => $stats,
                'activity' => $activities,
            ],
        ]);
    }
}
