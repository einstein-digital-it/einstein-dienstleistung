<?php

namespace Tests\Feature;

use App\Models\Offer;
use App\Models\Review;
use App\Models\SupportFaq;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PublicAuthSupportOfferReviewApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth_login_register_and_me_work(): void
    {
        User::create([
            'name' => 'Admin User',
            'full_name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'is_active' => true,
            'password' => Hash::make('secret123'),
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'secret123',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.email', 'admin@example.com')
            ->assertJsonPath('data.user.role', 'admin');

        $this->postJson('/api/auth/register', [
            'name' => 'Customer User',
            'email' => 'customer@example.com',
            'password' => 'secret123',
        ])
            ->assertCreated()
            ->assertJsonPath('data.user.role', 'user');

        $this->getJson('/api/auth/me?email=customer@example.com')
            ->assertOk()
            ->assertJsonPath('data.email', 'customer@example.com');

        $login = $this->postJson('/api/auth/login', [
            'email' => 'customer@example.com',
            'password' => 'secret123',
        ])
            ->assertOk();

        $token = $login->json('data.session.token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'customer@example.com');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout')
            ->assertNoContent();
    }

    public function test_customer_support_content_and_requests_work(): void
    {
        SupportFaq::create([
            'question_de' => 'Wie kann ich Sie erreichen?',
            'answer_de' => 'Per Telefon oder E-Mail.',
            'icon' => 'headphones',
            'status' => 'active',
        ]);

        $this->getJson('/api/customer-support')
            ->assertOk()
            ->assertJsonPath('data.faqs.0.question_de', 'Wie kann ich Sie erreichen?')
            ->assertJsonPath('data.contact.email', 'info@e-in-s-tein.de');

        $this->postJson('/api/customer-support/requests', [
            'request_type' => 'callback',
            'email' => 'customer@example.com',
            'phone' => '12345',
            'subject' => 'Please call me',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'new')
            ->assertJsonPath('data.request_type', 'callback');

        $this->assertDatabaseHas('customer_support_requests', [
            'email' => 'customer@example.com',
            'request_type' => 'callback',
        ]);
    }

    public function test_public_offers_reviews_and_ratings_work(): void
    {
        Offer::create([
            'package_key' => 'monthly',
            'title_de' => 'Monatsbetreuung',
            'title_en' => 'Monthly Care',
            'description_de' => 'Monatliche Hilfe',
            'features' => ['de' => ['Organisation']],
            'status' => 'active',
        ]);

        $this->getJson('/api/public/offers')
            ->assertOk()
            ->assertJsonPath('data.0.key', 'monthly')
            ->assertJsonPath('data.0.title_de', 'Monatsbetreuung');

        $this->postJson('/api/public/reviews', [
            'category' => 'forms',
            'reviewer_name' => 'Customer',
            'reviewer_email' => 'customer@example.com',
            'rating' => 5,
            'comment' => 'Great service',
        ])
            ->assertCreated()
            ->assertJsonPath('data.category', 'forms')
            ->assertJsonPath('data.rating', 5);

        $this->getJson('/api/public/reviews?category=forms')
            ->assertOk()
            ->assertJsonPath('data.0.comment', 'Great service');

        $this->getJson('/api/public/ratings')
            ->assertOk()
            ->assertJsonPath('data.0.category', 'forms')
            ->assertJsonPath('data.0.rating', 5);

        $this->assertDatabaseHas('reviews', [
            'category' => 'forms',
            'rating' => 5,
            'status' => 'approved',
        ]);
    }

    public function test_chat_service_extensions_and_provider_documents_work(): void
    {
        $this->withApiUser('admin');
        $this->postJson('/api/chat/respond', [
            'message' => 'How can I book?',
            'lang' => 'en',
        ])
            ->assertOk()
            ->assertJsonPath('data.source', 'laravel');

        $extension = $this->postJson('/api/service-extensions', [
            'customer_name' => 'Customer',
            'customer_email' => 'customer@example.com',
            'booking_number' => 'B-1',
            'service_name' => 'Forms',
            'provider_id' => '12',
            'provider_email' => 'provider@example.com',
            'provider_name' => 'Provider',
            'description' => 'Extra work',
            'amount' => 17.85,
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ])
            ->assertCreated()
            ->assertJsonPath('data.payment_status', 'unpaid');

        $extensionId = $extension->json('data.id');

        $this->getJson('/api/service-extensions?provider_email=provider@example.com')
            ->assertOk()
            ->assertJsonPath('data.0.provider_email', 'provider@example.com');

        $this->getJson('/api/service-extensions?provider_email=other@example.com')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->postJson("/api/service-extensions/{$extensionId}/authorize-payment")
            ->assertOk()
            ->assertJsonPath('data.extension.payment_status', 'authorized');

        $document = $this->postJson('/api/provider-documents', [
            'title' => 'Certificate',
            'document_type' => 'certificate',
            'file_url' => '/storage/uploads/certificate.pdf',
            'provider_email' => 'provider@example.com',
        ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Certificate');

        $this->getJson('/api/provider-documents?provider_email=provider@example.com')
            ->assertOk()
            ->assertJsonPath('data.0.file_url', '/storage/uploads/certificate.pdf');

        $this->deleteJson('/api/provider-documents/'.$document->json('data.id'))
            ->assertNoContent();
    }
}
