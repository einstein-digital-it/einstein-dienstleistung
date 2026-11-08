<?php

namespace App\Console\Commands;

use App\Models\CustomerDocument;
use Illuminate\Console\Command;

/** php artisan documents:ai-cost — what Claude really cost for the latest papers. */
class DocumentsAiCost extends Command
{
    protected $signature = 'documents:ai-cost {--limit=20 : How many of the latest papers}';

    protected $description = 'Show the real Claude cost per processed paper';

    /** USD per million tokens: [input, output]. Keep in step with Anthropic's price list. */
    private const PRICES = [
        'claude-sonnet-5-5' => [2.0, 10.0],
        'claude-haiku-5-5' => [0.10, 0.50],
        'claude-opus-5-5' => [4.0, 20.0],
    ];

    public function handle(): int
    {
        $model = (string) config('services.anthropic.model');
        $price = self::PRICES[$model] ?? null;
        if (! $price) {
            $this->error("No price known for model $model.");

            return self::FAILURE;
        }

        $docs = CustomerDocument::query()->whereNotNull('ai_input_tokens')
            ->latest('id')->limit((int) $this->option('limit'))->get();
        if ($docs->isEmpty()) {
            $this->warn('No paper has been processed with usage tracking yet.');

            return self::SUCCESS;
        }

        $cost = fn (CustomerDocument $d) => ($d->ai_input_tokens * $price[0] + $d->ai_output_tokens * $price[1]) / 1_000_000;

        $this->table(['ID', 'Size KB', 'Input tokens', 'Output tokens', 'Cost USD'], $docs->map(fn (CustomerDocument $d) => [
            $d->id,
            (int) round($d->size / 1024),
            $d->ai_input_tokens,
            $d->ai_output_tokens,
            number_format($cost($d), 4),
        ]));

        $this->info("Model: $model");
        $this->info('Average per paper: $'.number_format($docs->avg($cost), 4));
        $this->info('Most expensive: $'.number_format($docs->max($cost), 4));

        return self::SUCCESS;
    }
}
