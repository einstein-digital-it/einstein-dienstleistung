<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_email',
        'booking_confirmed',
        'booking_changed',
        'booking_cancelled',
        'appointment_reminder',
        'provider_documents_uploaded',
        'payment_due_reminder',
        'payment_received',
        'review_request',
        'email_notifications',
        'in_app_notifications',
        'notification_language',
        'reminder_timing',
    ];

    protected function casts(): array
    {
        return [
            'booking_confirmed' => 'boolean',
            'booking_changed' => 'boolean',
            'booking_cancelled' => 'boolean',
            'appointment_reminder' => 'boolean',
            'provider_documents_uploaded' => 'boolean',
            'payment_due_reminder' => 'boolean',
            'payment_received' => 'boolean',
            'review_request' => 'boolean',
            'email_notifications' => 'boolean',
            'in_app_notifications' => 'boolean',
            'reminder_timing' => 'array',
        ];
    }
}
