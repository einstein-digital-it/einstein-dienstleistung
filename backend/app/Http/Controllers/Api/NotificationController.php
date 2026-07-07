<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $notifications = Notification::query()
            ->where('user_email', $data['email'])
            ->latest()
            ->limit(200)
            ->get();

        return response()->json(['data' => $notifications]);
    }

    public function store(Request $request): JsonResponse
    {
        $notification = Notification::create($request->validate($this->rules()));

        return response()->json(['data' => $notification], 201);
    }

    public function markRead(Notification $notification): JsonResponse
    {
        $notification->update(['is_read' => true]);

        return response()->json(['data' => $notification->fresh()]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        Notification::query()
            ->where('user_email', $data['email'])
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return $this->index($request);
    }

    public function deleteRead(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        Notification::query()
            ->where('user_email', $data['email'])
            ->where('is_read', true)
            ->delete();

        return response()->json(null, 204);
    }

    private function rules(): array
    {
        return [
            'user_email' => ['required', 'email', 'max:255'],
            'type' => ['sometimes', 'string', 'max:255'],
            'title_de' => ['sometimes', 'nullable', 'string', 'max:255'],
            'title_ar' => ['sometimes', 'nullable', 'string', 'max:255'],
            'title_en' => ['sometimes', 'nullable', 'string', 'max:255'],
            'title_tr' => ['sometimes', 'nullable', 'string', 'max:255'],
            'title_es' => ['sometimes', 'nullable', 'string', 'max:255'],
            'message_de' => ['sometimes', 'nullable', 'string'],
            'message_ar' => ['sometimes', 'nullable', 'string'],
            'message_en' => ['sometimes', 'nullable', 'string'],
            'message_tr' => ['sometimes', 'nullable', 'string'],
            'message_es' => ['sometimes', 'nullable', 'string'],
            'link' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'booking_id' => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_read' => ['sometimes', 'boolean'],
        ];
    }
}
