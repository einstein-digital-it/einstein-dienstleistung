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
        'email_verification_code',
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
            'terms_accepted_at' => 'datetime',
            'email_verification_expires_at' => 'datetime',
            'email_verification_sent_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
            'form_data' => 'array',
            'file_abo_ends_at' => 'datetime',
            'file_abo_free_until' => 'datetime',
        ];
    }

    /** Automatic sorting + translation in "Meine Unterlagen" (staff always have it). */
    public function hasFileAbo(): bool
    {
        if (in_array($this->role, ['admin', 'provider'], true)) {
            return true;
        }

        return in_array($this->file_abo_status, ['active', 'past_due'], true) || $this->hasFreeFileAbo();
    }

    /** AI questions per month for this customer's plan; null = unlimited (staff always). */
    public function fileAboQuestionLimit(): ?int
    {
        if (in_array($this->role, ['admin', 'provider'], true)) {
            return null;
        }
        return \App\Support\FileAboPlans::get($this->currentFileAboPlan())['questions'];
    }

    /** The plan in force: the paid one, else the plan of the voucher code, else basic. */
    public function currentFileAboPlan(): string
    {
        if (in_array($this->file_abo_status, ['active', 'past_due'], true)) {
            return \App\Support\FileAboPlans::exists($this->file_abo_plan) ? $this->file_abo_plan : \App\Support\FileAboPlans::DEFAULT;
        }
        if ($this->hasFreeFileAbo() && \App\Support\FileAboPlans::exists($this->file_abo_free_plan)) {
            return $this->file_abo_free_plan;
        }

        return \App\Support\FileAboPlans::DEFAULT;
    }

    /** AI questions asked this calendar month. */
    public function fileAboQuestionsUsed(): int
    {
        return $this->file_abo_questions_month === now()->format('Y-m') ? (int) $this->file_abo_questions_used : 0;
    }

    /** Takes one question from this month's allowance; false when it is used up. */
    public function consumeFileAboQuestion(): bool
    {
        $month = now()->format('Y-m');
        static::query()->whereKey($this->id)
            ->where(fn ($q) => $q->whereNull('file_abo_questions_month')->orWhere('file_abo_questions_month', '!=', $month))
            ->update(['file_abo_questions_month' => $month, 'file_abo_questions_used' => 0]);

        $limit = $this->fileAboQuestionLimit();
        $query = static::query()->whereKey($this->id);
        if ($limit !== null) {
            // One conditional update, so parallel questions cannot pass the limit together
            $query->where('file_abo_questions_used', '<', $limit);
        }
        $taken = $query->increment('file_abo_questions_used') > 0;
        $this->refresh();

        return $taken;
    }

    /** Gives a question back (e.g. when the AI could not answer). */
    public function returnFileAboQuestion(): void
    {
        static::query()->whereKey($this->id)->where('file_abo_questions_used', '>', 0)->decrement('file_abo_questions_used');
    }

    /** Free months from a voucher code (AboVoucher) that have not run out yet. */
    public function hasFreeFileAbo(): bool
    {
        return $this->file_abo_free_until !== null && $this->file_abo_free_until->isFuture();
    }
}
