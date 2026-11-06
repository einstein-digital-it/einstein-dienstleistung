<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Customer endpoints take the account email as a parameter ("email" /
 * "user_email"). For normal customers that parameter is replaced with the
 * email of the logged-in account, so nobody can read or change another
 * customer's profile, bookings, notifications or settings.
 * Staff (admin, provider) keep the value they send.
 */
class ForceOwnEmail
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user && ! in_array($user->role, ['admin', 'provider'], true)) {
            foreach (['email', 'user_email'] as $key) {
                if ($request->query->has($key)) {
                    $request->query->set($key, $user->email);
                }
                $request->merge([$key => $user->email]);
            }
        }

        return $next($request);
    }
}
