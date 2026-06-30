<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\ServiceProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class ProviderDashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $provider = ServiceProvider::query()
            ->where('email', $data['email'])
            ->first();

        if (! $provider) {
            return response()->json(['data' => ['provider' => null, 'bookings' => [], 'summary' => $this->summary(collect())]]);
        }

        $bookings = $this->providerBookings($provider)
            ->latest()
            ->limit(500)
            ->get();

        return response()->json([
            'data' => [
                'provider' => $this->serializeProvider($provider),
                'bookings' => $bookings,
                'summary' => $this->summary($bookings),
            ],
        ]);
    }

    public function action(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'provider_id' => ['required', 'integer', 'exists:service_providers,id'],
            'action' => ['required', Rule::in(['accept', 'decline', 'complete'])],
        ]);

        $provider = ServiceProvider::findOrFail($data['provider_id']);

        if ($data['action'] === 'accept') {
            $booking->update([
                'provider_id' => (string) $provider->id,
                'provider_name' => $provider->full_name,
                'confirmed_by_provider_id' => (string) $provider->id,
                'confirmed_by_provider_name' => $provider->full_name,
                'confirmed_by_provider_email' => $provider->email,
                'confirmed_at' => Carbon::now(),
                'status' => 'confirmed',
            ]);

            $this->notifyCustomer($booking, 'booking_confirmed', 'Booking confirmed');
        }

        if ($data['action'] === 'decline') {
            $booking->update(['status' => 'cancelled']);
            $this->notifyCustomer($booking, 'booking_cancelled', 'Booking cancelled');
        }

        if ($data['action'] === 'complete') {
            $booking->update(['status' => 'completed']);
            $this->notifyCustomer($booking, 'booking_completed', 'Booking completed');
        }

        return response()->json(['data' => $booking->fresh()]);
    }

    public function updateProfile(Request $request, ServiceProvider $serviceProvider): JsonResponse
    {
        $data = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'profile_image' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'bio_de' => ['sometimes', 'nullable', 'string'],
            'bio_ar' => ['sometimes', 'nullable', 'string'],
            'bio_en' => ['sometimes', 'nullable', 'string'],
            'experience_years' => ['sometimes', 'integer', 'min:0'],
            'service_area' => ['sometimes', 'nullable', 'string', 'max:255'],
            'availability' => ['sometimes', 'nullable', 'array'],
            'working_hours_start' => ['sometimes', 'nullable', 'string', 'max:255'],
            'working_hours_end' => ['sometimes', 'nullable', 'string', 'max:255'],
            'categories' => ['sometimes', 'nullable', 'array'],
            'languages' => ['sometimes', 'nullable', 'array'],
            'qualifications' => ['sometimes', 'nullable', 'string'],
            'documents_urls' => ['sometimes', 'nullable', 'array'],
            'hourly_rate' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'city' => ['sometimes', 'nullable', 'string', 'max:255'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $serviceProvider->update($data);

        return response()->json(['data' => $this->serializeProvider($serviceProvider->fresh())]);
    }

    public function updateDocuments(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'provider_id' => ['required', 'integer', 'exists:service_providers,id'],
            'document_urls' => ['required', 'array', 'min:1'],
            'document_urls.*' => ['string', 'max:2048'],
        ]);

        $current = $booking->provider_documents_urls ?? [];
        $booking->update([
            'provider_documents_urls' => array_values(array_merge($current, $data['document_urls'])),
        ]);

        $this->notifyCustomer($booking, 'provider_documents_uploaded', 'Documents uploaded');

        return response()->json(['data' => $booking->fresh()]);
    }

    private function providerBookings(ServiceProvider $provider)
    {
        return Booking::query()
            ->where(function ($query) use ($provider) {
                $query
                    ->where('provider_id', (string) $provider->id)
                    ->orWhere('confirmed_by_provider_id', (string) $provider->id)
                    ->orWhere('confirmed_by_provider_email', $provider->email)
                    ->orWhere(function ($query) use ($provider) {
                        $categories = $provider->categories ?? [];
                        $query->where('status', 'pending')
                            ->whereNull('confirmed_by_provider_id')
                            ->when(count($categories) > 0, fn ($query) => $query->whereIn('category', $categories));
                    });
            });
    }

    private function summary($bookings): array
    {
        $completed = $bookings->where('status', 'completed');

        return [
            'upcoming' => $bookings->whereIn('status', ['pending', 'confirmed', 'in_progress'])->count(),
            'completed' => $completed->count(),
            'total_earnings' => round($completed->sum(fn (Booking $booking) => (float) $booking->price), 2),
            'this_month' => round($completed
                ->filter(fn (Booking $booking) => $booking->date?->month === now()->month && $booking->date?->year === now()->year)
                ->sum(fn (Booking $booking) => (float) $booking->price), 2),
        ];
    }

    private function notifyCustomer(Booking $booking, string $type, string $title): void
    {
        Notification::create([
            'user_email' => $booking->customer_email,
            'type' => $type,
            'title_de' => $title,
            'title_ar' => $title,
            'title_en' => $title,
            'message_de' => "{$title}: {$booking->booking_number}",
            'message_ar' => "{$title}: {$booking->booking_number}",
            'message_en' => "{$title}: {$booking->booking_number}",
            'link' => 'MyBookings',
            'booking_id' => (string) $booking->id,
        ]);
    }

    private function serializeProvider(ServiceProvider $provider): array
    {
        return [
            'id' => $provider->id,
            'full_name' => $provider->full_name,
            'email' => $provider->email,
            'phone' => $provider->phone,
            'address' => $provider->address,
            'profile_image' => $provider->profile_image,
            'bio_de' => $provider->bio_de,
            'bio_ar' => $provider->bio_ar,
            'bio_en' => $provider->bio_en,
            'experience_years' => $provider->experience_years,
            'service_area' => $provider->service_area,
            'availability' => $provider->availability ?? [],
            'working_hours_start' => $provider->working_hours_start,
            'working_hours_end' => $provider->working_hours_end,
            'categories' => $provider->categories ?? [],
            'languages' => $provider->languages ?? [],
            'qualifications' => $provider->qualifications,
            'documents_urls' => $provider->documents_urls ?? [],
            'hourly_rate' => $provider->hourly_rate !== null ? (float) $provider->hourly_rate : null,
            'city' => $provider->city ?: $provider->service_area,
            'status' => $provider->status,
            'login_enabled' => $provider->login_enabled,
        ];
    }
}
