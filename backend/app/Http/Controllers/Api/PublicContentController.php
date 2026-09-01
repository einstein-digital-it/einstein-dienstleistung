<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\PriceGroup;
use App\Models\Review;
use App\Models\Service;
use App\Models\ServiceProvider;
use Illuminate\Http\JsonResponse;

class PublicContentController extends Controller
{
    public function services(): JsonResponse
    {
        $services = Service::query()
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $services]);
    }

    public function pricing(): JsonResponse
    {
        $groups = PriceGroup::query()
            ->with('items')
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('category')
            ->get()
            ->map(fn (PriceGroup $group) => [
                'id' => $group->id,
                'category' => $group->category,
                'status' => $group->status,
                'sort_order' => $group->sort_order,
                'items' => $group->items
                    ->where('status', 'active')
                    ->sortBy('sort_order')
                    ->values()
                    ->map(fn ($item) => [
                        'id' => $item->id,
                        'label' => $item->label,
                        'price' => $item->price,
                        'unit' => $item->unit,
                        'status' => $item->status,
                        'sort_order' => $item->sort_order,
                    ]),
            ]);

        return response()->json(['data' => $groups]);
    }

    public function home(): JsonResponse
    {
        return response()->json([
            'data' => [
                'summary' => [
                    'active_services' => Service::query()->where('status', 'active')->count(),
                    'approved_providers' => ServiceProvider::query()->where('status', 'approved')->count(),
                    'completed_bookings' => Booking::query()->where('status', 'completed')->count(),
                ],
                'services' => Service::query()->where('status', 'active')->orderBy('sort_order')->limit(8)->get(),
                'pricing' => PriceGroup::query()->with('items')->where('status', 'active')->orderBy('sort_order')->get(),
            ],
        ]);
    }

    public function ratings(): JsonResponse
    {
        $reviews = Review::query()
            ->where('status', 'approved')
            ->latest()
            ->limit(500)
            ->get()
            ->map(fn (Review $review) => [
                'id' => $review->id,
                'booking_id' => $review->booking_id,
                'service_provider_id' => $review->service_provider_id,
                'category' => $review->category,
                'reviewer_name' => $review->reviewer_name,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at?->toISOString(),
            ]);

        return response()->json(['data' => $reviews]);
    }
}
