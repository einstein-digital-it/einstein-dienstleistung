<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientFile extends Model
{
    use HasFactory;

    protected $fillable = ['managed_client_id', 'name', 'file_url', 'mime_type', 'size_bytes', 'uploaded_by'];

    public function client(): BelongsTo
    {
        return $this->belongsTo(ManagedClient::class, 'managed_client_id');
    }
}
