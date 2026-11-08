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
        Http::fake(['api.anthropic.com/v1/messages/count_tokens' => Http::response(['input_tokens' => 1000]), 'api.anthropic.com/*' => Http::response(['usage' => ['input_tokens' => 10, 'output_tokens' => 5], 'content' => [['type' => 'text', 'text' => json_encode([
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
        Http::fake(['api.anthropic.com/v1/messages/count_tokens' => Http::response(['input_tokens' => 1000]), 'api.anthropic.com/*' => Http::response(['error' => ['message' => 'credit balance is too low']], 400)]);
        $this->doc('a@example.com', 'failed');
        $this->doc('a@example.com', 'none');

        $this->artisan('documents:reprocess', ['email' => 'a@example.com'])
            ->expectsConfirmation('Process 2 papers? This uses API credit.', 'yes')
            ->assertFailed();

        // One free count and one real call: the second paper is never tried
        Http::assertSentCount(2);
    }

    public function test_a_too_long_paper_is_refused_before_anything_is_billed(): void
    {
        Storage::fake('local');
        config(['services.anthropic.key' => 'test-key', 'services.anthropic.max_input_tokens' => 30000]);
        Http::fake(['api.anthropic.com/v1/messages/count_tokens' => Http::response(['input_tokens' => 140000])]);
        $doc = $this->doc('a@example.com', 'failed');

        $this->artisan('documents:reprocess', ['email' => 'a@example.com'])
            ->expectsConfirmation('Process 1 papers? This uses API credit.', 'yes')
            ->assertSuccessful();

        $this->assertSame('too_long', $doc->fresh()->ai_status);
        Http::assertSent(fn ($r) => str_ends_with($r->url(), 'count_tokens'));
        Http::assertNotSent(fn ($r) => str_ends_with($r->url(), '/v1/messages'));
    }

    public function test_a_billed_but_cut_off_answer_still_records_its_cost(): void
    {
        Storage::fake('local');
        config(['services.anthropic.key' => 'test-key']);
        Http::fake([
            'api.anthropic.com/v1/messages/count_tokens' => Http::response(['input_tokens' => 1000]),
            'api.anthropic.com/*' => Http::response(['usage' => ['input_tokens' => 900, 'output_tokens' => 8000], 'content' => [['type' => 'text', 'text' => 'cut off']]]),
        ]);
        $doc = $this->doc('a@example.com', 'none');

        $this->artisan('documents:reprocess', ['email' => 'a@example.com'])
            ->expectsConfirmation('Process 1 papers? This uses API credit.', 'yes')
            ->assertFailed();

        $this->assertSame('failed', $doc->fresh()->ai_status);
        $this->assertSame(8000, $doc->fresh()->ai_output_tokens);
    }
}
