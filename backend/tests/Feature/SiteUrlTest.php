<?php

namespace Tests\Feature;

use App\Support\SiteUrl;
use Illuminate\Http\Request;
use Tests\TestCase;

/** The website runs on .com and .de; Stripe sends the customer back to the address they came from. */
class SiteUrlTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['app.url' => 'https://app.einsteindienstleistung.com', 'app.extra_urls' => 'https://app.einsteindienstleistung.de/']);
    }

    public function test_the_customers_own_address_is_used_when_it_is_one_of_ours(): void
    {
        $de = Request::create('https://app.einsteindienstleistung.de/api/customer/subscription/checkout', 'POST');
        $this->assertSame('https://app.einsteindienstleistung.de', SiteUrl::for($de));

        $fromDePage = Request::create('https://app.einsteindienstleistung.com/api/x', 'POST', server: ['HTTP_ORIGIN' => 'https://app.einsteindienstleistung.de']);
        $this->assertSame('https://app.einsteindienstleistung.de', SiteUrl::for($fromDePage));
    }

    public function test_a_foreign_address_falls_back_to_app_url(): void
    {
        $evil = Request::create('https://evil.example/api/x', 'POST', server: ['HTTP_ORIGIN' => 'https://evil.example']);
        $this->assertSame('https://app.einsteindienstleistung.com', SiteUrl::for($evil));
        $this->assertSame('https://app.einsteindienstleistung.com', SiteUrl::for(null));
    }
}
