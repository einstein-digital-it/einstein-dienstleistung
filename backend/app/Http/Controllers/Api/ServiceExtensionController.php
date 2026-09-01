<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceProvider;
use App\Models\ServiceExtension;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceExtensionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->integer('limit', 200), 500);

        $query = ServiceExtension::query()
            ->when($request->filled('status'), fn ($extensions) => $extensions->where('status', $request->string('status')))
            ->when($request->filled('payment_status'), fn ($extensions) => $extensions->where('payment_status', $request->string('payment_status')));

        if ($request->user()->role === 'provider') {
            $provider = $this->providerForRequest($request);
            $query->where(function ($extensions) use ($provider) {
                $extensions
                    ->where('provider_id', (string) $provider->id)
                    ->orWhere('provider_email', $provider->email);
            });
        } elseif ($request->user()->role === 'user') {
            $query->where('customer_email', $request->user()->email);
        } else {
            $query
                ->when($request->filled('provider_id'), fn ($extensions) => $extensions->where('provider_id', $request->string('provider_id')))
                ->when($request->filled('provider_email'), fn ($extensions) => $extensions->where('provider_email', $request->string('provider_email')))
                ->when($request->filled('customer_email'), fn ($extensions) => $extensions->where('customer_email', $request->string('customer_email')));
        }

        $extensions = $query
            ->latest()
            ->limit($limit)
            ->get();

        return response()->json(['data' => $extensions]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());

        if ($request->user()->role === 'provider') {
            $provider = $this->providerForRequest($request);
            $data['provider_id'] = (string) $provider->id;
            $data['provider_email'] = $provider->email;
            $data['provider_name'] = $provider->full_name;
        }

        if ($request->user()->role === 'user') {
            $data['customer_email'] = $request->user()->email;
            $data['customer_name'] = $request->user()->full_name ?: $request->user()->name;
        }

        $extension = ServiceExtension::create($data);

        return response()->json(['data' => $extension], 201);
    }

    public function update(Request $request, ServiceExtension $serviceExtension): JsonResponse
    {
        $this->authorizeExtension($request, $serviceExtension);
        $data = $request->validate($this->rules(partial: true));

        if ($request->user()->role === 'provider') {
            $data = collect($data)->only([
                'booking_id', 'booking_number', 'service_name', 'amount', 'description', 'documents_urls', 'status',
            ])->all();
            if (array_key_exists('status', $data)) {
                abort_unless($data['status'] === 'cancelled' && $serviceExtension->status === 'pending', 422, 'Providers can only cancel pending extension requests.');
            }
        }

        $serviceExtension->update($data);
        if ($request->user()->role === 'provider' && ! empty($data)) {
            Notification::create([
                'user_email' => $serviceExtension->customer_email,
                'type' => $serviceExtension->status === 'cancelled' ? 'extension_cancelled' : 'extension_updated',
                'title_de' => 'Service extension updated',
                'title_ar' => 'تم تحديث طلب التمديد',
                'title_en' => 'Service extension updated',
                'message_de' => $serviceExtension->booking_number,
                'message_ar' => $serviceExtension->booking_number,
                'message_en' => $serviceExtension->booking_number,
                'link' => 'MyBookings',
                'booking_id' => (string) $serviceExtension->booking_id,
            ]);
        }

        return response()->json(['data' => $serviceExtension->fresh()]);
    }

    public function authorizePayment(Request $request, ServiceExtension $serviceExtension): JsonResponse
    {
        $this->authorizeExtension($request, $serviceExtension);
        $serviceExtension->update([
            'payment_status' => 'authorized',
            'status' => 'pending',
        ]);

        return response()->json([
            'data' => [
                'extension' => $serviceExtension->fresh(),
                'payment' => [
                    'status' => 'authorized',
                    'provider' => 'manual',
                    'message' => 'Payment authorization recorded. Connect a payment gateway here for live capture.',
                ],
            ],
        ]);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'booking_id' => ['sometimes', 'nullable', 'exists:bookings,id'],
            'booking_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'customer_name' => [$required, 'string', 'max:255'],
            'customer_email' => [$required, 'email', 'max:255'],
            'provider_id' => ['sometimes', 'nullable', 'string', 'max:255'],
            'provider_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'service_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'provider_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(ServiceExtension::STATUSES)],
            'payment_status' => ['sometimes', Rule::in(ServiceExtension::PAYMENT_STATUSES)],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'description' => ['sometimes', 'nullable', 'string'],
            'documents_urls' => ['sometimes', 'nullable', 'array'],
            'documents_urls.*' => ['string', 'max:2048'],
        ];
    }

    private function authorizeExtension(Request $request, ServiceExtension $serviceExtension): void
    {
        if ($request->user()->role === 'admin') {
            return;
        }

        if ($request->user()->role === 'provider') {
            $provider = $this->providerForRequest($request);
            abort_unless(
                $serviceExtension->provider_id === (string) $provider->id ||
                $serviceExtension->provider_email === $provider->email,
                403,
                'Forbidden.',
            );

            return;
        }

        abort_unless($serviceExtension->customer_email === $request->user()->email, 403, 'Forbidden.');
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
