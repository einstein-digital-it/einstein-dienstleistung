<?php

namespace Tests\Feature;

use App\Models\CustomerDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** Auto-fill of PDF forms: fields read, AI picks values, filled PDF and signature place come back. */
class DocumentAutofillTest extends TestCase
{
    use RefreshDatabase;

    private array $fields = [
        'fields' => [
            ['name' => 'Vorname', 'type' => 'text', 'page' => 0, 'rect' => ['x' => 200, 'y' => 740, 'w' => 300, 'h' => 20]],
            ['name' => 'Geburtsdatum', 'type' => 'text', 'page' => 0, 'rect' => ['x' => 200, 'y' => 680, 'w' => 300, 'h' => 20]],
            ['name' => 'Telefon', 'type' => 'text', 'page' => 0, 'rect' => ['x' => 200, 'y' => 650, 'w' => 300, 'h' => 20]],
        ],
        'signature' => ['page' => 0, 'x' => 200, 'y' => 110, 'w' => 220, 'h' => 40],
        'pages' => [['w' => 595, 'h' => 842]],
    ];

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        config(['services.anthropic.key' => 'test-key']);
    }

    private function form(string $email, string $name = 'antrag.pdf'): CustomerDocument
    {
        if (! Storage::disk('local')->exists('customer-documents/'.$name)) {
            Storage::disk('local')->put('customer-documents/'.$name, '%PDF-1.4 form');
        }

        return CustomerDocument::create([
            'user_email' => $email, 'folder' => 'jobcenter', 'title' => 'Weiterbewilligungsantrag', 'original_name' => $name,
            'file_path' => 'customer-documents/'.$name, 'mime_type' => 'application/pdf', 'size' => 100, 'uploaded_by' => 'customer', 'ai_status' => 'done',
        ]);
    }

    private function subscriber(): void
    {
        $user = $this->withApiUser('user', 'kunde@example.com');
        $user->forceFill(['file_abo_status' => 'active', 'form_data' => ['full_name' => 'Amina Haddad', 'birth_date' => '1990-02-01']])->save();
    }

    public function test_a_form_is_filled_like_autofill_and_the_signature_place_comes_back(): void
    {
        Process::fake([
            '*pdf-form.mjs fields*' => Process::result(json_encode($this->fields)),
            '*pdf-form.mjs fill*' => function ($process) {
                // the script writes the filled PDF to the last argument
                file_put_contents(end($process->command), '%PDF-1.4 filled');

                return Process::result('{"filled":2}');
            },
        ]);
        Http::fake(['api.anthropic.com/v1/messages' => Http::response([
            'content' => [['type' => 'tool_use', 'id' => 't1', 'name' => 'fill_form', 'input' => ['values' => [
                'Vorname' => 'Amina', 'Geburtsdatum' => '01.02.1990', 'Erfunden' => 'x',
            ]]]],
            'usage' => ['input_tokens' => 1000, 'output_tokens' => 100],
        ])]);
        $this->subscriber();
        $doc = $this->form('kunde@example.com');

        $res = $this->postJson("/api/customer/documents/{$doc->id}/autofill")
            ->assertOk()
            ->assertJsonPath('data.fillable', true)
            ->assertJsonPath('data.filled', 2)
            ->assertJsonPath('data.signature.y', 110)
            ->assertJsonPath('data.missing', ['Telefon'])
            ->assertJsonPath('subscription.questions_used', 1);
        $this->assertSame('%PDF-1.4 filled', base64_decode($res->json('data.pdf')));

        // Only real fields are passed to the script
        Process::assertRan(fn ($p) => str_contains(implode(' ', (array) $p->command), 'fill'));
        Http::assertSent(function ($r) {
            $content = $r->data()['messages'][0]['content'];

            return $r['tool_choice']['name'] === 'fill_form' && str_contains($content[count($content) - 1]['text'], 'Geburtsdatum');
        });
    }

    public function test_a_scan_without_fields_gives_only_the_signature_place_and_costs_nothing(): void
    {
        Process::fake(['*pdf-form.mjs fields*' => Process::result(json_encode(['fields' => [], 'signature' => null, 'pages' => [['w' => 595, 'h' => 842]]]))]);
        Http::fake();
        $this->subscriber();
        $doc = $this->form('kunde@example.com');

        $this->postJson("/api/customer/documents/{$doc->id}/autofill")
            ->assertOk()->assertJsonPath('data.fillable', false);
        Http::assertNothingSent();
        $this->getJson('/api/customer/subscription')->assertJsonPath('data.questions_used', 0);
    }

    public function test_only_own_pdfs_with_an_abo(): void
    {
        Process::fake();
        $this->withApiUser('user', 'ohne@example.com');
        $doc = $this->form('ohne@example.com');
        $this->postJson("/api/customer/documents/{$doc->id}/autofill")->assertStatus(402);

        $this->subscriber();
        $this->postJson("/api/customer/documents/{$doc->id}/autofill")->assertNotFound();

        Storage::disk('local')->put('customer-documents/foto.jpg', 'jpg');
        $photo = CustomerDocument::create([
            'user_email' => 'kunde@example.com', 'folder' => 'jobcenter', 'title' => 'Foto', 'original_name' => 'foto.jpg',
            'file_path' => 'customer-documents/foto.jpg', 'mime_type' => 'image/jpeg', 'size' => 3, 'uploaded_by' => 'customer', 'ai_status' => 'done',
        ]);
        $this->postJson("/api/customer/documents/{$photo->id}/autofill")->assertStatus(422)->assertJsonPath('code', 'not_pdf');
        Process::assertNothingRan();
    }

    /** The real script with pdf-lib (skipped where Node or the website packages are missing). */
    public function test_the_real_script_fills_a_real_form(): void
    {
        $lib = base_path('../front_end/node_modules/pdf-lib');
        if (! is_dir($lib) || ! Process::run(['node', '--version'])->successful()) {
            $this->markTestSkipped('Node or pdf-lib not installed');
        }
        // A small form made with pdf-lib itself: Vorname, Nachname and a signature box
        $make = <<<'JS'
        import fs from "node:fs";
        import { PDFDocument } from "pdf-lib";
        const pdf = await PDFDocument.create(); const page = pdf.addPage([595, 842]); const form = pdf.getForm();
        for (const [n, y] of [["Vorname", 740], ["Nachname", 710], ["Unterschrift", 110]]) form.createTextField(n).addToPage(page, { x: 200, y, width: 200, height: 20 });
        fs.writeFileSync(process.argv[2], await pdf.save());
        JS;
        $script = base_path('../front_end/scripts/make-form.test.mjs');
        file_put_contents($script, $make);
        Storage::disk('local')->put('customer-documents/echt.pdf', '');
        Process::run(['node', $script, Storage::disk('local')->path('customer-documents/echt.pdf')])->throw();
        @unlink($script);

        Http::fake(['api.anthropic.com/v1/messages' => Http::response([
            'content' => [['type' => 'tool_use', 'id' => 't1', 'name' => 'fill_form', 'input' => ['values' => ['Vorname' => 'Amina', 'Nachname' => 'Haddad']]]],
        ])]);
        $this->subscriber();
        $doc = $this->form('kunde@example.com', 'echt.pdf');

        $res = $this->postJson("/api/customer/documents/{$doc->id}/autofill")->assertOk()
            ->assertJsonPath('data.filled', 2)
            ->assertJsonPath('data.signature.y', fn ($y) => abs($y - 110) < 2);
        // The signature box is not offered to the AI as a field
        Http::assertSent(fn ($r) => ! str_contains(json_encode($r->data()), '"name":"Unterschrift"'));
        $this->assertStringStartsWith('%PDF', base64_decode($res->json('data.pdf')));
    }
}
