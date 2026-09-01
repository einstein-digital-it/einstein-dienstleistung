<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientInvoice extends Model
{
    use HasFactory;

    protected $fillable = ['managed_client_id', 'invoice_number', 'title', 'amount', 'currency', 'status', 'due_date', 'invoice_url', 'sent_at', 'paid_at'];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'due_date' => 'date:Y-m-d', 'sent_at' => 'datetime', 'paid_at' => 'datetime'];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(ManagedClient::class, 'managed_client_id');
    }
}
