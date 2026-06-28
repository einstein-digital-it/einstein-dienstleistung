<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_email',
        'notification_sent',
        'sent_date',
    ];

    protected function casts(): array
    {
        return [
            'notification_sent' => 'boolean',
            'sent_date' => 'datetime',
        ];
    }
}
