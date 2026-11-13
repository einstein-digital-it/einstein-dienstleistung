<?php

namespace Tests\Feature;

use App\Models\AboVoucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Voucher codes: the admin hands out a code, the customer gets sorting + translation for free. */
class AboVoucherTest extends TestCase
{
    use RefreshDatabase;

    private function voucher(array $extra = []): AboVoucher
    {
        return AboVoucher::create(['code' => 'FREUNDE-2026', 'months' => 3, 'max_uses' => 2, ...$extra]);
    }

    public function test_admin_creates_lists_stops_and_deletes_codes(): void
    {
        $this->withApiUser('admin');

        // Own code, typed in any case and with spaces
        $id = $this->postJson('/api/admin/abo-vouchers', ['code' => ' freunde-2026 ', 'months' => 3, 'max_uses' => 5, 'note' => 'Familie Ali'])
            ->assertCreated()
            ->assertJsonPath('data.code', 'FREUNDE-2026')
            ->assertJsonPath('data.usable', true)
            ->json('data.id');

        // Generated code when none is given; the same code twice is refused
        $generated = $this->postJson('/api/admin/abo-vouchers', ['months' => 1, 'max_uses' => 1])->assertCreated()->json('data.code');
        $this->assertMatchesRegularExpression('/^EIN-[A-Z0-9]{4}-[A-Z0-9]{4}$/', $generated);
        $this->postJson('/api/admin/abo-vouchers', ['code' => 'FREUNDE-2026', 'months' => 1, 'max_uses' => 1])->assertStatus(422);

        $this->getJson('/api/admin/abo-vouchers')->assertOk()->assertJsonCount(2, 'data');

        $this->patchJson("/api/admin/abo-vouchers/$id", ['active' => false])->assertOk()->assertJsonPath('data.usable', false);
        $this->deleteJson("/api/admin/abo-vouchers/$id")->assertNoContent();

        // Customers cannot manage codes
        $this->withApiUser('user', 'kunde@example.com');
        $this->getJson('/api/admin/abo-vouchers')->assertForbidden();
        $this->postJson('/api/admin/abo-vouchers', ['months' => 1, 'max_uses' => 1])->assertForbidden();
    }

    public function test_a_code_gives_the_abo_for_free_until_the_months_are_over(): void
    {
        $this->voucher();
        $user = $this->withApiUser('user', 'kunde@example.com');
        $this->getJson('/api/customer/subscription')->assertJsonPath('data.active', false);

        $this->postJson('/api/customer/subscription/redeem', ['code' => 'freunde-2026'])->assertOk()
            ->assertJsonPath('data.active', true)
            ->assertJsonPath('data.free', true);
        $this->assertTrue($user->refresh()->hasFileAbo());
        $this->assertSame(now()->addMonthsNoOverflow(3)->toDateString(), $user->file_abo_free_until->toDateString());

        // The same customer cannot use the same code twice
        $this->postJson('/api/customer/subscription/redeem', ['code' => 'FREUNDE-2026'])->assertStatus(409)->assertJsonPath('code', 'already_redeemed');
        $this->assertSame(1, AboVoucher::first()->used_count);

        // The admin sees who used it
        $this->withApiUser('admin');
        $this->getJson('/api/admin/abo-vouchers')->assertOk()
            ->assertJsonPath('data.0.used_count', 1)
            ->assertJsonPath('data.0.redemptions.0.email', 'kunde@example.com');

        // After the free months the Abo ends by itself
        $this->travel(4)->months();
        $this->assertFalse($user->refresh()->hasFileAbo());
    }

    public function test_codes_stop_working_when_used_up_expired_switched_off_or_wrong(): void
    {
        $this->voucher(['max_uses' => 1]);
        AboVoucher::create(['code' => 'ALT', 'months' => 1, 'max_uses' => 5, 'valid_until' => now()->subDay()->toDateString()]);
        AboVoucher::create(['code' => 'AUS', 'months' => 1, 'max_uses' => 5, 'active' => false]);

        $this->withApiUser('user', 'erste@example.com');
        $this->postJson('/api/customer/subscription/redeem', ['code' => 'FREUNDE-2026'])->assertOk();

        $second = $this->withApiUser('user', 'zweite@example.com');
        $this->postJson('/api/customer/subscription/redeem', ['code' => 'FREUNDE-2026'])->assertStatus(422)->assertJsonPath('code', 'code_used_up');
        $this->postJson('/api/customer/subscription/redeem', ['code' => 'ALT'])->assertStatus(422)->assertJsonPath('code', 'code_expired');
        $this->postJson('/api/customer/subscription/redeem', ['code' => 'AUS'])->assertStatus(422)->assertJsonPath('code', 'invalid_code');
        $this->postJson('/api/customer/subscription/redeem', ['code' => 'GIBTSNICHT'])->assertStatus(422)->assertJsonPath('code', 'invalid_code');
        $this->assertFalse($second->refresh()->hasFileAbo());
    }

    public function test_two_codes_add_up_and_a_paying_customer_does_not_need_one(): void
    {
        $this->voucher();
        AboVoucher::create(['code' => 'EXTRA', 'months' => 2, 'max_uses' => 1]);

        $user = $this->withApiUser('user', 'kunde@example.com');
        $this->postJson('/api/customer/subscription/redeem', ['code' => 'FREUNDE-2026'])->assertOk();
        $this->postJson('/api/customer/subscription/redeem', ['code' => 'EXTRA'])->assertOk();
        $this->assertSame(now()->addMonthsNoOverflow(5)->toDateString(), $user->refresh()->file_abo_free_until->toDateString());

        $payer = $this->withApiUser('user', 'zahler@example.com');
        $payer->forceFill(['file_abo_status' => 'active'])->save();
        AboVoucher::create(['code' => 'NOCH-EINER', 'months' => 1, 'max_uses' => 1]);
        $this->postJson('/api/customer/subscription/redeem', ['code' => 'NOCH-EINER'])->assertStatus(409)->assertJsonPath('code', 'already_subscribed');
        $this->assertSame(0, AboVoucher::where('code', 'NOCH-EINER')->value('used_count'));
    }
}
