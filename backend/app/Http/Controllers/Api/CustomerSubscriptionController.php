<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\StripeClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * "Meine Unterlagen" Abo: letters are sorted into folders and translated into the
 * customer's language automatically. Monthly Stripe subscription, price incl. VAT.
 */
class CustomerSubscriptionController extends Controller
{
    public const KIND = 'file_abo';

    /** Gross monthly price in cents (VAT included). */
    public static function priceCents(): int
    {
        return (int) config('services.file_abo.price_cents', 699);
    }

    /** GET customer/subscription */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        self::syncWithStripe($user);

        return response()->json(['data' => $this->state($user->refresh())]);
    }

    /**
     * Safety net for a missed webhook: after a checkout was started, ask Stripe whether it
     * was paid and activate the Abo. Runs at most every 15 seconds per customer.
     */
    public static function syncWithStripe(User $user): void
    {
        $sessionId = Cache::get(self::sessionKey($user));
        if (! $sessionId || $user->hasFileAbo() || ! StripeClient::configured()) {
            return;
        }
        if (! Cache::add('file_abo_sync:'.$user->id, 1, 15)) {
            return;
        }

        try {
            $session = (new StripeClient())->get('checkout/sessions/'.$sessionId);
        } catch (Throwable $e) {
            Log::warning('Stripe file abo sync failed', ['user' => $user->id, 'error' => $e->getMessage()]);

            return;
        }

        // Only this customer's own Abo checkout counts
        if (($session['metadata']['kind'] ?? null) !== self::KIND || (string) ($session['metadata']['user_id'] ?? '') !== (string) $user->id) {
            return;
        }
        if (($session['status'] ?? '') === 'complete') {
            self::handleWebhook('checkout.session.completed', $session);
            // SEPA and similar are paid later: keep checking until the Abo is active
            if ($user->refresh()->hasFileAbo()) {
                Cache::forget(self::sessionKey($user));
            }
        } elseif (($session['status'] ?? '') === 'expired') {
            Cache::forget(self::sessionKey($user));
        }
    }

    private static function sessionKey(User $user): string
    {
        return 'file_abo_session:'.$user->id;
    }

    /** POST customer/subscription/checkout { lang? } — returns { url } of the Stripe payment page. */
    public function checkout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->hasFileAbo()) {
            return response()->json(['message' => 'Your subscription is already active.'], 409);
        }
        if (! StripeClient::configured()) {
            return response()->json(['message' => 'Online payment is not configured yet (STRIPE_SECRET missing).'], 503);
        }

        $base = rtrim((string) config('app.url'), '/');
        $lang = in_array($request->input('lang'), ['de', 'en', 'es'], true) ? $request->input('lang') : 'auto';
        $vatRate = (float) config('services.tax.vat_rate', 0.19);
        $metadata = ['kind' => self::KIND, 'user_id' => (string) $user->id];

        try {
            $session = (new StripeClient())->post('checkout/sessions', [
                'mode' => 'subscription',
                'line_items' => [[
                    'quantity' => 1,
                    'price_data' => [
                        'currency' => 'eur',
                        'unit_amount' => self::priceCents(),
                        'recurring' => ['interval' => 'month'],
                        'product_data' => [
                            'name' => 'EinStein Unterlagen-Abo',
                            'description' => 'Briefe automatisch sortieren und übersetzen — inkl. '.round($vatRate * 100).' % MwSt.',
                        ],
                    ],
                ]],
                'client_reference_id' => 'user-'.$user->id,
                'customer_email' => $user->email,
                'locale' => $lang,
                'metadata' => $metadata,
                'subscription_data' => ['metadata' => $metadata],
                'success_url' => $base.'/MyDocuments?abo=1',
                'cancel_url' => $base.'/MyDocuments?abo=0',
            ]);
        } catch (Throwable $e) {
            Log::error('Stripe file abo checkout failed', ['user' => $user->id, 'error' => $e->getMessage()]);

            return response()->json(['message' => 'Payment could not be started. Please try again later.'], 502);
        }

        // Remembered for a day so the Abo can be confirmed even if the webhook is missed
        Cache::put(self::sessionKey($user), $session['id'], now()->addDay());

        return response()->json(['data' => ['url' => $session['url']] + $this->state($user)]);
    }

    /** POST customer/subscription/cancel — ends at the end of the paid month. */
    public function cancel(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->file_abo_subscription_id || ! StripeClient::configured()) {
            return response()->json(['message' => 'No active subscription.'], 404);
        }
        if (! self::cancelAtPeriodEnd($user)) {
            return response()->json(['message' => 'The subscription could not be cancelled. Please try again later.'], 502);
        }

        return response()->json(['data' => $this->state($user)]);
    }

    /** Stop the Stripe subscription at the end of the paid month. Also used by the § 312k cancel form. */
    public static function cancelAtPeriodEnd(User $user): bool
    {
        if (! $user->file_abo_subscription_id || ! StripeClient::configured()) {
            return false;
        }
        try {
            $sub = (new StripeClient())->post('subscriptions/'.$user->file_abo_subscription_id, ['cancel_at_period_end' => 'true']);
        } catch (Throwable $e) {
            Log::error('Stripe file abo cancel failed', ['user' => $user->id, 'error' => $e->getMessage()]);

            return false;
        }
        $end = $sub['current_period_end'] ?? $sub['items']['data'][0]['current_period_end'] ?? null;
        $user->forceFill(['file_abo_ends_at' => $end ? now()->setTimestamp((int) $end) : now()])->save();

        return true;
    }

    /** Called by StripeController::webhook. Returns true if the event belongs to this Abo. */
    public static function handleWebhook(string $type, array $object): bool
    {
        if (str_starts_with($type, 'checkout.session.')) {
            if (($object['metadata']['kind'] ?? null) !== self::KIND) {
                return false;
            }
            $user = User::find($object['metadata']['user_id'] ?? null);
            if ($user) {
                $paid = $type === 'checkout.session.async_payment_succeeded' || ($object['payment_status'] ?? '') === 'paid';
                $failed = $type === 'checkout.session.async_payment_failed';
                $user->forceFill([
                    'file_abo_subscription_id' => $object['subscription'] ?? $user->file_abo_subscription_id,
                    'file_abo_status' => $paid ? 'active' : ($failed ? 'none' : 'pending'),
                    'file_abo_ends_at' => null,
                ])->save();
            }

            return true;
        }

        $subscriptionId = str_starts_with($type, 'invoice.')
            ? ($object['subscription'] ?? $object['parent']['subscription_details']['subscription'] ?? null)
            : ($object['id'] ?? null);
        $user = $subscriptionId ? User::where('file_abo_subscription_id', $subscriptionId)->first() : null;
        if (! $user) {
            return false;
        }

        match ($type) {
            'invoice.paid' => $user->forceFill(['file_abo_status' => 'active'])->save(),
            'invoice.payment_failed' => $user->forceFill(['file_abo_status' => 'past_due'])->save(),
            'customer.subscription.deleted' => $user->forceFill(['file_abo_status' => 'canceled', 'file_abo_ends_at' => now()])->save(),
            default => null,
        };

        return true;
    }

    private function state(User $user): array
    {
        return self::stateFor($user);
    }

    public static function stateFor(User $user): array
    {
        $paid = in_array($user->file_abo_status, ['active', 'past_due'], true);

        return [
            'active' => $user->hasFileAbo(),
            'status' => $user->file_abo_status ?? 'none',
            'ends_at' => $user->file_abo_ends_at?->toIso8601String(),
            // Free months from a voucher code; "free" is true while they are what keeps the Abo active
            'free' => ! $paid && $user->hasFreeFileAbo(),
            'free_until' => $user->hasFreeFileAbo() ? $user->file_abo_free_until->toIso8601String() : null,
            'price' => round(self::priceCents() / 100, 2),
            'currency' => 'EUR',
            'vat_included' => true,
            'used' => $user->fileAboUsed(),
            'limit' => User::fileAboLimit(),
        ];
    }
}
