<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Sign-up stores when the customer accepted the AGB and the privacy policy. */
class TermsConsentTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_time_of_consent_is_saved(): void
    {
        config(['services.auth.verify_email' => false]);
        $this->postJson('/api/auth/register', [
            'name' => 'Amina', 'email' => 'amina@example.com', 'password' => 'geheim123', 'accept_terms' => true,
        ])->assertCreated();

        $this->assertNotNull(User::where('email', 'amina@example.com')->value('terms_accepted_at'));
    }

    public function test_a_refused_consent_is_rejected(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Amina', 'email' => 'amina@example.com', 'password' => 'geheim123', 'accept_terms' => false,
        ])->assertStatus(422)->assertJsonValidationErrors('accept_terms');
    }

    public function test_no_account_without_consent(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Amina', 'email' => 'amina@example.com', 'password' => 'geheim123',
        ])->assertStatus(422)->assertJsonValidationErrors('accept_terms');
        $this->assertDatabaseMissing('users', ['email' => 'amina@example.com']);
    }
}
