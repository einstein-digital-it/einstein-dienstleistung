<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ServiceExtension;
use App\Models\ServiceProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderEarningsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $provider = $this->providerForRequest($request);
        $year = max(2020, min((int) $request->integer('year', now()->year), now()->year + 1));

        $bookings = Booking::query()
            ->where('status', 'completed')
            ->where(function ($query) use ($provider) {
                $query
                    ->where('provider_id', (string) $provider->id)
                    ->orWhere('confirmed_by_provider_id', (string) $provider->id)
                    ->orWhere('confirmed_by_provider_email', $provider->email);
            })
            ->whereYear('date', $year)
            ->orderByDesc('date')
            ->get();

        $extensions = ServiceExtension::query()
            ->where(function ($query) use ($provider) {
                $query
                    ->where('provider_id', (string) $provider->id)
                    ->orWhere('provider_email', $provider->email);
            })
            ->where('status', '!=', 'cancelled')
            ->whereYear('created_at', $year)
            ->latest()
            ->get();

        $bookingItems = $bookings->map(fn (Booking $booking) => [
            'id' => 'booking-'.$booking->id,
            'kind' => 'booking',
            'reference' => $booking->booking_number,
            'customer_name' => $booking->customer_name,
            'service_name' => $booking->service_name,
            'date' => $booking->date?->format('Y-m-d'),
            'amount' => (float) ($booking->price ?? 0),
            'payment_status' => $booking->payment_status,
            'invoice_url' => $booking->invoice_url,
            'status' => $booking->status,
        ]);
        $extensionItems = $extensions->map(fn (ServiceExtension $extension) => [
            'id' => 'extension-'.$extension->id,
            'kind' => 'extension',
            'reference' => $extension->booking_number,
            'customer_name' => $extension->customer_name,
            'service_name' => $extension->service_name,
            'date' => $extension->created_at?->format('Y-m-d'),
            'amount' => (float) ($extension->amount ?? 0),
            'payment_status' => $extension->payment_status,
            'invoice_url' => null,
            'status' => $extension->status,
        ]);
        $items = $bookingItems->concat($extensionItems)->sortByDesc('date')->values();

        $paid = $items->filter(fn (array $item) => in_array($item['payment_status'], ['paid', 'authorized'], true));
        $pending = $items->filter(fn (array $item) => in_array($item['payment_status'], ['unpaid', 'failed'], true));

        return response()->json([
            'data' => [
                'year' => $year,
                'summary' => [
                    'total_earned' => round($items->sum('amount'), 2),
                    'paid_amount' => round($paid->sum('amount'), 2),
                    'pending_amount' => round($pending->sum('amount'), 2),
                    'completed_services' => $items->count(),
                ],
                'items' => $items,
            ],
        ]);
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
}
