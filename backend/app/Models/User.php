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
