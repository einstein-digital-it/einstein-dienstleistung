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
        'category',
        'date',
        'time',
        'address',
        'provider_name',
        'confirmed_by_provider_id',
        'confirmed_by_provider_name',
        'confirmed_by_provider_email',
        'confirmed_at',
        'status',
        'payment_status',
        'price',
        'invoice_url',
        'documents_urls',
        'provider_documents_urls',
        'description',
        'required_documents_hint',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'confirmed_at' => 'datetime',
            'price' => 'decimal:2',
            'documents_urls' => 'array',
            'provider_documents_urls' => 'array',
        ];
    }

    public function serviceExtensions(): HasMany
    {
        return $this->hasMany(ServiceExtension::class);
    }
}
