<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->integer('limit', 500), 1000);

        $users = User::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = '%' . $request->string('search')->toString() . '%';
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', $search)
                        ->orWhere('full_name', 'like', $search)
                        ->orWhere('email', 'like', $search)
                        ->orWhere('phone', 'like', $search);
                });
            })
            ->when($request->filled('role') && $request->string('role')->toString() !== 'all', function ($query) use ($request) {
                $query->where('role', $request->string('role'));
            })
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (User $user) => $this->serializeUser($user));

        return response()->json(['data' => $users]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'full_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:255'],
            'role' => ['sometimes', Rule::in(['admin', 'provider', 'user'])],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (isset($data['full_name']) && ! isset($data['name'])) {
            $data['name'] = $data['full_name'];
        }

        $user->update($data);

        return response()->json(['data' => $this->serializeUser($user->fresh())]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(null, 204);
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'full_name' => $user->full_name ?: $user->name,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role ?: 'user',
            'is_active' => $user->is_active ?? true,
            'created_date' => $user->created_at?->toISOString(),
            'created_at' => $user->created_at?->toISOString(),
            'updated_at' => $user->updated_at?->toISOString(),
        ];
    }
}
