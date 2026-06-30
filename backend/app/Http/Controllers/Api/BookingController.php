<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->integer('limit', 200), 500);

        $bookings = Booking::query()
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('status_not'), fn ($query) => $query->where('status', '!=', $request->string('status_not')))
            ->when($request->filled('payment_status'), fn ($query) => $query->where('payment_status', $request->string('payment_status')))
            ->when($request->filled('customer_email'), fn ($query) => $query->where('customer_email', $request->string('customer_email')))
            ->when($request->filled('category'), fn ($query) => $query->where('category', $request->string('category')))
            ->latest()
            ->limit($limit)
            ->get();

        return response()->json(['data' => $bookings]);
    }

    public function show(Booking $booking): JsonResponse
    {
        return response()->json(['data' => $booking]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $data['booking_number'] ??= 'ES-' . now()->format('YmdHis') . '-' . random_int(100, 999);
        $booking = Booking::create($data);
        $this->ensureCustomerUser($booking);
        $this->createBookingNotifications($booking);

        return response()->json(['data' => $booking], 201);
    }

    public function update(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate($this->rules(partial: true));
        $booking->update($data);

        return response()->json(['data' => $booking->fresh()]);
    }

    public function destroy(Booking $booking): JsonResponse
    {
        $booking->delete();

        return response()->json(null, 204);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'booking_number' => [$partial ? 'sometimes' : 'sometimes', 'string', 'max:255'],
            'customer_name' => [$required, 'string', 'max:255'],
            'customer_email' => [$required, 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:255'],
            'service_name' => ['nullable', 'string', 'max:255'],
            'service_id' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'date' => ['nullable', 'date'],
            'time' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:2048'],
            'provider_id' => ['nullable', 'string', 'max:255'],
            'provider_name' => ['nullable', 'string', 'max:255'],
            'confirmed_by_provider_id' => ['nullable', 'string', 'max:255'],
            'confirmed_by_provider_name' => ['nullable', 'string', 'max:255'],
            'confirmed_by_provider_email' => ['nullable', 'email', 'max:255'],
            'confirmed_at' => ['nullable', 'date'],
            'status' => [$partial ? 'sometimes' : 'nullable', Rule::in(Booking::STATUSES)],
            'payment_status' => [$partial ? 'sometimes' : 'nullable', Rule::in(Booking::PAYMENT_STATUSES)],
            'price' => ['nullable', 'numeric', 'min:0'],
            'duration_hours' => ['nullable', 'integer', 'min:1'],
            'invoice_url' => ['nullable', 'string', 'max:2048'],
            'documents_urls' => ['nullable', 'array'],
            'documents_urls.*' => ['string', 'max:2048'],
            'provider_documents_urls' => ['nullable', 'array'],
            'provider_documents_urls.*' => ['string', 'max:2048'],
            'description' => ['nullable', 'string'],
            'required_documents_hint' => ['nullable', 'string'],
        ];
    }

    private function ensureCustomerUser(Booking $booking): void
    {
        User::query()->firstOrCreate(
            ['email' => $booking->customer_email],
            [
                'name' => $booking->customer_name,
                'full_name' => $booking->customer_name,
                'phone' => $booking->customer_phone,
                'role' => 'user',
                'password' => Hash::make(Str::random(32)),
            ]
        );
    }

    private function createBookingNotifications(Booking $booking): void
    {
        Notification::create([
            'user_email' => $booking->customer_email,
            'type' => 'booking_received',
            'title_de' => 'Buchung eingegangen',
            'title_ar' => 'تم استلام الحجز',
            'title_en' => 'Booking received',
            'message_de' => "Ihre Buchung {$booking->booking_number} wurde erfolgreich eingereicht.",
            'message_ar' => "تم تقديم حجزك {$booking->booking_number} بنجاح.",
            'message_en' => "Your booking {$booking->booking_number} has been submitted successfully.",
            'link' => 'MyBookings',
            'booking_id' => (string) $booking->id,
        ]);

        User::query()
            ->where('role', 'admin')
            ->get()
            ->each(function (User $admin) use ($booking) {
                Notification::create([
                    'user_email' => $admin->email,
                    'type' => 'new_booking_request',
                    'title_de' => 'Neue Buchung eingegangen',
                    'title_ar' => 'حجز جديد وارد',
                    'title_en' => 'New booking received',
                    'message_de' => "Neue Buchung {$booking->booking_number} von {$booking->customer_name}.",
                    'message_ar' => "حجز جديد {$booking->booking_number} من {$booking->customer_name}.",
                    'message_en' => "New booking {$booking->booking_number} from {$booking->customer_name}.",
                    'link' => 'BookingReports',
                    'booking_id' => (string) $booking->id,
                ]);
            });
    }
}
