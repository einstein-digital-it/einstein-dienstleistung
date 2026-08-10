<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ManagedClient extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_user_id', 'full_name', 'company_name', 'email', 'phone',
        'preferred_language', 'status', 'notes',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function communications(): HasMany
    {
        return $this->hasMany(ClientCommunication::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(ClientRequest::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(ClientFile::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(ClientInvoice::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(ClientHistory::class);
    }
}
