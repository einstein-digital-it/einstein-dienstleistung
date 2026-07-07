<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    public const STATUSES = ['pending', 'approved', 'rejected'];

    protected $fillable = [
        'booking_id',
        'service_provider_id',
        'category',
        'reviewer_name',
        'reviewer_email',
        'rating',
        'comment',
        'status',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function serviceProvider(): BelongsTo
    {
        return $this->belongsTo(ServiceProvider::class);
    }
}
