<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuthSession;
use App\Models\Booking;
use App\Models\ManagedClient;
use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Models\UserNotification;
use App\Support\EmailVerification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        if ($user->is_active === false) {
            throw ValidationException::withMessages([
                'email' => ['This account is disabled.'],
            ]);
        }

        if (EmailVerification::required($user)) {
            // A fresh code is sent (at most once a minute) so the customer can finish signing up
            EmailVerification::send($user);

            return $this->verificationNeeded($user, 403);
        }

        return response()->json([
            'data' => [
                'user' => $this->serializeUser($user),
                'session' => $this->createSession($user),
            ],
        ]);
    }

    /** Confirms the email with the 6-digit code and signs the customer in. */
    public function verifyEmail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'code' => ['required', 'string', 'regex:/^\d{6}$/'],
        ]);

        $user = User::query()->where('email', $data['email'])->first();
        if (! $user || $user->is_active === false) {
            return response()->json(['message' => 'The code is not correct.', 'code' => 'invalid_code'], 422);
        }

        // A confirmed account signs in with its password, never with a code
        if ($user->email_verified_at !== null) {
            return response()->json(['message' => 'This email is already confirmed. Please sign in.', 'code' => 'already_verified'], 409);
        }

        $result = EmailVerification::check($user, $data['code']);
        if ($result !== 'ok') {
            [$status, $message] = match ($result) {
                'too_many' => [429, 'Too many wrong codes. Please ask for a new code.'],
                'expired' => [422, 'The code has expired. Please ask for a new code.'],
                default => [422, 'The code is not correct.'],
            };

            return response()->json(['message' => $message, 'code' => $result === 'invalid' ? 'invalid_code' : $result], $status);
        }

        return response()->json([
            'data' => [
                'user' => $this->serializeUser($user->refresh()),
                'session' => $this->createSession($user),
            ],
        ]);
    }

    /** Sends a new code. Always answers the same, so it does not reveal which emails have accounts. */
    public function resendVerification(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $user = User::query()->where('email', $data['email'])->first();
        if ($user && $user->is_active !== false && EmailVerification::required($user)) {
            EmailVerification::send($user);
        }

        return response()->json(['data' => ['sent' => true]]);
    }

    private function verificationNeeded(User $user, int $status): JsonResponse
    {
        return response()->json([
            'message' => 'Please confirm your email address. We have sent you a code.',
            'code' => 'email_not_verified',
            'data' => [
                'verification_required' => true,
                'email' => $user->email,
            ],
        ], $status);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'preferred_language' => ['sometimes', 'nullable', 'string', 'max:10'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'full_name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'preferred_language' => $data['preferred_language'] ?? null,
            'role' => 'user',
            'is_active' => true,
        ]);

        if (EmailVerification::enabled()) {
            EmailVerification::send($user);

            return $this->verificationNeeded($user, 201);
        }

        $user->forceFill(['email_verified_at' => now()])->save();

        return response()->json([
            'data' => [
                'user' => $this->serializeUser($user),
                'session' => $this->createSession($user),
            ],
        ], 201);
    }

    public function providerLogin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        $provider = ServiceProvider::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)->orWhere('email', $user->email);
            })
            ->first();

        if ($user->is_active === false ||
            $user->role !== 'provider' ||
            ! $provider ||
            $provider->status !== 'approved' ||
            ! $provider->login_enabled) {
            throw ValidationException::withMessages([
                'email' => ['This provider account is not enabled.'],
            ]);
        }

        return response()->json([
            'data' => [
                'user' => $this->serializeUser($user),
                'provider' => [
                    'id' => $provider->id,
                    'status' => $provider->status,
                    'login_enabled' => $provider->login_enabled,
                ],
                'session' => $this->createSession($user),
            ],
        ]);
    }

    public function providerRegister(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email', 'unique:service_providers,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $provider = DB::transaction(function () use ($data): ServiceProvider {
            $user = User::create([
                'name' => $data['full_name'],
                'full_name' => $data['full_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'role' => 'provider',
                'is_active' => false,
            ]);

            return ServiceProvider::create([
                'user_id' => $user->id,
                'full_name' => $data['full_name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'status' => 'pending',
                'login_enabled' => false,
            ]);
        });

        return response()->json([
            'data' => [
                'provider' => [
                    'id' => $provider->id,
                    'status' => $provider->status,
                    'login_enabled' => $provider->login_enabled,
                ],
            ],
        ], 201);
    }

    public function me(Request $request): JsonResponse
    {
        // Only the signed-in user's own data; never look anyone up by email
        $user = $this->userFromBearerToken($request);
        if (! $user || $user->is_active === false) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json(['data' => $this->serializeUser($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        if ($token) {
            AuthSession::query()
                ->where('token_hash', hash('sha256', $token))
                ->whereNull('revoked_at')
                ->update(['revoked_at' => now()]);
        }

        return response()->json(null, 204);
    }

    /**
     * Customers delete their own account from the app (required by Google Play
     * and the App Store). Bookings stay, because invoices must be kept by law.
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();
        if (! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The password is incorrect.'],
            ]);
        }

        // Deleting the account must not leave a Stripe subscription running.
        $hasActiveAbo = Booking::query()
            ->whereIn('category', StripeController::SUBSCRIPTION_CATEGORIES)
            ->whereRaw('LOWER(customer_email) = ?', [strtolower($user->email)])
            ->whereNotNull('stripe_subscription_id')
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->exists();
        if ($hasActiveAbo) {
            return response()->json([
                'message' => 'Please cancel your subscription before deleting your account.',
                'code' => 'active_subscription',
            ], 409);
        }

        DB::transaction(function () use ($user): void {
            AuthSession::query()->where('user_id', $user->id)->delete();
            ManagedClient::query()->where('owner_user_id', $user->id)->delete();
            Notification::query()->where('user_email', $user->email)->delete();
            NotificationPreference::query()->where('user_email', $user->email)->delete();
            UserNotification::query()->where('user_email', $user->email)->delete();
            $user->delete();
        });

        return response()->json(null, 204);
    }

    private function createSession(User $user): array
    {
        $token = Str::random(80);
        $expiresAt = now()->addDays(30);

        AuthSession::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $token),
            'expires_at' => $expiresAt,
        ]);

        return [
            'token' => $token,
            'issued_at' => now()->toISOString(),
            'expires_at' => $expiresAt->toISOString(),
        ];
    }

    private function userFromBearerToken(Request $request): ?User
    {
        $token = $request->bearerToken();
        if (! $token) return null;

        $session = AuthSession::query()
            ->with('user')
            ->where('token_hash', hash('sha256', $token))
            ->whereNull('revoked_at')
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->first();

        return $session?->user;
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'full_name' => $user->full_name ?: $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'role' => $user->role ?: 'user',
            'preferred_language' => $user->preferred_language,
            'avatar_url' => $user->avatar_url,
            'is_active' => $user->is_active ?? true,
            'created_at' => $user->created_at?->toISOString(),
        ];
    }
}
