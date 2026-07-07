<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $user = $this->findOrCreateUser($data['email']);

        return response()->json(['data' => $this->serializeUser($user)]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'full_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'preferred_language' => ['sometimes', 'nullable', 'string', 'max:10'],
            'avatar_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
        ]);

        $user = $this->findOrCreateUser($data['email']);
        unset($data['email']);

        if (isset($data['full_name']) && ! isset($data['name'])) {
            $data['name'] = $data['full_name'] ?: $user->name;
        }

        $user->update($data);

        return response()->json(['data' => $this->serializeUser($user->fresh())]);
    }

    private function findOrCreateUser(string $email): User
    {
        return User::query()->firstOrCreate(
            ['email' => $email],
            [
                'name' => Str::before($email, '@'),
                'full_name' => Str::before($email, '@'),
                'role' => 'user',
                'password' => Hash::make(Str::random(32)),
            ]
        );
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
            'updated_at' => $user->updated_at?->toISOString(),
        ];
    }
}
