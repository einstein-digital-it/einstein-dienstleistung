<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProviderDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderDocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $documents = ProviderDocument::query()
            ->when($request->filled('provider_id'), fn ($query) => $query->where('service_provider_id', $request->integer('provider_id')))
            ->when($request->filled('provider_email'), fn ($query) => $query->where('provider_email', $request->string('provider_email')))
            ->latest()
            ->limit(min((int) $request->integer('limit', 200), 500))
            ->get();

        return response()->json(['data' => $documents]);
    }

    public function store(Request $request): JsonResponse
    {
        $document = ProviderDocument::create($request->validate($this->rules()));

        return response()->json(['data' => $document], 201);
    }

    public function destroy(ProviderDocument $providerDocument): JsonResponse
    {
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
}
