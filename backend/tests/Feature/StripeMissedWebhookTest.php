<?php

namespace Tests\Feature;

use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/** When Stripe's webhook does not arrive, the server asks Stripe itself once the customer is back. */
class StripeMissedWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.stripe.secret' => 'sk_test_x', 'app.url' => 'https://app.example.test']);
    }

    private function booking(string $email, array $extra = []): Booking
    {
        return Booking::create([
            'booking_number' => 'ES-'.uniqid(),
            'customer_name' => 'Kunde',
            'customer_email' => $email,
            'category' => 'forms',
            'service_name' => 'Formularhilfe',
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'price' => 40,
            ...$extra,
        ]);
    }

    public function test_the_abo_is_activated_without_a_webhook(): void
    {
        $user = $this->withApiUser('user', 'buyer@example.com');
        Http::fake([
            'api.stripe.com/v1/checkout/sessions' => Http::response(['id' => 'cs_abo', 'url' => 'https://checkout.stripe.test/cs_abo']),
            'api.stripe.com/v1/checkout/sessions/cs_abo' => Http::response([
                'id' => 'cs_abo', 'status' => 'complete', 'payment_status' => 'paid', 'subscription' => 'sub_9',
                'metadata' => ['kind' => 'file_abo', 'user_id' => (string) $user->id],
            ]),
        ]);

        $this->postJson('/api/customer/subscription/checkout')->assertOk();
        $this->assertFalse($user->refresh()->hasFileAbo());

        // The customer comes back from Stripe; no webhook was received
        $this->getJson('/api/customer/subscription')->assertOk()
            ->assertJsonPath('data.active', true)
            ->assertJsonPath('data.status', 'active');
        $this->assertSame('sub_9', $user->refresh()->file_abo_subscription_id);
    }

    public function test_an_unpaid_or_foreign_checkout_does_not_activate_the_abo(): void
    {
        $user = $this->withApiUser('user', 'buyer@example.com');
        Http::fake([
            'api.stripe.com/v1/checkout/sessions' => Http::response(['id' => 'cs_open', 'url' => 'https://checkout.stripe.test/cs_open']),
            // Still open, and it even claims to belong to someone else
            'api.stripe.com/v1/checkout/sessions/cs_open' => Http::sequence()
                ->push(['id' => 'cs_open', 'status' => 'open', 'payment_status' => 'unpaid', 'metadata' => ['kind' => 'file_abo', 'user_id' => (string) $user->id]])
                ->push(['id' => 'cs_open', 'status' => 'complete', 'payment_status' => 'paid', 'subscription' => 'sub_x', 'metadata' => ['kind' => 'file_abo', 'user_id' => '999999']]),
        ]);

        $this->postJson('/api/customer/subscription/checkout')->assertOk();
        $this->getJson('/api/customer/subscription')->assertOk()->assertJsonPath('data.active', false);

        $this->travel(20)->seconds();
        $this->getJson('/api/customer/subscription')->assertOk()->assertJsonPath('data.active', false);
        $this->assertNull($user->refresh()->file_abo_subscription_id);
    }

    public function test_a_booking_is_marked_paid_without_a_webhook(): void
    {
        $this->withApiUser('user', 'kunde@example.com');
        $booking = $this->booking('kunde@example.com', ['stripe_session_id' => 'cs_book']);
        Http::fake([
            'api.stripe.com/v1/checkout/sessions/cs_book' => Http::response([
                'id' => 'cs_book', 'status' => 'complete', 'payment_status' => 'paid',
                'metadata' => ['booking_id' => (string) $booking->id],
            ]),
        ]);

        $this->getJson("/api/payments/bookings/{$booking->id}")->assertOk()
            ->assertJsonPath('data.payment_status', 'paid');
        $this->assertNotNull($booking->refresh()->paid_at);
        $this->assertDatabaseHas('notifications', ['user_email' => 'kunde@example.com', 'type' => 'payment_received']);
    }

    public function test_an_open_checkout_leaves_the_booking_unpaid(): void
    {
        $this->withApiUser('user', 'kunde@example.com');
        $booking = $this->booking('kunde@example.com', ['stripe_session_id' => 'cs_wait']);
        Http::fake([
            'api.stripe.com/v1/checkout/sessions/cs_wait' => Http::response([
                'id' => 'cs_wait', 'status' => 'open', 'payment_status' => 'unpaid',
                'metadata' => ['booking_id' => (string) $booking->id],
            ]),
        ]);

        $this->getJson("/api/payments/bookings/{$booking->id}")->assertOk()
            ->assertJsonPath('data.payment_status', 'unpaid');
    }

    public function test_customers_cannot_open_another_customers_booking(): void
    {
        $booking = $this->booking('other@example.com');
        Http::fake();

        $this->withApiUser('user', 'kunde@example.com');
        $this->getJson("/api/payments/bookings/{$booking->id}")->assertForbidden();
        Http::assertNothingSent();
    }
}
