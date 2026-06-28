<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class UserNotificationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => UserNotification::query()
                ->latest('sent_date')
                ->get()
                ->map(fn (UserNotification $notification) => [
                    'id' => $notification->id,
                    'user_email' => $notification->user_email,
                    'notification_sent' => $notification->notification_sent,
                    'sent_date' => $notification->sent_date?->toISOString(),
                ]),
        ]);
    }

    public function markAllSeen(Request $request): JsonResponse
    {
        $emails = $request->input('emails');

        if (! is_array($emails) || count($emails) === 0) {
            $emails = User::query()->pluck('email')->all();
        }

        $now = Carbon::now();

        foreach ($emails as $email) {
            if (! is_string($email) || trim($email) === '') {
                continue;
            }

            UserNotification::updateOrCreate(
                ['user_email' => $email],
                [
                    'notification_sent' => false,
                    'sent_date' => $now,
                ]
            );
        }

        return $this->index();
    }
}
