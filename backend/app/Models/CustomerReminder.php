<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerReminder extends Model
{
    protected $fillable = [
        'user_email', 'customer_document_id', 'folder', 'kind', 'title', 'details',
        'due_date', 'remind_on', 'status', 'notified_at', 'due_notified_at',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date:Y-m-d',
            'remind_on' => 'date:Y-m-d',
            'notified_at' => 'datetime',
            'due_notified_at' => 'datetime',
        ];
    }
}
