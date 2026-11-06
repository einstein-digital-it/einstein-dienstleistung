<?php

namespace Tests\Feature;

use App\Jobs\ProcessCustomerDocument;
use App\Models\CustomerDocument;
use App\Models\CustomerReminder;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CustomerFilesApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_uploads_and_only_owner_or_staff_can_open_it(): void
    {
        Storage::fake('local');
        config(['services.anthropic.key' => '']);

        $this->withApiUser('user', 'owner@example.com');
        $id = $this->post('/api/customer/documents', [
            'folder' => 'jobcenter',
            'title' => 'Bescheid',
            'file' => UploadedFile::fake()->create('bescheid.pdf', 50, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertCreated()->json('data.id');

        $this->getJson('/api/customer/documents')->assertOk()
            ->assertJsonPath('data.documents.0.title', 'Bescheid')
            ->assertJsonMissingPath('data.documents.0.file_path');
        $this->get("/api/customer/documents/$id/download")->assertOk();

        $this->withApiUser('user', 'stranger@example.com');
        $this->get("/api/customer/documents/$id/download")->assertNotFound();
        $this->getJson('/api/admin/customer-documents?email=owner@example.com')->assertForbidden();

        $this->withApiUser('provider', 'helper@example.com');
        $this->get("/api/customer/documents/$id/download")->assertOk();
        $this->getJson('/api/admin/customer-documents?email=owner@example.com')->assertOk()
            ->assertJsonPath('data.documents.0.id', $id);
    }

    public function test_customer_cannot_read_another_customers_profile_by_email(): void
    {
        $this->withApiUser('user', 'victim@example.com');
        $this->withApiUser('user', 'curious@example.com');

        $this->getJson('/api/profile?email=victim@example.com')->assertOk()
            ->assertJsonPath('data.email', 'curious@example.com');
        $this->getJson('/api/customer/bookings?email=victim@example.com')->assertOk();
        $this->patchJson('/api/profile', ['email' => 'victim@example.com', 'phone' => '123'])->assertOk()
            ->assertJsonPath('data.email', 'curious@example.com');
        $this->assertNull(User::where('email', 'victim@example.com')->value('phone'));
    }

    public function test_letter_is_sorted_translated_and_creates_reminders(): void
    {
        Storage::fake('local');
        config(['services.anthropic.key' => 'test-key']);
        $due = now()->addDays(60)->toDateString();
        Http::fake([
            'api.anthropic.com/*' => Http::response(['content' => [['type' => 'text', 'text' => json_encode([
                'folder' => 'auslaenderbehoerde',
                'title' => 'إقامة – تنتهي قريباً',
                'sender' => 'Ausländerbehörde Frankfurt',
                'sender_email' => 'abh@example.org',
                'summary' => 'إقامتك تنتهي.',
                'translation' => 'نص مترجم',
                'deadline' => $due,
                'dates' => [['date' => $due, 'kind' => 'expiry', 'title' => 'قدّم طلب تمديد الإقامة', 'details' => 'قبل الموعد', 'remind_days_before' => 56]],
            ])]]]),
        ]);

        $this->withApiUser('user', 'amina@example.com');
        $id = $this->post('/api/customer/documents', [
            'folder' => 'auto',
            'lang' => 'ar',
            'file' => UploadedFile::fake()->create('brief.pdf', 40, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertCreated()->json('data.id');

        (new ProcessCustomerDocument($id, true))->handle();

        $doc = CustomerDocument::find($id);
        $this->assertSame('auslaenderbehoerde', $doc->folder);
        $this->assertSame('done', $doc->ai_status);
        $this->assertSame('abh@example.org', $doc->sender_email);
        $reminder = CustomerReminder::where('customer_document_id', $id)->first();
        $this->assertNotNull($reminder);
        $this->assertSame(now()->addDays(4)->toDateString(), $reminder->remind_on->toDateString());

        $this->getJson('/api/customer/reminders')->assertOk()->assertJsonPath('data.0.kind', 'expiry');

        // The daily command notifies once the reminder date is reached
        $this->travel(5)->days();
        $this->artisan('reminders:send')->assertSuccessful();
        $this->assertTrue(Notification::where('user_email', 'amina@example.com')->where('type', 'reminder')->exists());

        $this->patchJson("/api/customer/reminders/{$reminder->id}", ['status' => 'done'])->assertOk()
            ->assertJsonPath('data.status', 'done');

        // Forms suggest the authority's e-mail from the letter
        $this->getJson('/api/customer/forms')->assertOk()
            ->assertJsonPath('data.suggestions.abh_email', 'abh@example.org');
    }

    public function test_forms_save_personal_data(): void
    {
        $this->withApiUser('user', 'forms@example.com');
        $this->putJson('/api/customer/form-data', ['data' => ['birth_date' => '1990-01-01', 'bg_number' => '123A456', 'evil' => 'x']])
            ->assertOk()->assertJsonPath('data.bg_number', '123A456')->assertJsonMissingPath('data.evil');
        $this->getJson('/api/customer/forms')->assertOk()
            ->assertJsonPath('data.data.birth_date', '1990-01-01')
            ->assertJsonCount(5, 'data.forms');
    }
}
