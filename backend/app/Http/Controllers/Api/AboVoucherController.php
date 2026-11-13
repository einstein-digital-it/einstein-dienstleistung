<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AboVoucher;
use App\Models\AboVoucherRedemption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Voucher codes for the Unterlagen-Abo: the admin creates a code, the customer enters it in
 * "Meine Unterlagen" and gets sorting + translation for free for the given months (no Stripe).
 */
class AboVoucherController extends Controller
{
    // ------------------------------------------------------------ customer

    /** POST customer/subscription/redeem { code } */
    public function redeem(Request $request): JsonResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:60']]);
        $user = $request->user();
        $voucher = AboVoucher::where('code', AboVoucher::normalize($data['code']))->first();

        if (! $voucher || ! $voucher->active) {
            return $this->refuse('invalid_code', 'This code is not valid.', 422);
        }
        if ($voucher->isExpired()) {
            return $this->refuse('code_expired', 'This code has expired.', 422);
        }
        if (in_array($user->file_abo_status, ['active', 'past_due'], true)) {
            return $this->refuse('already_subscribed', 'You already have a paid subscription.', 409);
        }
        if (AboVoucherRedemption::where('abo_voucher_id', $voucher->id)->where('user_id', $user->id)->exists()) {
            return $this->refuse('already_redeemed', 'You have already used this code.', 409);
        }

        $freeUntil = DB::transaction(function () use ($voucher, $user) {
            // One conditional update, so two people cannot take the last use together
            $taken = AboVoucher::whereKey($voucher->id)->whereColumn('used_count', '<', 'max_uses')->increment('used_count');
            if (! $taken) {
                return null;
            }
            $start = $user->file_abo_free_until && $user->file_abo_free_until->isFuture() ? $user->file_abo_free_until->copy() : now();
            $until = $start->addMonthsNoOverflow($voucher->months);
            AboVoucherRedemption::create(['abo_voucher_id' => $voucher->id, 'user_id' => $user->id, 'free_until' => $until]);
            $user->forceFill(['file_abo_free_until' => $until])->save();

            return $until;
        });

        if (! $freeUntil) {
            return $this->refuse('code_used_up', 'This code has already been used.', 422);
        }

        return response()->json(['data' => CustomerSubscriptionController::stateFor($user->refresh())]);
    }

    private function refuse(string $code, string $message, int $status): JsonResponse
    {
        return response()->json(['message' => $message, 'code' => $code], $status);
    }

    // ------------------------------------------------------------ admin

    /** GET admin/abo-vouchers */
    public function index(): JsonResponse
    {
        $vouchers = AboVoucher::with(['redemptions.user:id,email,full_name,name'])->latest('id')->get();

        return response()->json(['data' => $vouchers->map(fn (AboVoucher $v) => $this->serialize($v))->values()]);
    }

    /** POST admin/abo-vouchers { code?, months, max_uses, valid_until?, note? } — an empty code is generated. */
    public function store(Request $request): JsonResponse
    {
        if ($request->filled('code')) {
            $request->merge(['code' => AboVoucher::normalize((string) $request->input('code'))]);
        }
        $data = $request->validate([
            'code' => ['sometimes', 'nullable', 'string', 'min:4', 'max:40', 'regex:/^[A-Z0-9-]+$/', Rule::unique('abo_vouchers', 'code')],
            'months' => ['required', 'integer', 'min:1', 'max:120'],
            'max_uses' => ['required', 'integer', 'min:1', 'max:100000'],
            'valid_until' => ['sometimes', 'nullable', 'date', 'after_or_equal:today'],
            'note' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);
        $data['code'] = ! empty($data['code']) ? $data['code'] : $this->newCode();

        return response()->json(['data' => $this->serialize(AboVoucher::create($data)->refresh()->load('redemptions.user'))], 201);
    }

    /** PATCH admin/abo-vouchers/{voucher} { active?, max_uses?, valid_until?, note? } */
    public function update(Request $request, AboVoucher $voucher): JsonResponse
    {
        $data = $request->validate([
            'active' => ['sometimes', 'boolean'],
            'max_uses' => ['sometimes', 'integer', 'min:1', 'max:100000'],
            'valid_until' => ['sometimes', 'nullable', 'date'],
            'note' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);
        $voucher->update($data);

        return response()->json(['data' => $this->serialize($voucher->load('redemptions.user'))]);
    }

    /** DELETE admin/abo-vouchers/{voucher} — customers who already used it keep their free months. */
    public function destroy(AboVoucher $voucher): JsonResponse
    {
        $voucher->delete();

        return response()->json(null, 204);
    }

    /** Like EIN-K7QM-3XHD. Easy to read aloud: no 0/O and no 1/I. */
    private function newCode(): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $block = function () use ($alphabet): string {
            $out = '';
            for ($i = 0; $i < 4; $i++) {
                $out .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            }

            return $out;
        };
        do {
            $code = 'EIN-'.$block().'-'.$block();
        } while (AboVoucher::where('code', $code)->exists());

        return $code;
    }

    private function serialize(AboVoucher $voucher): array
    {
        return [
            'id' => $voucher->id,
            'code' => $voucher->code,
            'months' => $voucher->months,
            'max_uses' => $voucher->max_uses,
            'used_count' => $voucher->used_count,
            'valid_until' => $voucher->valid_until?->toDateString(),
            'active' => $voucher->active,
            'usable' => $voucher->active && ! $voucher->isExpired() && ! $voucher->isUsedUp(),
            'note' => $voucher->note,
            'created_at' => $voucher->created_at?->toIso8601String(),
            'redemptions' => $voucher->redemptions->map(fn (AboVoucherRedemption $r) => [
                'email' => $r->user?->email,
                'name' => $r->user?->full_name ?: $r->user?->name,
                'redeemed_at' => $r->created_at?->toIso8601String(),
                'free_until' => $r->free_until?->toIso8601String(),
            ])->values(),
        ];
    }
}
