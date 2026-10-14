<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Minimal Stripe REST client (no SDK needed).
 * Keys come from .env: STRIPE_SECRET and STRIPE_WEBHOOK_SECRET.
 */
class StripeClient
{
    private const API = 'https://api.stripe.com/v1/';

    public static function configured(): bool
    {
        return (string) config('services.stripe.secret') !== '';
    }

    public function post(string $path, array $params): array
    {
        $response = Http::asForm()
            ->withToken((string) config('services.stripe.secret'))
            ->timeout(20)
            ->post(self::API.ltrim($path, '/'), $params);

        if ($response->failed()) {
            $message = $response->json('error.message') ?? $response->body();
            throw new RuntimeException('Stripe: '.$message);
        }

        return $response->json();
    }

    /**
     * Verify a webhook "Stripe-Signature" header and return the decoded event.
     */
    public static function verifyWebhook(string $payload, string $header, int $tolerance = 300): array
    {
        $secret = (string) config('services.stripe.webhook_secret');
        if ($secret === '') {
            throw new RuntimeException('STRIPE_WEBHOOK_SECRET is not set.');
        }

        $timestamp = null;
        $signatures = [];
        foreach (explode(',', $header) as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
            if ($key === 't') {
                $timestamp = (int) $value;
            } elseif ($key === 'v1') {
                $signatures[] = $value;
            }
        }

        if (! $timestamp || $signatures === [] || abs(time() - $timestamp) > $tolerance) {
            throw new RuntimeException('Invalid or expired Stripe signature.');
        }

        $expected = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);
        foreach ($signatures as $signature) {
            if (hash_equals($expected, $signature)) {
                $event = json_decode($payload, true);
                if (! is_array($event)) {
                    throw new RuntimeException('Invalid Stripe payload.');
                }

                return $event;
            }
        }

        throw new RuntimeException('Stripe signature mismatch.');
    }
}
