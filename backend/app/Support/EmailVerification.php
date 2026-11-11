<?php

namespace App\Support;

use App\Mail\VerificationCodeMail;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * New customers confirm their email with a 6-digit code before they can sign in.
 * A code works for 30 minutes and allows 5 wrong tries; a new code can be sent once a minute.
 */
class EmailVerification
{
    public const MAX_ATTEMPTS = 5;
    public const VALID_MINUTES = 30;
    public const RESEND_SECONDS = 60;

    public static function enabled(): bool
    {
        return (bool) config('services.auth.verify_email', true);
    }

    /** Customers (role user) who have not confirmed their email yet. */
    public static function required(User $user): bool
    {
        return self::enabled() && ($user->role ?: 'user') === 'user' && $user->email_verified_at === null;
    }

    /** Sends a new code unless one was sent less than a minute ago. Returns false when nothing was sent. */
    public static function send(User $user): bool
    {
        $sentAt = $user->email_verification_sent_at;
        if ($sentAt && $sentAt->gt(now()->subSeconds(self::RESEND_SECONDS))) {
            return false;
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->forceFill([
            'email_verification_code' => self::hash($user, $code),
            'email_verification_expires_at' => now()->addMinutes(self::VALID_MINUTES),
            'email_verification_sent_at' => now(),
            'email_verification_attempts' => 0,
        ])->save();

        try {
            Mail::to($user->email)->send(new VerificationCodeMail($code, $user->preferred_language ?: 'de'));
        } catch (\Throwable $e) {
            // The account stays; the customer can ask for a new code
            Log::error('Verification email could not be sent', ['user_id' => $user->id, 'error' => $e->getMessage()]);

            return false;
        }

        return true;
    }

    /** @return 'ok'|'invalid'|'expired'|'too_many' */
    public static function check(User $user, string $code): string
    {
        if (! $user->email_verification_code) {
            return 'invalid';
        }
        if ($user->email_verification_attempts >= self::MAX_ATTEMPTS) {
            return 'too_many';
        }
        if (! $user->email_verification_expires_at || $user->email_verification_expires_at->isPast()) {
            return 'expired';
        }
        if (! hash_equals($user->email_verification_code, self::hash($user, $code))) {
            $user->increment('email_verification_attempts');

            return 'invalid';
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'email_verification_code' => null,
            'email_verification_expires_at' => null,
            'email_verification_attempts' => 0,
        ])->save();

        return 'ok';
    }

    private static function hash(User $user, string $code): string
    {
        return hash_hmac('sha256', $user->id.'|'.$code, (string) config('app.key'));
    }
}
