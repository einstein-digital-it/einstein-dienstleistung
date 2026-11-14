<?php

namespace Tests\Feature;

use App\Models\CustomerDocument;
use App\Models\CustomerReminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** A reminder must not outlive the letter it came from. */
class ReminderCleanupTest extends TestCase
{
    use RefreshDatabase;

    public function test_deleting_a_letter_removes_its_reminders(): void
    {
        Storage::fake('local');
        $this->withApiUser('user', 'alwan@example.com');
        $id = $this->post('/api/customer/documents', [
            'folder' => 'jobcenter',
            'file' => UploadedFile::fake()->create('bescheid.pdf', 20, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertCreated()->json('data.id');

        CustomerReminder::create([
            'user_email' => 'alwan@example.com', 'customer_document_id' => $id, 'folder' => 'jobcenter',
            'kind' => 'expiry', 'title' => 'Weiterbewilligung beantragen',
            'due_date' => now()->addDays(16)->toDateString(), 'remind_on' => now()->toDateString(),
        ]);
        $this->getJson('/api/customer/reminders')->assertOk()->assertJsonCount(1, 'data');

        $this->deleteJson("/api/customer/documents/$id")->assertNoContent();

        $this->assertSame(0, CustomerReminder::count());
        $this->getJson('/api/customer/reminders')->assertOk()->assertJsonCount(0, 'data');
        $this->assertSame(0, CustomerDocument::count());
    }
}
