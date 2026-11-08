<?php

namespace App\Console\Commands;

use App\Jobs\ProcessCustomerDocument;
use App\Models\CustomerDocument;
use Illuminate\Console\Command;

/** php artisan documents:reprocess someone@example.com — sort and translate papers that failed or were never processed. */
class DocumentsReprocess extends Command
{
    protected $signature = 'documents:reprocess {email : The customer whose papers to process} {--limit=50 : At most this many papers}';

    protected $description = 'Run the AI again on a customer\'s failed or unprocessed papers (costs API credit)';

    public function handle(): int
    {
        if (! ProcessCustomerDocument::enabled()) {
            $this->error('ANTHROPIC_API_KEY is not set.');

            return self::FAILURE;
        }

        $docs = CustomerDocument::query()
            ->whereRaw('LOWER(user_email) = ?', [strtolower((string) $this->argument('email'))])
            ->whereIn('ai_status', ['none', 'failed'])
            ->orderBy('id')->limit((int) $this->option('limit'))->get();

        if ($docs->isEmpty()) {
            $this->info('Nothing to process.');

            return self::SUCCESS;
        }
        if (! $this->confirm("Process {$docs->count()} papers? This uses API credit.")) {
            return self::SUCCESS;
        }

        foreach ($docs as $doc) {
            // Papers still in "sonstiges" were never really sorted, so the AI may choose their folder
            (new ProcessCustomerDocument($doc->id, $doc->folder === 'sonstiges'))->handle();
            $status = $doc->fresh()->ai_status;
            $this->line("#{$doc->id}: $status");
            if ($status === 'failed') {
                $this->error('Stopped at the first failure, so no more credit is used. See storage/logs/laravel.log.');

                return self::FAILURE;
            }
        }

        return self::SUCCESS;
    }
}
