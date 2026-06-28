<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        UserNotification::query()->delete();

        $users = [
            [
                'name' => 'A.A',
                'full_name' => 'A.A',
                'email' => 'beshraa79@gmail.com',
                'phone' => '01638266943',
                'role' => 'admin',
                'created_at' => '2026-05-01 09:20:00',
            ],
            [
                'name' => 'ENG. MOHAMMED K. M. ABDELRAHMAN',
                'full_name' => 'ENG. MOHAMMED K. M. ABDELRAHMAN',
                'email' => 'ingr.mohammed.abdelrahman@gmail.com',
                'phone' => '01764667860',
                'role' => 'user',
                'created_at' => '2026-05-25 10:00:00',
            ],
            [
                'name' => 'Ahmed Al-Saleh',
                'full_name' => 'Ahmed Al-Saleh',
                'email' => 'asmiahmd@gmail.com',
                'phone' => '0992086301',
                'role' => 'user',
                'created_at' => '2026-05-16 16:00:00',
            ],
            [
                'name' => 'faraheldelbi',
                'full_name' => 'faraheldelbi',
                'email' => 'faraheldelbi@gmail.com',
                'phone' => '06927246275',
                'role' => 'user',
                'created_at' => '2026-04-23 16:00:00',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    ...$user,
                    'password' => Hash::make('password'),
                    'updated_at' => $user['created_at'],
                ]
            );
        }

        UserNotification::updateOrCreate(
            ['user_email' => 'beshraa79@gmail.com'],
            [
                'notification_sent' => false,
                'sent_date' => '2026-05-01 09:20:00',
            ]
        );
    }
}
