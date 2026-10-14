<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\PriceGroup;
use App\Models\User;
use App\Services\StripeClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Online payment with Stripe Checkout (hosted payment page).
 * Card, PayPal, SEPA, Klarna, Apple/Google Pay — whatever is enabled in the Stripe dashboard.
 * The Dokumenten-Abo ("dokumentabo") is charged as a monthly subscription.
 */
class StripeController extends Controller
{
    /** Categories billed monthly as a subscription. */
    private const SUBSCRIPTION_CATEGORIES = ['dokumentabo'];

    /** Fallback minimum prices when no price group exists for a category. */
    private const DEFAULT_MIN_PRICES = ['dokumentabo' => 49, 'eur1' => 150];

    /**
     * POST /api/payments/bookings/{booking}/checkout — returns { url } to redirect the customer to.
     */
    public function checkout(Request $request, Booking $booking): JsonResponse
    {
        $user = $request->user();
        $isStaff = in_array($user?->role, ['admin', 'provider'], true);
        if (! $isStaff && strcasecmp((string) $user?->email, (string) $booking->customer_email) !== 0) {
            abort(403, 'This booking belongs to another customer.');
        }
        if (! StripeClient::configured()) {
            return response()->json(['message' => 'Online payment is not configured yet (STRIPE_SECRET missing).'], 503);
        }
        if ($booking->payment_status === 'paid') {
            return response()->json(['message' => 'This booking is already paid.'], 409);
        }
        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'This booking was cancelled.'], 409);
        }

        $net = $this->amountFor($booking);
        $vatRate = (float) config('services.tax.vat_rate', 0.19);
        $amount = round($net * (1 + $vatRate), 2); // gross amount charged
        if ($net <= 0) {
            return response()->json(['message' => 'No price set for this booking yet. EinStein will send you the amount.'], 422);
        }

        $isSubscription = in_array($booking->category, self::SUBSCRIPTION_CATEGORIES, true);
        $base = rtrim((string) config('app.url'), '/');
        $lang = in_array($request->input('lang'), ['de', 'en', 'es'], true) ? $request->input('lang') : 'auto';

        $lineItem = [
            'quantity' => 1,
            'price_data' => [
                'currency' => 'eur',
                'unit_amount' => (int) round($amount * 100),
                'product_data' => [
                    'name' => $booking->service_name ?: ($booking->category ?: 'EinStein Service'),
                    'description' => 'Buchung '.$booking->booking_number.' — inkl. '.round($vatRate * 100).' % MwSt.',
                ],
            ],
        ];
        if ($isSubscription) {
            $lineItem['price_data']['recurring'] = ['interval' => 'month'];
        }

        $params = [
            'mode' => $isSubscription ? 'subscription' : 'payment',
            'line_items' => [$lineItem],
            'client_reference_id' => (string) $booking->id,
            'customer_email' => $booking->customer_email,
            'locale' => $lang,
            'metadata' => ['booking_id' => (string) $booking->id, 'booking_number' => (string) $booking->booking_number],
            'success_url' => $base.'/Payment?id='.$booking->id.'&paid=1',
            'cancel_url' => $base.'/Payment?id='.$booking->id.'&canceled=1',
        ];
        if ($isSubscription) {
            $params['subscription_data'] = ['metadata' => $params['metadata']];
        } else {
            $params['payment_intent_data'] = ['metadata' => $params['metadata']];
        }

        try {
            $session = (new StripeClient())->post('checkout/sessions', $params);
        } catch (Throwable $e) {
            Log::error('Stripe checkout failed', ['booking' => $booking->id, 'error' => $e->getMessage()]);

            return response()->json(['message' => 'Payment could not be started. Please try again later.'], 502);
        }

        $booking->update(['stripe_session_id' => $session['id'], 'price' => $net]);

        return response()->json(['data' => [
            'url' => $session['url'],
            'net' => $net,
            'vat' => round($amount - $net, 2),
            'amount' => $amount,
            'subscription' => $isSubscription,
        ]]);
    }

    /**
     * POST /api/stripe/webhook — called by Stripe. Signature is verified.
     */
    public function webhook(Request $request): JsonResponse
    {
        try {
            $event = StripeClient::verifyWebhook($request->getContent(), (string) $request->header('Stripe-Signature'));
        } catch (Throwable $e) {
            Log::warning('Stripe webhook rejected', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $object = $event['data']['object'] ?? [];

        switch ($event['type'] ?? '') {
            case 'checkout.session.completed':
                $booking = $this->bookingFromMetadata($object);
                if ($booking) {
                    if (! empty($object['subscription'])) {
                        $booking->update(['stripe_subscription_id' => $object['subscription']]);
                    }
                    if (($object['payment_status'] ?? '') === 'paid') {
                        $this->markPaid($booking);
                    }
                    // SEPA etc.: payment_status "unpaid" → wait for async_payment_succeeded
                }
                break;

            case 'checkout.session.async_payment_succeeded':
                if ($booking = $this->bookingFromMetadata($object)) {
                    $this->markPaid($booking);
                }
                break;

            case 'checkout.session.async_payment_failed':
                if ($booking = $this->bookingFromMetadata($object)) {
                    $this->markFailed($booking);
                }
                break;

            case 'invoice.payment_failed': // monthly Abo renewal failed
                if ($booking = $this->bookingFromSubscription($object['subscription'] ?? null)) {
                    $this->markFailed($booking);
                }
                break;

            case 'invoice.paid': // monthly Abo renewal paid
                if ($booking = $this->bookingFromSubscription($object['subscription'] ?? null)) {
                    $booking->update(['payment_status' => 'paid', 'paid_at' => now()]);
                }
                break;

            case 'customer.subscription.deleted': // Abo ended (after cancellation)
                if ($booking = $this->bookingFromSubscription($object['id'] ?? null)) {
                    $booking->update(['status' => 'completed']);
                    $this->notifyAdmins('Abo beendet', "Das Dokumenten-Abo {$booking->booking_number} ({$booking->customer_email}) ist beendet.", $booking);
                }
                break;
        }

        return response()->json(['received' => true]);
    }

    /**
     * Cancel a Dokumenten-Abo at the end of the current billing month.
     * Returns true if a Stripe subscription was found and scheduled for cancellation.
     */
    public static function cancelSubscriptionAtPeriodEnd(Booking $booking): bool
    {
        if (! $booking->stripe_subscription_id || ! StripeClient::configured()) {
            return false;
        }
        try {
            (new StripeClient())->post('subscriptions/'.$booking->stripe_subscription_id, ['cancel_at_period_end' => 'true']);

            return true;
        } catch (Throwable $e) {
            Log::error('Stripe subscription cancel failed', ['booking' => $booking->id, 'error' => $e->getMessage()]);

            return false;
        }
    }

    // ---------------------------------------------------------------- helpers

    /** Server-side NET amount: the booking price, but never below the official price of its category. */
    private function amountFor(Booking $booking): float
    {
        $price = (float) $booking->price;
        $minimum = $this->officialPrice((string) $booking->category);

        return round(max($price, $minimum), 2);
    }

    private function officialPrice(string $category): float
    {
        $group = PriceGroup::with('items')->where('category', $category)->where('status', 'active')->first();
        $item = $group?->items->where('status', 'active')->sortBy('sort_order')->first();
        if ($item) {
            $num = (float) str_replace(',', '.', preg_replace('/[^\d.,]/', '', (string) $item->price));
            if ($num > 0) {
                return $num;
            }
        }

        return (float) (self::DEFAULT_MIN_PRICES[$category] ?? 0);
    }

    private function bookingFromMetadata(array $object): ?Booking
    {
        $id = $object['metadata']['booking_id'] ?? $object['client_reference_id'] ?? null;

        return $id ? Booking::find($id) : null;
    }

    private function bookingFromSubscription(?string $subscriptionId): ?Booking
    {
        return $subscriptionId ? Booking::where('stripe_subscription_id', $subscriptionId)->first() : null;
    }

    private function markPaid(Booking $booking): void
    {
        $wasPaid = $booking->payment_status === 'paid';
        $booking->update(['payment_status' => 'paid', 'paid_at' => now()]);
        if ($wasPaid) {
            return;
        }

        Notification::create([
            'user_email' => $booking->customer_email,
            'type' => 'payment_received',
            'title_de' => 'Zahlung erhalten', 'title_ar' => 'تم استلام الدفعة', 'title_en' => 'Payment received',
            'message_de' => "Vielen Dank! Ihre Zahlung für {$booking->booking_number} ist eingegangen.",
            'message_ar' => "شكراً لك! تم استلام دفعتك للحجز {$booking->booking_number}.",
            'message_en' => "Thank you! Your payment for {$booking->booking_number} has been received.",
            'link' => 'MyBookings',
            'booking_id' => (string) $booking->id,
        ]);
        $this->notifyAdmins('Zahlung eingegangen', "{$booking->customer_name} hat {$booking->booking_number} bezahlt (netto {$booking->price} € zzgl. MwSt.).", $booking);
    }

    private function markFailed(Booking $booking): void
    {
        $booking->update(['payment_status' => 'failed']);
        $this->notifyAdmins('Zahlung fehlgeschlagen', "Die Zahlung für {$booking->booking_number} ({$booking->customer_email}) ist fehlgeschlagen.", $booking);
    }

    private function notifyAdmins(string $title, string $message, Booking $booking): void
    {
        User::where('role', 'admin')->get()->each(fn (User $admin) => Notification::create([
            'user_email' => $admin->email,
            'type' => 'payment_admin',
            'title_de' => $title, 'title_ar' => $title, 'title_en' => $title,
            'message_de' => $message, 'message_ar' => $message, 'message_en' => $message,
            'link' => 'AdminBookings',
            'booking_id' => (string) $booking->id,
        ]));
    }
}
