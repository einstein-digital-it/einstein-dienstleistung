<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientRequest extends Model
{
    use HasFactory;

    protected $fillable = ['managed_client_id', 'request_number', 'subject', 'description', 'status', 'priority', 'assigned_to', 'due_at'];

    protected function casts(): array
    {
        return ['due_at' => 'datetime'];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(ManagedClient::class, 'managed_client_id');
    }
}
