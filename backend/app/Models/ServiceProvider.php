<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceProvider extends Model
{
    use HasFactory;

    public const STATUSES = ['pending', 'approved', 'rejected', 'suspended'];

    protected $fillable = [
        'user_id',
        'full_name',
        'email',
        'phone',
        'address',
        'profile_image',
        'bio_de',
        'bio_ar',
        'bio_en',
        'experience_years',
        'service_area',
        'availability',
        'working_hours_start',
        'working_hours_end',
        'categories',
        'languages',
        'qualifications',
        'documents_urls',
        'hourly_rate',
        'city',
        'status',
        'notes',
        'login_enabled',
        'approved_at',
        'rejected_at',
        'welcome_email_requested_at',
    ];

    protected function casts(): array
    {
        return [
            'experience_years' => 'integer',
            'categories' => 'array',
            'languages' => 'array',
            'availability' => 'array',
            'documents_urls' => 'array',
            'hourly_rate' => 'decimal:2',
            'login_enabled' => 'boolean',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'welcome_email_requested_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
