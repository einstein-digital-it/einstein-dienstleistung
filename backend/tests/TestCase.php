<?php

namespace Tests;

use App\Models\AuthSession;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

abstract class TestCase extends BaseTestCase
{
    protected function withApiUser(string $role = 'admin', ?string $email = null): User
    {
        $email ??= "{$role}-".Str::random(8).'@example.test';

        $user = User::query()->create([
            'name' => ucfirst($role).' User',
            'full_name' => ucfirst($role).' User',
            'email' => $email,
            'role' => $role,
            'is_active' => true,
            'password' => Hash::make('secret123'),
        ]);

        $token = Str::random(80);

        AuthSession::query()->create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addDays(30),
        ]);

        $this->withHeader('Authorization', "Bearer {$token}");

        return $user;
    }
}
