<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceExtension extends Model
{
    use HasFactory;

    public const STATUSES = ['pending', 'accepted', 'completed', 'cancelled'];
    public const PAYMENT_STATUSES = ['paid', 'unpaid', 'authorized', 'failed', 'refunded'];

    protected $fillable = [
        'booking_id',
        'booking_number',
        'customer_name',
        'customer_email',
        'provider_id',
        'provider_email',
        'service_name',
        'provider_name',
        'status',
        'payment_status',
        'amount',
        'description',
        'documents_urls',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'documents_urls' => 'array',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
