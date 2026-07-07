<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reviews = Review::query()
            ->where('status', 'approved')
            ->when($request->filled('category'), fn ($query) => $query->where('category', $request->string('category')))
            ->when($request->filled('provider_id'), fn ($query) => $query->where('service_provider_id', $request->integer('provider_id')))
            ->latest()
            ->limit(min((int) $request->integer('limit', 200), 500))
            ->get()
            ->map(fn (Review $review) => $this->serializeReview($review));

        return response()->json(['data' => $reviews]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'booking_id' => ['sometimes', 'nullable', 'integer', 'exists:bookings,id'],
            'service_provider_id' => ['sometimes', 'nullable', 'integer', 'exists:service_providers,id'],
            'category' => ['sometimes', 'nullable', 'string', 'max:255'],
            'reviewer_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'reviewer_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', Rule::in(Review::STATUSES)],
            'source' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $review = Review::create([
            ...$data,
            'status' => $data['status'] ?? 'approved',
            'source' => $data['source'] ?? 'public',
        ]);

        return response()->json(['data' => $this->serializeReview($review)], 201);
    }

    private function serializeReview(Review $review): array
    {
        return [
            'id' => $review->id,
            'booking_id' => $review->booking_id,
            'service_provider_id' => $review->service_provider_id,
            'category' => $review->category,
            'reviewer_name' => $review->reviewer_name,
            'reviewer_email' => $review->reviewer_email,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'status' => $review->status,
            'source' => $review->source,
            'created_at' => $review->created_at?->toISOString(),
        ];
    }
}
