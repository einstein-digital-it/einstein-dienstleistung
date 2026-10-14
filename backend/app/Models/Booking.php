<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasFactory;

    public const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    public const PAYMENT_STATUSES = ['paid', 'unpaid', 'authorized', 'failed', 'refunded'];

    protected $fillable = [
        'booking_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'service_name',
        'service_id',
        'category',
        'date',
        'time',
        'address',
        'provider_id',
        'provider_name',
        'confirmed_by_provider_id',
        'confirmed_by_provider_name',
        'confirmed_by_provider_email',
        'confirmed_at',
        'provider_declined_ids',
        'status',
        'payment_status',
        'price',
        'duration_hours',
        'invoice_url',
        'documents_urls',
        'provider_documents_urls',
        'description',
        'required_documents_hint',
        'agb_accepted',
        'withdrawal_consent',
        'stripe_session_id',
        'stripe_subscription_id',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'confirmed_at' => 'datetime',
            'provider_declined_ids' => 'array',
            'price' => 'decimal:2',
            'duration_hours' => 'integer',
            'documents_urls' => 'array',
            'provider_documents_urls' => 'array',
            'agb_accepted' => 'boolean',
            'withdrawal_consent' => 'boolean',
            'paid_at' => 'datetime',
        ];
    }

    public function serviceExtensions(): HasMany
    {
        return $this->hasMany(ServiceExtension::class);
    }
}
