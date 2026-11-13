<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A code that gives customers the Unterlagen-Abo (sorting + translation) for free for some months. */
class AboVoucher extends Model
{
    protected $fillable = ['code', 'months', 'max_uses', 'used_count', 'valid_until', 'active', 'note'];

    protected function casts(): array
    {
        return [
            'valid_until' => 'date',
            'active' => 'boolean',
            'months' => 'integer',
            'max_uses' => 'integer',
            'used_count' => 'integer',
        ];
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(AboVoucherRedemption::class);
    }

    /** Codes are compared without spaces and in capitals: "ein-2026 " = "EIN-2026". */
    public static function normalize(string $code): string
    {
        return strtoupper(preg_replace('/\s+/', '', $code));
    }

    public function isExpired(): bool
    {
        return $this->valid_until !== null && $this->valid_until->endOfDay()->isPast();
    }

    public function isUsedUp(): bool
    {
        return $this->used_count >= $this->max_uses;
    }
}
