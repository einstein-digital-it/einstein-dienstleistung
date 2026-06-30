<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerPortalController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $email = $this->validatedEmail($request);
        $bookings = $this->bookingQuery($email)->get();
        $notifications = Notification::query()
            ->where('user_email', $email)
            ->latest()
            ->limit(5)
            ->get();

        $profile = User::query()->where('email', $email)->first();

        return response()->json([
            'data' => [
                'profile' => $profile ? $this->serializeUser($profile) : ['email' => $email],
                'summary' => [
                    'total_bookings' => $bookings->count(),
                    'upcoming' => $bookings->whereIn('status', ['pending', 'confirmed', 'in_progress'])->count(),
                    'completed' => $bookings->where('status', 'completed')->count(),
                    'open_payments' => $bookings->whereIn('payment_status', ['unpaid', 'failed'])->count(),
                    'unread_notifications' => Notification::query()->where('user_email', $email)->where('is_read', false)->count(),
                ],
                'upcoming_bookings' => $bookings
                    ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
                    ->sortBy('date')
                    ->take(5)
                    ->values()
                    ->map(fn (Booking $booking) => $this->serializeBooking($booking)),
                'notifications' => $notifications->map(fn (Notification $notification) => $this->serializeNotification($notification)),
            ],
        ]);
    }

    public function bookings(Request $request): JsonResponse
    {
        $email = $this->validatedEmail($request);

        $bookings = $this->bookingQuery($email)
            ->when($request->filled('status') && $request->string('status')->toString() !== 'all', function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->get()
            ->map(fn (Booking $booking) => $this->serializeBooking($booking));

        return response()->json(['data' => $bookings]);
    }

    private function bookingQuery(string $email)
    {
        return Booking::query()
            ->where('customer_email', $email)
            ->latest();
    }

    private function validatedEmail(Request $request): string
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        return $data['email'];
    }

    private function serializeBooking(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'booking_number' => $booking->booking_number,
            'customer_name' => $booking->customer_name,
            'customer_email' => $booking->customer_email,
            'customer_phone' => $booking->customer_phone,
            'service_name' => $booking->service_name,
            'service_id' => $booking->service_id,
            'category' => $booking->category,
            'date' => $booking->date,
            'time' => $booking->time,
            'address' => $booking->address,
            'provider_id' => $booking->provider_id,
            'provider_name' => $booking->provider_name,
            'status' => $booking->status,
            'payment_status' => $booking->payment_status,
            'price' => $booking->price !== null ? (float) $booking->price : null,
            'duration_hours' => $booking->duration_hours,
            'invoice_url' => $booking->invoice_url,
            'documents_urls' => $booking->documents_urls ?? [],
            'provider_documents_urls' => $booking->provider_documents_urls ?? [],
            'description' => $booking->description,
            'required_documents_hint' => $booking->required_documents_hint,
            'created_at' => $booking->created_at?->toISOString(),
        ];
    }

    private function serializeNotification(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'user_email' => $notification->user_email,
            'type' => $notification->type,
            'title_de' => $notification->title_de,
            'title_ar' => $notification->title_ar,
            'title_en' => $notification->title_en,
            'title_tr' => $notification->title_tr,
            'title_es' => $notification->title_es,
            'message_de' => $notification->message_de,
            'message_ar' => $notification->message_ar,
            'message_en' => $notification->message_en,
            'message_tr' => $notification->message_tr,
            'message_es' => $notification->message_es,
            'link' => $notification->link,
            'booking_id' => $notification->booking_id,
            'is_read' => $notification->is_read,
            'created_at' => $notification->created_at?->toISOString(),
        ];
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'full_name' => $user->full_name ?: $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'role' => $user->role ?: 'user',
            'preferred_language' => $user->preferred_language,
            'avatar_url' => $user->avatar_url,
        ];
    }
}
