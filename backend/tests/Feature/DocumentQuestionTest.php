<?php

namespace Tests\Feature;

use App\Models\CustomerDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** AI questions about a letter, and the three Abo plans that set how many per month. */
class DocumentQuestionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        config(['services.anthropic.key' => 'test-key', 'services.stripe.secret' => 'sk_test_x', 'app.url' => 'https://app.example.test']);
    }

    private function letter(string $email): CustomerDocument
    {
        Storage::disk('local')->put('customer-documents/brief.pdf', '%PDF-1.4 test');

        return CustomerDocument::create([
            'user_email' => $email, 'folder' => 'jobcenter', 'title' => 'Bewilligungsbescheid', 'original_name' => 'brief.pdf',
            'file_path' => 'customer-documents/brief.pdf', 'mime_type' => 'application/pdf', 'size' => 100,
            'uploaded_by' => 'customer', 'ai_status' => 'done', 'summary' => 'Bürgergeld bis Februar bewilligt.', 'sender' => 'Jobcenter',
        ]);
    }

    private function fakeClaude(string $answer = 'Ihr Bürgergeld ist bis Ende Februar bewilligt.'): void
    {
        Http::fake(['api.anthropic.com/v1/messages' => Http::response([
            'content' => [['type' => 'text', 'text' => $answer]],
            'usage' => ['input_tokens' => 1200, 'output_tokens' => 80],
        ])]);
    }

    private function subscriber(string $plan = 'basic', string $email = 'kunde@example.com'): User
    {
        $user = $this->withApiUser('user', $email);
        $user->forceFill(['file_abo_status' => 'active', 'file_abo_plan' => $plan, 'preferred_language' => 'ar'])->save();

        return $user;
    }

    public function test_a_subscriber_asks_about_a_letter_and_gets_an_answer(): void
    {
        $this->fakeClaude('تمت الموافقة على إعانتك حتى نهاية فبراير.');
        $this->subscriber();
        $doc = $this->letter('kunde@example.com');

        $this->postJson("/api/customer/documents/{$doc->id}/questions", ['question' => 'متى تنتهي الإعانة؟'])
            ->assertCreated()
            ->assertJsonPath('data.0.answer', 'تمت الموافقة على إعانتك حتى نهاية فبراير.')
            ->assertJsonPath('subscription.questions_used', 1)
            ->assertJsonPath('subscription.questions_limit', 10);

        // The letter itself goes along, and the answer is asked for in the customer's language
        Http::assertSent(fn ($r) => str_ends_with($r->url(), '/v1/messages')
            && $r['messages'][0]['content'][0]['type'] === 'document'
            && str_contains($r['system'], 'Arabic')
            && str_contains($r['system'], 'legal'));

        $this->getJson("/api/customer/documents/{$doc->id}/questions")->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_replies_and_forms_are_filled_with_the_customers_own_details(): void
    {
        $this->fakeClaude("---BRIEF---\nSehr geehrte Damen und Herren,\n---ENDE---\nأرسلي هذه الرسالة بالبريد.");
        $user = $this->subscriber();
        $user->forceFill(['form_data' => ['full_name' => 'Amina Musterfrau', 'address_street' => 'Hauptstr. 1', 'bg_number' => '12345BG0001234']])->save();
        $doc = $this->letter('kunde@example.com');

        $this->postJson("/api/customer/documents/{$doc->id}/questions", ['question' => 'اكتبلي رد إني رح أبعت الأوراق'])
            ->assertCreated()
            ->assertJsonPath('data.0.answer', "---BRIEF---\nSehr geehrte Damen und Herren,\n---ENDE---\nأرسلي هذه الرسالة بالبريد.");

        Http::assertSent(function ($r) {
            $context = $r['messages'][0]['content'][1]['text'];

            return str_contains($context, 'Name: Amina Musterfrau')
                && str_contains($context, 'Jobcenter BG-Nr.: 12345BG0001234')
                && str_contains($r['system'], '---BRIEF---')
                && str_contains($r['system'], 'field by field')
                && str_contains($r['system'], 'do not write objections (Widerspruch)');
        });
    }

    public function test_the_plan_sets_the_monthly_questions(): void
    {
        $this->fakeClaude();
        config(['services.file_abo.plans.basic.questions' => 2]);
        $user = $this->subscriber();
        $doc = $this->letter('kunde@example.com');

        $this->postJson("/api/customer/documents/{$doc->id}/questions", ['question' => 'Frage 1'])->assertCreated();
        $this->postJson("/api/customer/documents/{$doc->id}/questions", ['question' => 'Frage 2'])->assertCreated();
        $this->postJson("/api/customer/documents/{$doc->id}/questions", ['question' => 'Frage 3'])
            ->assertStatus(429)->assertJsonPath('code', 'limit_reached');

        // Unlimited plan: no limit
        $user->forceFill(['file_abo_plan' => 'unlimited'])->save();
        $this->postJson("/api/customer/documents/{$doc->id}/questions", ['question' => 'Frage 3'])
            ->assertCreated()->assertJsonPath('subscription.questions_limit', null);

        // Next month starts at zero again
        // (the login token would expire if time travelled, so the counter is set to last month)
        $user->forceFill(['file_abo_plan' => 'basic', 'file_abo_questions_month' => now()->subMonth()->format('Y-m')])->save();
        $this->postJson("/api/customer/documents/{$doc->id}/questions", ['question' => 'Neue Frage'])
            ->assertCreated()->assertJsonPath('subscription.questions_used', 1);
    }

    public function test_no_questions_without_subscription_and_never_about_others_letters(): void
    {
        $this->fakeClaude();
        $this->withApiUser('user', 'ohne@example.com');
        $own = $this->letter('ohne@example.com');
        $this->postJson("/api/customer/documents/{$own->id}/questions", ['question' => 'Was steht hier?'])
            ->assertStatus(402)->assertJsonPath('code', 'needs_subscription');

        $other = $this->letter('fremd@example.com');
        $this->subscriber('unlimited', 'neugierig@example.com');
        $this->postJson("/api/customer/documents/{$other->id}/questions", ['question' => 'Was steht hier?'])->assertNotFound();
        $this->getJson("/api/customer/documents/{$other->id}/questions")->assertNotFound();
        Http::assertNothingSent();
    }

    public function test_a_failed_answer_gives_the_question_back(): void
    {
        Http::fake(['api.anthropic.com/v1/messages' => Http::response(['error' => ['message' => 'overloaded']], 529)]);
        $this->subscriber();
        $doc = $this->letter('kunde@example.com');

        $this->postJson("/api/customer/documents/{$doc->id}/questions", ['question' => 'Was steht hier?'])
            ->assertStatus(502)->assertJsonPath('code', 'failed');
        $this->getJson('/api/customer/subscription')->assertJsonPath('data.questions_used', 0);
    }

    public function test_checkout_uses_the_chosen_plan_and_a_plan_can_be_changed(): void
    {
        $user = $this->withApiUser('user', 'kunde@example.com');
        Http::fake([
            'api.stripe.com/v1/checkout/sessions' => Http::response(['id' => 'cs_1', 'url' => 'https://checkout.stripe.test/cs_1']),
            'api.stripe.com/v1/subscriptions/sub_1' => Http::response(['id' => 'sub_1', 'items' => ['data' => [['id' => 'si_1', 'price' => ['product' => 'prod_1']]]]]),
        ]);

        $this->getJson('/api/customer/subscription')->assertOk()
            ->assertJsonPath('data.plans.1.key', 'silver')
            ->assertJsonPath('data.plans.1.price', 11.99)
            ->assertJsonPath('data.plans.2.questions', null);

        $this->postJson('/api/customer/subscription/checkout', ['plan' => 'silver'])->assertOk();
        Http::assertSent(fn ($r) => str_ends_with($r->url(), 'checkout/sessions')
            && (int) $r['line_items'][0]['price_data']['unit_amount'] === 1199
            && $r['metadata']['plan'] === 'silver');

        // Stripe confirms: the plan is stored with the Abo
        $this->postJson('/api/customer/subscription/plan', ['plan' => 'unlimited'])->assertStatus(409);
        $user->forceFill(['file_abo_status' => 'active', 'file_abo_subscription_id' => 'sub_1', 'file_abo_plan' => 'silver'])->save();
        $this->getJson('/api/customer/subscription')->assertJsonPath('data.plan', 'silver')->assertJsonPath('data.questions_limit', 20)->assertJsonPath('data.price', 11.99);

        $this->postJson('/api/customer/subscription/plan', ['plan' => 'unlimited'])->assertOk()
            ->assertJsonPath('data.plan', 'unlimited')
            ->assertJsonPath('data.price', 17.99);
        Http::assertSent(fn ($r) => $r->method() === 'POST' && str_ends_with($r->url(), 'subscriptions/sub_1')
            && (int) $r['items'][0]['price_data']['unit_amount'] === 1799
            && $r['items'][0]['id'] === 'si_1');
    }
}
