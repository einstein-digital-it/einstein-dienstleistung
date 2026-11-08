<?php

namespace Tests\Feature;

use App\Jobs\ProcessCustomerDocument;
use App\Models\CustomerDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** "Meine Unterlagen" Abo: 6.99 € a month (incl. VAT), 50 papers for automatic sorting and translation. */
class FileAboTest extends TestCase
{
    use RefreshDatabase;

    public function test_without_abo_letters_are_stored_but_not_sorted_or_translated(): void
    {
        Storage::fake('local');
        Bus::fake([ProcessCustomerDocument::class]);
        config(['services.anthropic.key' => 'test-key']);

        $this->withApiUser('user', 'free@example.com');
        $this->getJson('/api/customer/subscription')->assertOk()
            ->assertJsonPath('data.active', false)
            ->assertJsonPath('data.price', 6.99)
            ->assertJsonPath('data.vat_included', true);

        $id = $this->post('/api/customer/documents', [
            'folder' => 'auto',
            'file' => UploadedFile::fake()->create('brief.pdf', 40, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertCreated()
            ->assertJsonPath('data.ai_status', 'none')
            ->assertJsonPath('needs_subscription', true)
            ->json('data.id');
        Bus::assertNotDispatched(ProcessCustomerDocument::class);

        $this->postJson("/api/customer/documents/$id/translate", ['lang' => 'de'])->assertStatus(402)
            ->assertJsonPath('needs_subscription', true);
        $this->assertSame('none', CustomerDocument::find($id)->ai_status);
    }

    public function test_checkout_starts_a_699_cent_monthly_stripe_subscription(): void
    {
        config(['services.stripe.secret' => 'sk_test_x', 'app.url' => 'https://app.example.test']);
        Http::fake(['api.stripe.com/*' => Http::response(['id' => 'cs_1', 'url' => 'https://checkout.stripe.test/cs_1'])]);

        $user = $this->withApiUser('user', 'buyer@example.com');
        $this->postJson('/api/customer/subscription/checkout')->assertOk()
            ->assertJsonPath('data.url', 'https://checkout.stripe.test/cs_1');

        Http::assertSent(function ($request) use ($user) {
            $body = $request->data();

            return str_ends_with($request->url(), 'checkout/sessions')
                && $body['mode'] === 'subscription'
                && (int) $body['line_items'][0]['price_data']['unit_amount'] === 699
                && $body['line_items'][0]['price_data']['recurring']['interval'] === 'month'
                && $body['metadata']['kind'] === 'file_abo'
                && $body['metadata']['user_id'] === (string) $user->id;
        });
    }

    public function test_webhook_activates_renews_and_ends_the_abo(): void
    {
        config(['services.stripe.webhook_secret' => 'whsec_test']);
        $user = $this->withApiUser('user', 'abo@example.com');

        $this->webhook('checkout.session.completed', [
            'metadata' => ['kind' => 'file_abo', 'user_id' => (string) $user->id],
            'subscription' => 'sub_9', 'payment_status' => 'paid',
        ]);
        $this->assertTrue($user->fresh()->hasFileAbo());
        $this->getJson('/api/customer/subscription')->assertJsonPath('data.active', true);

        $this->webhook('invoice.payment_failed', ['subscription' => 'sub_9']);
        $this->assertSame('past_due', $user->fresh()->file_abo_status);

        $this->webhook('invoice.paid', ['subscription' => 'sub_9']);
        $this->assertSame('active', $user->fresh()->file_abo_status);

        $this->webhook('customer.subscription.deleted', ['id' => 'sub_9']);
        $this->assertFalse($user->fresh()->hasFileAbo());
    }

    public function test_cancel_form_without_login_stops_the_abo_at_period_end(): void
    {
        config(['services.stripe.secret' => 'sk_test_x']);
        $end = now()->addDays(20)->startOfSecond();
        Http::fake(['api.stripe.com/*' => Http::response(['id' => 'sub_5', 'current_period_end' => $end->timestamp])]);
        $user = $this->withApiUser('user', 'leave@example.com');
        $user->forceFill(['file_abo_status' => 'active', 'file_abo_subscription_id' => 'sub_5'])->save();

        $this->postJson('/api/public/cancellations', [
            'name' => 'Leave', 'email' => 'LEAVE@example.com',
            'cancellation_type' => 'ordinary', 'termination_timing' => 'soonest',
        ])->assertCreated();

        Http::assertSent(fn ($r) => str_ends_with($r->url(), 'subscriptions/sub_5') && $r->data()['cancel_at_period_end'] === 'true');
        $user->refresh();
        $this->assertSame($end->timestamp, $user->file_abo_ends_at->timestamp);
        $this->assertTrue($user->hasFileAbo()); // still active until the paid month ends
    }

    public function test_the_monthly_allowance_stops_processing_and_resets_next_month(): void
    {
        Storage::fake('local');
        Bus::fake([ProcessCustomerDocument::class]);
        config(['services.anthropic.key' => 'test-key', 'services.file_abo.monthly_limit' => 2]);
        $user = $this->withApiUser('user', 'limit@example.com');
        $user->forceFill(['file_abo_status' => 'active'])->save();
        $upload = fn () => $this->post('/api/customer/documents', [
            'folder' => 'auto',
            'file' => UploadedFile::fake()->create('brief.pdf', 40, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertCreated();

        $upload()->assertJsonPath('data.ai_status', 'pending');
        $id = $upload()->assertJsonPath('data.ai_status', 'pending')->json('data.id');
        $upload()->assertJsonPath('data.ai_status', 'none');
        $this->getJson('/api/customer/subscription')->assertJsonPath('data.used', 2)->assertJsonPath('data.limit', 2);
        $this->postJson("/api/customer/documents/$id/translate", ['lang' => 'de'])->assertStatus(429);

        // Last month's count does not carry over
        $user->forceFill(['file_abo_month' => now()->subMonth()->format('Y-m')])->save();
        $this->getJson('/api/customer/subscription')->assertJsonPath('data.used', 0);
        $upload()->assertJsonPath('data.ai_status', 'pending');
    }

    public function test_a_paper_that_could_not_be_sorted_gives_its_place_back(): void
    {
        Storage::fake('local');
        Bus::fake([ProcessCustomerDocument::class]);
        config(['services.anthropic.key' => 'test-key']);
        Http::fake(['api.anthropic.com/v1/messages/count_tokens' => Http::response(['input_tokens' => 999999])]);
        $this->withApiUser('user', 'long@example.com')->forceFill(['file_abo_status' => 'active'])->save();

        $id = $this->post('/api/customer/documents', [
            'folder' => 'auto',
            'file' => UploadedFile::fake()->create('book.pdf', 40, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertCreated()->json('data.id');
        $this->getJson('/api/customer/subscription')->assertJsonPath('data.used', 1);

        (new ProcessCustomerDocument($id, true))->handle();

        $this->assertSame('too_long', CustomerDocument::find($id)->ai_status);
        $this->getJson('/api/customer/subscription')->assertJsonPath('data.used', 0);
    }

    public function test_staff_always_have_processing(): void
    {
        $this->assertTrue((new User(['role' => 'admin']))->hasFileAbo());
        $this->assertFalse((new User(['role' => 'user']))->hasFileAbo());
    }

    private function webhook(string $type, array $object): void
    {
        $payload = json_encode(['type' => $type, 'data' => ['object' => $object]]);
        $t = time();
        $sig = hash_hmac('sha256', $t.'.'.$payload, 'whsec_test');

        $this->call('POST', '/api/stripe/webhook', [], [], [], [
            'HTTP_STRIPE_SIGNATURE' => "t=$t,v1=$sig",
            'CONTENT_TYPE' => 'application/json',
        ], $payload)->assertOk();
    }
}
