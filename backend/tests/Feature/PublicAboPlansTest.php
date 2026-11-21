<?php

namespace Tests\Feature;

use Tests\TestCase;

/** Visitors of the app see the plans and prices before signing up. */
class PublicAboPlansTest extends TestCase
{
    public function test_the_plans_are_public(): void
    {
        $this->getJson('/api/public/abo-plans')
            ->assertOk()
            ->assertJsonPath('data.plans.0.key', 'basic')
            ->assertJsonPath('data.plans.1.price', 11.99)
            ->assertJsonPath('data.plans.2.questions', null)
            ->assertJsonPath('data.letters_per_month', 50);
    }
}
