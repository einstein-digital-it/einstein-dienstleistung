<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CustomerRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->integer('limit', 500), 1000);

        $requests = CustomerRequest::query()
            ->when($request->filled('status') && $request->string('status')->toString() !== 'all', function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (CustomerRequest $customerRequest) => $this->serializeRequest($customerRequest));

        return response()->json(['data' => $requests]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $data['request_number'] ??= 'CR-' . now()->format('YmdHis') . '-' . random_int(100, 999);

        $customerRequest = CustomerRequest::create($data);

        return response()->json(['data' => $this->serializeRequest($customerRequest)], 201);
    }

    public function show(CustomerRequest $customerRequest): JsonResponse
    {
        return response()->json(['data' => $this->serializeRequest($customerRequest)]);
    }

    public function update(Request $request, CustomerRequest $customerRequest): JsonResponse
    {
        $customerRequest->update($request->validate($this->rules(partial: true)));

        return response()->json(['data' => $this->serializeRequest($customerRequest->fresh())]);
    }

    public function destroy(CustomerRequest $customerRequest): JsonResponse
    {
        $customerRequest->delete();

        return response()->json(null, 204);
    }

    public function accept(CustomerRequest $customerRequest): JsonResponse
    {
        $customerRequest->update(['status' => 'accepted']);

        return response()->json(['data' => $this->serializeRequest($customerRequest->fresh())]);
    }

    public function reject(CustomerRequest $customerRequest): JsonResponse
    {
        $customerRequest->update(['status' => 'rejected']);

        return response()->json(['data' => $this->serializeRequest($customerRequest->fresh())]);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'request_number' => ['sometimes', 'string', 'max:255'],
            'customer_name' => [$required, 'string', 'max:255'],
            'customer_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'customer_phone' => ['sometimes', 'nullable', 'string', 'max:255'],
            'service_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'category' => ['sometimes', 'nullable', 'string', 'max:255'],
            'date' => ['sometimes', 'nullable', 'date'],
            'time' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', Rule::in(CustomerRequest::STATUSES)],
            'description' => ['sometimes', 'nullable', 'string'],
            'assigned_to' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }

    private function serializeRequest(CustomerRequest $customerRequest): array
    {
        return [
            'id' => $customerRequest->id,
            'request_number' => $customerRequest->request_number,
            'customer_name' => $customerRequest->customer_name,
            'customer_email' => $customerRequest->customer_email,
            'customer_phone' => $customerRequest->customer_phone,
            'service_name' => $customerRequest->service_name,
            'category' => $customerRequest->category,
            'date' => $customerRequest->date,
            'time' => $customerRequest->time,
            'address' => $customerRequest->address,
            'price' => $customerRequest->price !== null ? (float) $customerRequest->price : null,
            'status' => $customerRequest->status,
            'description' => $customerRequest->description,
            'assigned_to' => $customerRequest->assigned_to,
            'created_at' => $customerRequest->created_at?->toISOString(),
            'updated_at' => $customerRequest->updated_at?->toISOString(),
        ];
    }
}
