<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_email',
        'type',
        'title_de',
        'title_ar',
        'title_en',
        'title_tr',
        'title_es',
        'message_de',
        'message_ar',
        'message_en',
        'message_tr',
        'message_es',
        'link',
        'booking_id',
        'is_read',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
        ];
    }
}
