<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminUserApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_users_can_be_listed_with_frontend_shape(): void
    {
        $this->withApiUser('admin');
        User::create([
            'name' => 'Admin User',
            'full_name' => 'Admin User',
            'email' => 'admin@example.com',
            'phone' => '12345',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Customer User',
            'full_name' => 'Customer User',
            'email' => 'customer@example.com',
            'phone' => '67890',
            'role' => 'user',
            'password' => Hash::make('password'),
        ]);

        $this->getJson('/api/admin/users')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonFragment([
                'full_name' => 'Customer User',
                'email' => 'customer@example.com',
                'role' => 'user',
                'phone' => '67890',
            ])
            ->assertJsonFragment([
                'full_name' => 'Admin User',
                'email' => 'admin@example.com',
                'role' => 'admin',
                'phone' => '12345',
            ]);
    }

    public function test_user_notifications_can_be_listed_and_marked_seen(): void
    {
        $this->withApiUser('admin');
        User::create([
            'name' => 'First User',
            'full_name' => 'First User',
            'email' => 'first@example.com',
            'role' => 'user',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Second User',
            'full_name' => 'Second User',
            'email' => 'second@example.com',
            'role' => 'user',
            'password' => Hash::make('password'),
        ]);

        UserNotification::create([
            'user_email' => 'first@example.com',
            'notification_sent' => false,
            'sent_date' => now(),
        ]);

        $this->getJson('/api/admin/user-notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user_email', 'first@example.com');

        $this->postJson('/api/admin/user-notifications/mark-all-seen', [
            'emails' => ['second@example.com'],
        ])
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->assertDatabaseHas('user_notifications', [
            'user_email' => 'second@example.com',
        ]);
    }

    public function test_admin_users_can_be_filtered_updated_and_deleted(): void
    {
        $this->withApiUser('admin');
        $user = User::create([
            'name' => 'Managed User',
            'full_name' => 'Managed User',
            'email' => 'managed@example.com',
            'phone' => '11111',
            'role' => 'user',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Other User',
            'full_name' => 'Other User',
            'email' => 'other@example.com',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        $this->getJson('/api/admin/users?role=user&search=managed')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'managed@example.com');

        $this->patchJson("/api/admin/users/{$user->id}", [
            'role' => 'provider',
            'is_active' => false,
        ])
            ->assertOk()
            ->assertJsonPath('data.role', 'provider')
            ->assertJsonPath('data.is_active', false);

        $this->deleteJson("/api/admin/users/{$user->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
        ]);
    }
}
