<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientHistory extends Model
{
    use HasFactory;

    protected $fillable = ['managed_client_id', 'event_type', 'title', 'description', 'actor_name', 'metadata', 'occurred_at'];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'occurred_at' => 'datetime'];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(ManagedClient::class, 'managed_client_id');
    }
}
