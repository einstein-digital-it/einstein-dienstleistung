<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\StripeClient;
use App\Support\FileAboPlans;
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

    /** Gross monthly price in cents (VAT included) of a plan (default: basic). */
    public static function priceCents(?string $plan = null): int
    {
        return FileAboPlans::get($plan)['price_cents'];
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

    /** POST customer/subscription/checkout { lang?, plan? } — returns { url } of the Stripe payment page. */
    public function checkout(Request $request): JsonResponse
    {
        $user = $request->user();
        $plan = FileAboPlans::exists($request->input('plan')) ? $request->input('plan') : FileAboPlans::DEFAULT;
        if ($user->hasFileAbo()) {
            return response()->json(['message' => 'Your subscription is already active.'], 409);
        }
        if (! StripeClient::configured()) {
            return response()->json(['message' => 'Online payment is not configured yet (STRIPE_SECRET missing).'], 503);
        }

        $base = \App\Support\SiteUrl::for($request);
        $lang = in_array($request->input('lang'), ['de', 'en', 'es'], true) ? $request->input('lang') : 'auto';
        $vatRate = (float) config('services.tax.vat_rate', 0.19);
        $metadata = ['kind' => self::KIND, 'user_id' => (string) $user->id, 'plan' => $plan];

        try {
            $session = (new StripeClient())->post('checkout/sessions', [
                'mode' => 'subscription',
                'line_items' => [[
                    'quantity' => 1,
                    'price_data' => [
                        'currency' => 'eur',
                        'unit_amount' => self::priceCents($plan),
                        'recurring' => ['interval' => 'month'],
                        'product_data' => [
                            'name' => self::productName($plan),
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

    /**
     * POST customer/subscription/plan { plan } — switch a running paid Abo to another plan.
     * Stripe charges the difference for the rest of the month (proration); the new
     * question allowance applies right away.
     */
    public function changePlan(Request $request): JsonResponse
    {
        $data = $request->validate(['plan' => ['required', 'string']]);
        $user = $request->user();
        if (! FileAboPlans::exists($data['plan'])) {
            return response()->json(['message' => 'Unknown plan.'], 422);
        }
        if (! in_array($user->file_abo_status, ['active', 'past_due'], true) || ! $user->file_abo_subscription_id || ! StripeClient::configured()) {
            return response()->json(['message' => 'No running subscription to change.', 'code' => 'no_subscription'], 409);
        }
        if ($user->file_abo_plan === $data['plan']) {
            return response()->json(['data' => $this->state($user)]);
        }

        $vatRate = (float) config('services.tax.vat_rate', 0.19);
        try {
            $stripe = new StripeClient();
            $subscription = $stripe->get('subscriptions/'.$user->file_abo_subscription_id);
            $itemId = $subscription['items']['data'][0]['id'] ?? null;
            $productId = $subscription['items']['data'][0]['price']['product'] ?? null;
            if (! $itemId || ! $productId) {
                throw new \RuntimeException('Subscription item not found');
            }
            $stripe->post('subscriptions/'.$user->file_abo_subscription_id, [
                'items' => [[
                    'id' => $itemId,
                    'price_data' => [
                        'currency' => 'eur',
                        'product' => $productId,
                        'unit_amount' => self::priceCents($data['plan']),
                        'recurring' => ['interval' => 'month'],
                    ],
                ]],
                'proration_behavior' => 'create_prorations',
                'cancel_at_period_end' => 'false',
                'metadata' => ['kind' => self::KIND, 'user_id' => (string) $user->id, 'plan' => $data['plan']],
            ]);
        } catch (Throwable $e) {
            Log::error('Stripe file abo plan change failed', ['user' => $user->id, 'error' => $e->getMessage()]);

            return response()->json(['message' => 'The plan could not be changed. Please try again later.'], 502);
        }

        $user->forceFill(['file_abo_plan' => $data['plan'], 'file_abo_ends_at' => null])->save();

        return response()->json(['data' => $this->state($user->refresh())]);
    }

    private static function productName(string $plan): string
    {
        return ['basic' => 'EinStein Unterlagen-Abo Basis', 'silver' => 'EinStein Unterlagen-Abo Silber', 'unlimited' => 'EinStein Unterlagen-Abo Unbegrenzt'][$plan] ?? 'EinStein Unterlagen-Abo';
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
                $plan = $object['metadata']['plan'] ?? null;
                $user->forceFill([
                    'file_abo_subscription_id' => $object['subscription'] ?? $user->file_abo_subscription_id,
                    'file_abo_status' => $paid ? 'active' : ($failed ? 'none' : 'pending'),
                    'file_abo_ends_at' => null,
                    'file_abo_plan' => FileAboPlans::exists($plan) ? $plan : $user->file_abo_plan,
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
        $plan = $paid && FileAboPlans::exists($user->file_abo_plan) ? $user->file_abo_plan : FileAboPlans::DEFAULT;

        return [
            'plan' => $plan,
            'plans' => FileAboPlans::forApi(),
            'questions_used' => $user->fileAboQuestionsUsed(),
            'questions_limit' => $user->fileAboQuestionLimit(),
            'active' => $user->hasFileAbo(),
            'status' => $user->file_abo_status ?? 'none',
            'ends_at' => $user->file_abo_ends_at?->toIso8601String(),
            // Free months from a voucher code; "free" is true while they are what keeps the Abo active
            'free' => ! $paid && $user->hasFreeFileAbo(),
            'free_until' => $user->hasFreeFileAbo() ? $user->file_abo_free_until->toIso8601String() : null,
            'price' => round(self::priceCents($plan) / 100, 2),
            'currency' => 'EUR',
            'vat_included' => true,
            'used' => $user->fileAboUsed(),
            'limit' => User::fileAboLimit(),
        ];
    }
}
