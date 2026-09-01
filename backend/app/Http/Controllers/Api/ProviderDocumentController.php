<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProviderDocument;
use App\Models\ServiceProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderDocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ProviderDocument::query();

        if ($request->user()->role === 'provider') {
            $provider = $this->providerForRequest($request);
            $query->where(function ($documents) use ($provider) {
                $documents
                    ->where('service_provider_id', $provider->id)
                    ->orWhere('provider_email', $provider->email);
            });
        } else {
            $query
                ->when($request->filled('provider_id'), fn ($documents) => $documents->where('service_provider_id', $request->integer('provider_id')))
                ->when($request->filled('provider_email'), fn ($documents) => $documents->where('provider_email', $request->string('provider_email')));
        }

        $documents = $query
            ->latest()
            ->limit(min((int) $request->integer('limit', 200), 500))
            ->get();

        return response()->json(['data' => $documents]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());

        if ($request->user()->role === 'provider') {
            $provider = $this->providerForRequest($request);
            $data['service_provider_id'] = $provider->id;
            $data['provider_email'] = $provider->email;
        }

        $document = ProviderDocument::create($data);

        return response()->json(['data' => $document], 201);
    }

    public function destroy(Request $request, ProviderDocument $providerDocument): JsonResponse
    {
        if ($request->user()->role === 'provider') {
            $provider = $this->providerForRequest($request);
            abort_unless(
                $providerDocument->service_provider_id === $provider->id ||
                $providerDocument->provider_email === $provider->email,
                403,
                'Forbidden.',
            );
        }

        $providerDocument->delete();

        return response()->json(null, 204);
    }

    private function rules(): array
    {
        return [
            'service_provider_id' => ['sometimes', 'nullable', 'integer', 'exists:service_providers,id'],
            'provider_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'document_type' => ['sometimes', 'nullable', 'string', 'max:255'],
            'file_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'status' => ['sometimes', 'nullable', 'string', 'max:255'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
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
