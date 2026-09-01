<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\ServiceProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $provider = $this->providerForRequest($request);

        return response()->json([
            'data' => Notification::query()
                ->where('user_email', $provider->email)
                ->latest()
                ->limit(200)
                ->get()
                ->map(fn (Notification $notification) => $this->serialize($notification)),
        ]);
    }

    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        $provider = $this->providerForRequest($request);
        abort_unless($notification->user_email === $provider->email, 403, 'Forbidden.');

        $notification->update(['is_read' => true]);

        return response()->json(['data' => $this->serialize($notification->fresh())]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $provider = $this->providerForRequest($request);

        Notification::query()
            ->where('user_email', $provider->email)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return $this->index($request);
    }

    private function providerForRequest(Request $request): ServiceProvider
    {
        $provider = ServiceProvider::query()
            ->where(function ($query) use ($request) {
                $query
                    ->where('user_id', $request->user()->id)
                    ->orWhere('email', $request->user()->email);
            })
            ->first();

        abort_unless(
            $provider && $provider->status === 'approved' && $provider->login_enabled,
            403,
            'Provider account is not enabled.',
        );

        return $provider;
    }

    private function serialize(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'title_de' => $notification->title_de,
            'title_ar' => $notification->title_ar,
            'title_en' => $notification->title_en,
            'message_de' => $notification->message_de,
            'message_ar' => $notification->message_ar,
            'message_en' => $notification->message_en,
            'link' => $notification->link,
            'booking_id' => $notification->booking_id,
            'is_read' => $notification->is_read,
            'created_at' => $notification->created_at?->toISOString(),
        ];
    }
}
