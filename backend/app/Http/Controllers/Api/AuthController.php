<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuthSession;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        return response()->json([
            'data' => [
                'user' => $this->serializeUser($user),
                'session' => $this->createSession($user),
            ],
        ]);
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

        return response()->json([
            'data' => [
                'user' => $this->serializeUser($user),
                'session' => $this->createSession($user),
            ],
        ], 201);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $this->userFromBearerToken($request);
        if (! $user) {
            $data = $request->validate([
                'email' => ['required', 'email', 'max:255'],
            ]);

            $user = User::query()->where('email', $data['email'])->firstOrFail();
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
