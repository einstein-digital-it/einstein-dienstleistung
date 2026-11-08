<?php

namespace Tests\Feature;

use App\Models\CustomerDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentsReprocessTest extends TestCase
{
    use RefreshDatabase;

    private function doc(string $email, string $status): CustomerDocument
    {
        Storage::disk('local')->put("d/$email-$status.pdf", '%PDF');

        return CustomerDocument::create([
            'user_email' => $email, 'folder' => 'sonstiges', 'title' => 'scan', 'file_path' => "d/$email-$status.pdf",
            'original_name' => 'scan.pdf', 'mime_type' => 'application/pdf', 'size' => 4, 'uploaded_by' => 'customer',
            'ai_status' => $status, 'translation_language' => 'ar',
        ]);
    }

    public function test_it_processes_only_this_customers_unfinished_papers(): void
    {
        Storage::fake('local');
        config(['services.anthropic.key' => 'test-key']);
        Http::fake(['api.anthropic.com/*' => Http::response(['usage' => ['input_tokens' => 10, 'output_tokens' => 5], 'content' => [['type' => 'text', 'text' => json_encode([
            'folder' => 'jobcenter', 'title' => 'Bescheid', 'summary' => 'S', 'translation' => 'T', 'dates' => [],
        ])]]])]);
        $failed = $this->doc('a@example.com', 'failed');
        $none = $this->doc('a@example.com', 'none');
        $done = $this->doc('a@example.com', 'done');
        $other = $this->doc('b@example.com', 'failed');

        $this->artisan('documents:reprocess', ['email' => 'A@example.com'])
            ->expectsConfirmation('Process 2 papers? This uses API credit.', 'yes')
            ->assertSuccessful();

        $this->assertSame('done', $failed->fresh()->ai_status);
        $this->assertSame('jobcenter', $none->fresh()->folder);
        $this->assertSame('sonstiges', $done->fresh()->folder);
        $this->assertSame('failed', $other->fresh()->ai_status);
    }

    public function test_it_stops_at_the_first_failure_so_no_more_credit_is_used(): void
    {
        Storage::fake('local');
        config(['services.anthropic.key' => 'test-key']);
        Http::fake(['api.anthropic.com/*' => Http::response(['error' => ['message' => 'credit balance is too low']], 400)]);
        $this->doc('a@example.com', 'failed');
        $this->doc('a@example.com', 'none');

        $this->artisan('documents:reprocess', ['email' => 'a@example.com'])
            ->expectsConfirmation('Process 2 papers? This uses API credit.', 'yes')
            ->assertFailed();

        Http::assertSentCount(1);
    }
}
