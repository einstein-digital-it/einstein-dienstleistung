<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AboVoucherRedemption extends Model
{
    protected $fillable = ['abo_voucher_id', 'user_id', 'free_until'];

    protected function casts(): array
    {
        return ['free_until' => 'datetime'];
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(AboVoucher::class, 'abo_voucher_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
