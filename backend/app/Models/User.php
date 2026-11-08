<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'full_name',
        'email',
        'phone',
        'address',
        'role',
        'preferred_language',
        'avatar_url',
        'is_active',
        'password',
        'form_data',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'form_data',
    ];

    public static function fileAboLimit(): int
    {
        return (int) config('services.file_abo.monthly_limit', 50);
    }

    /** Papers already sorted this calendar month. */
    public function fileAboUsed(): int
    {
        return $this->file_abo_month === now()->format('Y-m') ? (int) $this->file_abo_used : 0;
    }

    /** Takes one paper from this month's allowance; false when it is used up. Staff are not counted. */
    public function consumeFileAboQuota(): bool
    {
        if (in_array($this->role, ['admin', 'provider'], true)) {
            return true;
        }

        $month = now()->format('Y-m');
        static::query()->whereKey($this->id)
            ->where(fn ($q) => $q->whereNull('file_abo_month')->orWhere('file_abo_month', '!=', $month))
            ->update(['file_abo_month' => $month, 'file_abo_used' => 0]);

        // One conditional update, so parallel uploads cannot pass the limit together
        $taken = static::query()->whereKey($this->id)->where('file_abo_used', '<', self::fileAboLimit())->increment('file_abo_used') > 0;
        $this->refresh();

        return $taken;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
            'form_data' => 'array',
            'file_abo_ends_at' => 'datetime',
        ];
    }

    /** Automatic sorting + translation in "Meine Unterlagen" (staff always have it). */
    public function hasFileAbo(): bool
    {
        if (in_array($this->role, ['admin', 'provider'], true)) {
            return true;
        }

        return in_array($this->file_abo_status, ['active', 'past_due'], true);
    }
}
