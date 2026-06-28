<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ServiceProvider;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ServiceProviderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->integer('limit', 500), 1000);

        $providers = ServiceProvider::query()
            ->when($request->filled('status') && $request->string('status')->toString() !== 'all', function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (ServiceProvider $provider) => $this->serializeProvider($provider));

        return response()->json(['data' => $providers]);
    }

    public function store(Request $request): JsonResponse
    {
        $provider = ServiceProvider::create($request->validate($this->rules()));

        return response()->json(['data' => $this->serializeProvider($provider)], 201);
    }

    public function show(ServiceProvider $serviceProvider): JsonResponse
    {
        return response()->json(['data' => $this->serializeProvider($serviceProvider)]);
    }

    public function update(Request $request, ServiceProvider $serviceProvider): JsonResponse
    {
        $serviceProvider->update($request->validate($this->rules(partial: true)));

        return response()->json(['data' => $this->serializeProvider($serviceProvider->fresh())]);
    }

    public function destroy(ServiceProvider $serviceProvider): JsonResponse
    {
        $serviceProvider->delete();

        return response()->json(null, 204);
    }

    public function approve(ServiceProvider $serviceProvider): JsonResponse
    {
        $user = User::query()->updateOrCreate(
            ['email' => $serviceProvider->email],
            [
                'name' => $serviceProvider->full_name,
                'full_name' => $serviceProvider->full_name,
                'phone' => $serviceProvider->phone,
                'role' => 'provider',
                'password' => Hash::make(Str::random(32)),
            ]
        );

        $serviceProvider->update([
            'user_id' => $user->id,
            'status' => 'approved',
            'login_enabled' => true,
            'approved_at' => Carbon::now(),
            'rejected_at' => null,
        ]);

        return response()->json(['data' => $this->serializeProvider($serviceProvider->fresh())]);
    }

    public function reject(ServiceProvider $serviceProvider): JsonResponse
    {
        $serviceProvider->update([
            'status' => 'rejected',
            'login_enabled' => false,
            'rejected_at' => Carbon::now(),
        ]);

        return response()->json(['data' => $this->serializeProvider($serviceProvider->fresh())]);
    }

    public function requestWelcomeEmail(ServiceProvider $serviceProvider): JsonResponse
    {
        $serviceProvider->update([
            'welcome_email_requested_at' => Carbon::now(),
        ]);

        return response()->json(['data' => $this->serializeProvider($serviceProvider->fresh())]);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'full_name' => [$required, 'string', 'max:255'],
            'email' => [$required, 'email', 'max:255', Rule::unique('service_providers', 'email')->ignore(request()->route('serviceProvider'))],
            'phone' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'profile_image' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'bio_de' => ['sometimes', 'nullable', 'string'],
            'bio_ar' => ['sometimes', 'nullable', 'string'],
            'bio_en' => ['sometimes', 'nullable', 'string'],
            'experience_years' => ['sometimes', 'integer', 'min:0'],
            'service_area' => ['sometimes', 'nullable', 'string', 'max:255'],
            'availability' => ['sometimes', 'nullable', 'array'],
            'availability.*' => ['string', 'max:255'],
            'working_hours_start' => ['sometimes', 'nullable', 'string', 'max:255'],
            'working_hours_end' => ['sometimes', 'nullable', 'string', 'max:255'],
            'categories' => ['sometimes', 'nullable', 'array'],
            'categories.*' => ['string', 'max:255'],
            'languages' => ['sometimes', 'nullable', 'array'],
            'languages.*' => ['string', 'max:255'],
            'qualifications' => ['sometimes', 'nullable', 'string'],
            'documents_urls' => ['sometimes', 'nullable', 'array'],
            'documents_urls.*' => ['string', 'max:2048'],
            'hourly_rate' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'city' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(ServiceProvider::STATUSES)],
            'notes' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }

    private function serializeProvider(ServiceProvider $provider): array
    {
        $documents = count($provider->documents_urls ?? []);
        $totalJobs = Booking::query()
            ->where(function ($query) use ($provider) {
                $query->where('confirmed_by_provider_id', (string) $provider->id)
                    ->orWhere('confirmed_by_provider_email', $provider->email)
                    ->orWhere('provider_name', $provider->full_name);
            })
            ->count();

        return [
            'id' => $provider->id,
            'user_id' => $provider->user_id,
            'full_name' => $provider->full_name,
            'email' => $provider->email,
            'phone' => $provider->phone,
            'address' => $provider->address,
            'profile_image' => $provider->profile_image,
            'bio_de' => $provider->bio_de,
            'bio_ar' => $provider->bio_ar,
            'bio_en' => $provider->bio_en,
            'experience_years' => $provider->experience_years,
            'service_area' => $provider->service_area,
            'availability' => $provider->availability ?? [],
            'working_hours_start' => $provider->working_hours_start,
            'working_hours_end' => $provider->working_hours_end,
            'categories' => $provider->categories ?? [],
            'languages' => $provider->languages ?? [],
            'qualifications' => $provider->qualifications,
            'documents_urls' => $provider->documents_urls ?? [],
            'documents' => $documents,
            'hourly_rate' => $provider->hourly_rate !== null ? (float) $provider->hourly_rate : null,
            'city' => $provider->city ?: $provider->service_area,
            'status' => $provider->status,
            'notes' => $provider->notes,
            'login_enabled' => $provider->login_enabled,
            'total_jobs' => $totalJobs,
            'approved_at' => $provider->approved_at?->toISOString(),
            'rejected_at' => $provider->rejected_at?->toISOString(),
            'welcome_email_requested_at' => $provider->welcome_email_requested_at?->toISOString(),
            'created_at' => $provider->created_at?->toISOString(),
            'updated_at' => $provider->updated_at?->toISOString(),
        ];
    }
}
