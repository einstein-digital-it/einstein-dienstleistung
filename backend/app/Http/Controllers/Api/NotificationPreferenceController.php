<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $preferences = $this->findOrCreate($data['email']);

        return response()->json(['data' => $preferences]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_email' => ['required', 'email', 'max:255'],
            'booking_confirmed' => ['sometimes', 'boolean'],
            'booking_changed' => ['sometimes', 'boolean'],
            'booking_cancelled' => ['sometimes', 'boolean'],
            'appointment_reminder' => ['sometimes', 'boolean'],
            'provider_documents_uploaded' => ['sometimes', 'boolean'],
            'payment_due_reminder' => ['sometimes', 'boolean'],
            'payment_received' => ['sometimes', 'boolean'],
            'review_request' => ['sometimes', 'boolean'],
            'email_notifications' => ['sometimes', 'boolean'],
            'in_app_notifications' => ['sometimes', 'boolean'],
            'notification_language' => ['sometimes', 'string', 'max:10'],
            'reminder_timing' => ['sometimes', 'nullable', 'array'],
            'reminder_timing.*' => ['string', 'max:255'],
        ]);

        $preferences = $this->findOrCreate($data['user_email']);
        $preferences->update($data);

        return response()->json(['data' => $preferences->fresh()]);
    }

    private function findOrCreate(string $email): NotificationPreference
    {
        return NotificationPreference::query()->firstOrCreate(
            ['user_email' => $email],
            ['notification_language' => 'de', 'reminder_timing' => ['24h', '1h']]
        );
    }
}
