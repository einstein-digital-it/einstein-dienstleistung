<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientCommunication extends Model
{
    use HasFactory;

    protected $fillable = ['managed_client_id', 'channel', 'direction', 'summary', 'details', 'translated_summary', 'attachment_name', 'attachment_url', 'performed_by', 'occurred_at'];

    protected function casts(): array
    {
        return ['occurred_at' => 'datetime'];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(ManagedClient::class, 'managed_client_id');
    }
}
