<?php

namespace Tests\Feature;

use App\Models\CustomerDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** "What do I do with this letter?": reply needed or not, German reply, form values. */
class DocumentDraftTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        config(['services.anthropic.key' => 'test-key']);
    }

    private function letter(string $email): CustomerDocument
    {
        Storage::disk('local')->put('customer-documents/brief.pdf', '%PDF-1.4 test');

        return CustomerDocument::create([
            'user_email' => $email, 'folder' => 'jobcenter', 'title' => 'Aufforderung zur Mitwirkung', 'original_name' => 'brief.pdf',
            'file_path' => 'customer-documents/brief.pdf', 'mime_type' => 'application/pdf', 'size' => 100,
            'uploaded_by' => 'customer', 'ai_status' => 'done', 'sender' => 'Jobcenter Frankfurt',
        ]);
    }

    private function fakeTool(array $input): void
    {
        Http::fake(['api.anthropic.com/v1/messages' => Http::response([
            'content' => [['type' => 'tool_use', 'id' => 'tu_1', 'name' => 'prepare_reply', 'input' => $input]],
            'usage' => ['input_tokens' => 1500, 'output_tokens' => 400],
        ])]);
    }

    private function subscriber(): void
    {
        $user = $this->withApiUser('user', 'kunde@example.com');
        $user->forceFill([
            'file_abo_status' => 'active', 'file_abo_plan' => 'basic', 'preferred_language' => 'ar',
            'form_data' => ['full_name' => 'Amina Musterfrau', 'jobcenter_email' => 'jobcenter-frankfurt@jobcenter-ge.de'],
        ])->save();
    }

    public function test_a_letter_that_needs_a_reply_gets_a_german_reply_ready_to_send(): void
    {
        $this->fakeTool([
            'reply_needed' => 'required',
            'reason' => 'الجوب سنتر يطلب كشوف الحساب.',
            'next_steps' => 'ابعت الرد مع الكشوف قبل 30.11.',
            'deadline' => '2026-11-30',
            'recipient_email' => 'jobcenter-frankfurt@jobcenter-ge.de',
            'subject' => 'Mitwirkung – Kontoauszüge',
            'letter' => "Amina Musterfrau\n\nSehr geehrte Damen und Herren,\nanbei die Kontoauszüge.\n\nMit freundlichen Grüßen\nAmina Musterfrau",
            'form_fields' => [['label' => 'Name', 'value' => 'Amina Musterfrau'], ['label' => '', 'value' => 'x']],
            'attachments' => ['كشوف الحساب لآخر 3 أشهر'],
            'missing' => [],
            'needs_signature' => true,
            'send_by' => 'email',
            'unexpected' => 'dropped',
        ]);
        $this->subscriber();
        $doc = $this->letter('kunde@example.com');

        $this->postJson("/api/customer/documents/{$doc->id}/draft")
            ->assertCreated()
            ->assertJsonPath('data.reply_needed', 'required')
            ->assertJsonPath('data.recipient_email', 'jobcenter-frankfurt@jobcenter-ge.de')
            ->assertJsonPath('data.deadline', '2026-11-30')
            ->assertJsonPath('data.needs_signature', true)
            ->assertJsonCount(1, 'data.form_fields')
            ->assertJsonMissingPath('data.unexpected')
            ->assertJsonPath('subscription.questions_used', 1);

        // The tool is forced and the saved authority e-mail goes along
        Http::assertSent(fn ($r) => $r['tool_choice']['name'] === 'prepare_reply'
            && str_contains($r['messages'][0]['content'][1]['text'], 'Jobcenter e-mail: jobcenter-frankfurt@jobcenter-ge.de')
            && str_contains($r['system'], 'Do not write objections'));

        // It is kept, so the customer can come back to sign and send it
        $this->getJson("/api/customer/documents/{$doc->id}/draft")->assertOk()->assertJsonPath('data.subject', 'Mitwirkung – Kontoauszüge');
    }

    public function test_a_letter_without_reply_says_so_and_a_guessed_email_is_dropped(): void
    {
        $this->fakeTool([
            'reply_needed' => 'none', 'reason' => 'مجرد معلومات.', 'next_steps' => 'ما في شي لازم تعمله.',
            'recipient_email' => 'not an email', 'needs_signature' => false, 'send_by' => 'none',
        ]);
        $this->subscriber();
        $doc = $this->letter('kunde@example.com');

        $this->postJson("/api/customer/documents/{$doc->id}/draft")
            ->assertCreated()
            ->assertJsonPath('data.reply_needed', 'none')
            ->assertJsonPath('data.letter', null)
            ->assertJsonPath('data.recipient_email', null);
    }

    public function test_only_the_owner_with_an_abo_and_a_failed_answer_is_given_back(): void
    {
        $this->withApiUser('user', 'ohne@example.com');
        $own = $this->letter('ohne@example.com');
        $this->postJson("/api/customer/documents/{$own->id}/draft")->assertStatus(402);

        $this->subscriber();
        $this->postJson("/api/customer/documents/{$own->id}/draft")->assertNotFound();
        $this->getJson("/api/customer/documents/{$own->id}/draft")->assertNotFound();

        Http::fake(['api.anthropic.com/v1/messages' => Http::response(['content' => [['type' => 'text', 'text' => 'no tool']]])]);
        $doc = $this->letter('kunde@example.com');
        $this->postJson("/api/customer/documents/{$doc->id}/draft")->assertStatus(502)->assertJsonPath('code', 'failed');
        $this->getJson('/api/customer/subscription')->assertJsonPath('data.questions_used', 0);
    }
}
