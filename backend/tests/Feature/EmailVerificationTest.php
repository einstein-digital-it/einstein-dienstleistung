<?php

namespace Tests\Feature;

use App\Mail\VerificationCodeMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/** New customers confirm their email with a 6-digit code before they can sign in. */
class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    private function register(string $email = 'new@example.com', string $lang = 'ar'): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'New Customer',
            'email' => $email,
            'password' => 'secret123',
            'preferred_language' => $lang,
        ])->assertCreated()
            ->assertJsonPath('code', 'email_not_verified')
            ->assertJsonPath('data.verification_required', true)
            ->assertJsonMissingPath('data.session');
    }

    private function sentCode(string $email): string
    {
        $code = null;
        Mail::assertSent(VerificationCodeMail::class, function (VerificationCodeMail $mail) use ($email, &$code) {
            if (! $mail->hasTo($email)) {
                return false;
            }
            $code = $mail->code;

            return true;
        });

        return $code;
    }

    public function test_register_sends_a_code_and_the_code_signs_the_customer_in(): void
    {
        Mail::fake();
        $this->register();

        $code = $this->sentCode('new@example.com');
        $this->assertMatchesRegularExpression('/^\d{6}$/', $code);
        Mail::assertSent(VerificationCodeMail::class, fn ($mail) => $mail->lang === 'ar');

        // Only a hash is stored
        $this->assertNotSame($code, User::where('email', 'new@example.com')->value('email_verification_code'));

        // No sign-in before the email is confirmed
        $this->postJson('/api/auth/login', ['email' => 'new@example.com', 'password' => 'secret123'])
            ->assertStatus(403)
            ->assertJsonPath('code', 'email_not_verified');

        $token = $this->postJson('/api/auth/verify-email', ['email' => 'new@example.com', 'code' => $code])
            ->assertOk()
            ->assertJsonPath('data.user.email', 'new@example.com')
            ->json('data.session.token');
        $this->assertNotEmpty($token);
        $this->assertNotNull(User::where('email', 'new@example.com')->value('email_verified_at'));

        $this->postJson('/api/auth/login', ['email' => 'new@example.com', 'password' => 'secret123'])->assertOk();

        // A used code cannot sign anyone in again
        $this->postJson('/api/auth/verify-email', ['email' => 'new@example.com', 'code' => $code])
            ->assertStatus(409);
    }

    public function test_wrong_codes_are_limited_and_codes_expire(): void
    {
        Mail::fake();
        $this->register();
        $code = $this->sentCode('new@example.com');
        $wrong = $code === '000000' ? '111111' : '000000';

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/verify-email', ['email' => 'new@example.com', 'code' => $wrong])
                ->assertStatus(422)->assertJsonPath('code', 'invalid_code');
        }
        // Even the right code is refused after 5 wrong tries
        $this->postJson('/api/auth/verify-email', ['email' => 'new@example.com', 'code' => $code])
            ->assertStatus(429)->assertJsonPath('code', 'too_many');

        // A new code (after the 1-minute wait) works again, but not after 30 minutes
        $this->travel(2)->minutes();
        $this->postJson('/api/auth/verify-email/resend', ['email' => 'new@example.com'])->assertOk();
        Mail::assertSentCount(2);

        $this->travel(31)->minutes();
        $user = User::where('email', 'new@example.com')->first();
        $this->assertSame('expired', \App\Support\EmailVerification::check($user, '123456'));
    }

    public function test_the_email_shows_the_code_in_the_customer_language(): void
    {
        $html = (new VerificationCodeMail('123456', 'ar'))->render();
        $this->assertStringContainsString('123456', $html);
        $this->assertStringContainsString('dir="rtl"', $html);
        $this->assertStringContainsString('رمز', $html);

        // Unknown languages fall back to German
        $this->assertStringContainsString('Bestätigungscode', (new VerificationCodeMail('123456', 'xx'))->envelope()->subject);
    }

    public function test_resend_waits_a_minute_and_does_not_reveal_accounts(): void
    {
        Mail::fake();
        $this->register();

        $this->postJson('/api/auth/verify-email/resend', ['email' => 'new@example.com'])->assertOk();
        Mail::assertSentCount(1);

        $this->postJson('/api/auth/verify-email/resend', ['email' => 'nobody@example.com'])
            ->assertOk()->assertJsonPath('data.sent', true);
        Mail::assertSentCount(1);
    }

    public function test_existing_staff_and_verified_customers_sign_in_normally(): void
    {
        Mail::fake();
        foreach (['admin' => 'boss@example.com', 'user' => 'old@example.com'] as $role => $email) {
            User::create([
                'name' => 'X', 'full_name' => 'X', 'email' => $email, 'role' => $role,
                'is_active' => true, 'password' => Hash::make('secret123'),
            ])->forceFill(['email_verified_at' => $role === 'user' ? now() : null])->save();

            $this->postJson('/api/auth/login', ['email' => $email, 'password' => 'secret123'])->assertOk();
        }
        Mail::assertNothingSent();
    }

    public function test_verification_can_be_turned_off(): void
    {
        Mail::fake();
        config(['services.auth.verify_email' => false]);

        $this->postJson('/api/auth/register', [
            'name' => 'New Customer', 'email' => 'new@example.com', 'password' => 'secret123',
        ])->assertCreated()->assertJsonPath('data.user.email', 'new@example.com');

        $this->postJson('/api/auth/login', ['email' => 'new@example.com', 'password' => 'secret123'])->assertOk();
        Mail::assertNothingSent();
    }
}
