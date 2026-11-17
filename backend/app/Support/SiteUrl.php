<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * The website runs on several addresses (APP_URL plus APP_EXTRA_URLS, e.g. .com and .de).
 * Links the customer follows right away (Stripe return pages) go back to the address
 * they came from; anything else falls back to APP_URL.
 */
class SiteUrl
{
    /** @return string[] allowed base URLs without trailing slash */
    public static function all(): array
    {
        $extra = array_filter(array_map('trim', explode(',', (string) config('app.extra_urls', ''))));

        return array_values(array_unique(array_map(
            fn ($u) => rtrim($u, '/'),
            array_merge([(string) config('app.url')], $extra)
        )));
    }

    public static function for(?Request $request): string
    {
        $default = rtrim((string) config('app.url'), '/');
        if (! $request) {
            return $default;
        }
        // The page the customer is on (Origin), else the address this request came to
        $origin = rtrim((string) $request->headers->get('Origin', ''), '/');
        $own = rtrim($request->getSchemeAndHttpHost(), '/');
        foreach ([$origin, $own] as $candidate) {
            if ($candidate !== '' && in_array($candidate, self::all(), true)) {
                return $candidate;
            }
        }

        return $default;
    }
}
