<?php

namespace App\Http\Middleware;

use App\Models\AuthSession;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenAuth
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return $this->error('Unauthenticated.', 401);
        }

        $session = AuthSession::query()
            ->with('user')
            ->where('token_hash', hash('sha256', $token))
            ->whereNull('revoked_at')
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->first();

        $user = $session?->user;
        if (! $user || $user->is_active === false) {
            return $this->error('Unauthenticated.', 401);
        }

        if ($roles && ! in_array($user->role, $roles, true)) {
            return $this->error('Forbidden.', 403);
        }

        $request->setUserResolver(fn () => $user);

        return $next($request);
    }

    private function error(string $message, int $status): JsonResponse
    {
        return response()->json(['message' => $message], $status);
    }
}
