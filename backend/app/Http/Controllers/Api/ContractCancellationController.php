<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ContractCancellation;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * "Verträge hier kündigen" — cancellation without login (§ 312k BGB).
 */
class ContractCancellationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'cancellation_type' => ['required', Rule::in(['ordinary', 'extraordinary'])],
            'termination_timing' => ['required', Rule::in(['soonest', 'specific_date'])],
            'termination_date' => ['nullable', 'required_if:termination_timing,specific_date', 'date'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'language' => ['nullable', 'string', 'max:5'],
        ]);

        $cancellation = ContractCancellation::create([
            ...$data,
            'language' => $data['language'] ?? 'de',
            'status' => 'received',
            'ip_address' => $request->ip(),
        ]);

        $this->cancelMatchingSubscription($cancellation);
        $this->notify($cancellation);

        $received = $cancellation->created_at->timezone('Europe/Berlin');

        return response()->json(['data' => [
            'id' => $cancellation->id,
            'received_date' => $received->format('d.m.Y'),
            'received_time' => $received->format('H:i'),
            'termination_timing' => $cancellation->termination_timing,
            'termination_date' => $cancellation->termination_date?->format('d.m.Y'),
        ]], 201);
    }

    public function index(): JsonResponse
    {
        return response()->json(['data' => ContractCancellation::query()->latest()->get()]);
    }

    public function update(Request $request, ContractCancellation $cancellation): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['received', 'confirmed', 'processed'])],
        ]);
        $cancellation->update($data);

        return response()->json(['data' => $cancellation->fresh()]);
    }

    /**
     * If the cancellation names a subscription booking (Dokumenten-Abo, Büro-Management) of the same customer,
     * stop the Stripe subscription at the end of the current month (AGB § 8).
     */
    private function cancelMatchingSubscription(ContractCancellation $c): void
    {
        $query = Booking::query()
            ->whereIn('category', StripeController::SUBSCRIPTION_CATEGORIES)
            ->whereRaw('LOWER(customer_email) = ?', [strtolower($c->email)])
            ->whereNotNull('stripe_subscription_id')
            ->whereNotIn('status', ['cancelled', 'completed']);

        if ($c->reference_number) {
            $query->where(fn ($q) => $q->where('booking_number', $c->reference_number)->orWhere('id', $c->reference_number));
        }

        $bookings = $query->get();
        // Without a reference only act when the customer has exactly one active Abo
        if (! $c->reference_number && $bookings->count() !== 1) {
            return;
        }

        foreach ($bookings as $booking) {
            if (StripeController::cancelSubscriptionAtPeriodEnd($booking)) {
                $c->update(['status' => 'confirmed']);
            }
        }
    }

    private function notify(ContractCancellation $c): void
    {
        $ref = $c->reference_number ? " ({$c->reference_number})" : '';

        // Confirmation for the customer (shown in their account if they have one)
        Notification::create([
            'user_email' => $c->email,
            'type' => 'cancellation_received',
            'title_de' => 'Kündigung eingegangen',
            'title_ar' => 'تم استلام الإلغاء',
            'title_en' => 'Cancellation received',
            'message_de' => "Wir haben Ihre Kündigung{$ref} erhalten.",
            'message_ar' => "استلمنا طلب الإلغاء{$ref}.",
            'message_en' => "We have received your cancellation{$ref}.",
            'link' => 'MyBookings',
        ]);

        // Alert all admins so the cancellation is confirmed in text form without delay
        User::query()->where('role', 'admin')->get()->each(function (User $admin) use ($c, $ref) {
            Notification::create([
                'user_email' => $admin->email,
                'type' => 'cancellation_admin',
                'title_de' => 'Neue Kündigung',
                'title_ar' => 'طلب إلغاء جديد',
                'title_en' => 'New cancellation',
                'message_de' => "{$c->name} <{$c->email}> hat gekündigt{$ref}.",
                'message_ar' => "{$c->name} <{$c->email}> أرسل طلب إلغاء{$ref}.",
                'message_en' => "{$c->name} <{$c->email}> cancelled{$ref}.",
                'link' => 'AdminBookings',
            ]);
        });
    }
}
