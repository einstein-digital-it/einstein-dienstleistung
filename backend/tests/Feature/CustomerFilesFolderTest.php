<?php

namespace Tests\Feature;

use App\Jobs\ProcessCustomerDocument;
use App\Models\CustomerDocument;
use App\Models\CustomerFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** Files the customer creates; with the Abo the AI sorts papers into numbered sections. */
class CustomerFilesFolderTest extends TestCase
{
    use RefreshDatabase;

    private function createFile(string $name = 'Max Mustermann'): int
    {
        return $this->postJson('/api/customer/files', ['name' => $name])->assertCreated()->json('data.id');
    }

    private function upload(int $fileId, string $name = 'brief.pdf')
    {
        return $this->post("/api/customer/files/$fileId/documents", [
            'folder' => 'auto',
            'file' => UploadedFile::fake()->create($name, 40, 'application/pdf'),
        ], ['Accept' => 'application/json']);
    }

    private function fakeClaude(array $sections): void
    {
        $responses = Http::sequence();
        foreach ($sections as $section) {
            $responses->push(['content' => [['type' => 'text', 'text' => json_encode([
                'section' => $section, 'folder' => 'arbeit', 'title' => 'T', 'summary' => 'S', 'translation' => 'X', 'dates' => [],
            ])]]]);
        }
        Http::fake(['api.anthropic.com/*' => $responses]);
    }

    public function test_with_abo_papers_are_sorted_into_numbered_sections(): void
    {
        Storage::fake('local');
        Bus::fake([ProcessCustomerDocument::class]);
        config(['services.anthropic.key' => 'test-key']);
        $this->fakeClaude(['02_Arbeitsvertrag', 'Lohn unterlagen', 'arbeitsvertrag']);

        $this->withApiUser('user', 'boss@example.com')->forceFill(['file_abo_status' => 'active'])->save();
        $fileId = $this->createFile();
        $ids = [];
        foreach ([1, 2, 3] as $n) {
            $ids[] = $this->upload($fileId, "b$n.pdf")->assertCreated()->assertJsonPath('data.ai_status', 'pending')->json('data.id');
        }
        foreach ($ids as $id) {
            (new ProcessCustomerDocument($id, true))->handle();
        }

        $this->getJson("/api/customer/files/$fileId")->assertOk()
            ->assertJsonPath('data.sections.0.label', '01_Arbeitsvertrag')
            ->assertJsonPath('data.sections.1.label', '02_Lohn_unterlagen')
            ->assertJsonCount(2, 'data.sections')
            ->assertJsonCount(3, 'data.documents')
            ->assertJsonMissingPath('data.documents.0.file_path');
        $this->assertSame('Arbeitsvertrag', CustomerDocument::find($ids[2])->section);

        // Papers of a created file stay out of the authority folders
        $this->getJson('/api/customer/documents')->assertOk()->assertJsonCount(0, 'data.documents');
        $this->getJson('/api/customer/files')->assertOk()->assertJsonPath('data.0.documents_count', 3);
    }

    public function test_without_abo_papers_are_stored_unsorted(): void
    {
        Storage::fake('local');
        Bus::fake([ProcessCustomerDocument::class]);
        config(['services.anthropic.key' => 'test-key']);

        $this->withApiUser('user', 'free@example.com');
        $fileId = $this->createFile();
        $this->upload($fileId)->assertCreated()
            ->assertJsonPath('data.ai_status', 'none')
            ->assertJsonPath('needs_subscription', true);
        Bus::assertNotDispatched(ProcessCustomerDocument::class);
        $this->getJson("/api/customer/files/$fileId")->assertJsonCount(0, 'data.sections')->assertJsonCount(1, 'data.documents');
    }

    public function test_files_belong_to_their_owner_and_delete_removes_the_papers(): void
    {
        Storage::fake('local');
        config(['services.anthropic.key' => '']);

        $this->withApiUser('user', 'owner@example.com');
        $fileId = $this->createFile();
        $docId = $this->upload($fileId)->assertCreated()->json('data.id');
        $path = CustomerDocument::find($docId)->file_path;
        Storage::disk('local')->assertExists($path);

        $this->withApiUser('user', 'other@example.com');
        $this->getJson("/api/customer/files/$fileId")->assertNotFound();
        $this->upload($fileId)->assertNotFound();
        $this->deleteJson("/api/customer/files/$fileId")->assertNotFound();
        $this->getJson('/api/customer/files')->assertOk()->assertJsonCount(0, 'data');

        $this->withApiUser('user', 'owner2@example.com');
        CustomerFile::find($fileId)->update(['user_email' => 'owner2@example.com']);
        $this->deleteJson("/api/customer/files/$fileId")->assertNoContent();
        $this->assertNull(CustomerDocument::find($docId));
        Storage::disk('local')->assertMissing($path);
    }
}
