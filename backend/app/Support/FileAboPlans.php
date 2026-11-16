<?php

namespace App\Support;

/**
 * The three Unterlagen-Abo plans. All include sorting + translation (50 letters a month);
 * they differ in how many questions the customer may ask the AI about their letters
 * per calendar month. Prices are gross (VAT included). Values can be changed in .env.
 */
class FileAboPlans
{
    public const DEFAULT = 'basic';

    /** @return array<string, array{price_cents: int, questions: int|null}> questions null = unlimited */
    public static function all(): array
    {
        $plans = (array) config('services.file_abo.plans', []);

        return [
            'basic' => ['price_cents' => (int) ($plans['basic']['price_cents'] ?? 699), 'questions' => (int) ($plans['basic']['questions'] ?? 10)],
            'silver' => ['price_cents' => (int) ($plans['silver']['price_cents'] ?? 999), 'questions' => (int) ($plans['silver']['questions'] ?? 20)],
            'unlimited' => ['price_cents' => (int) ($plans['unlimited']['price_cents'] ?? 1799), 'questions' => null],
        ];
    }

    public static function exists(?string $plan): bool
    {
        return $plan !== null && array_key_exists($plan, self::all());
    }

    public static function get(?string $plan): array
    {
        return self::all()[self::exists($plan) ? $plan : self::DEFAULT];
    }

    /** For the API: [{ key, price, questions }] */
    public static function forApi(): array
    {
        return collect(self::all())->map(fn ($p, $key) => [
            'key' => $key,
            'price' => round($p['price_cents'] / 100, 2),
            'questions' => $p['questions'],
        ])->values()->all();
    }
}
