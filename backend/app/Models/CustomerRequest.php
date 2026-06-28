<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerRequest extends Model
{
    use HasFactory;

    public const STATUSES = ['new', 'reviewing', 'accepted', 'rejected'];

    protected $fillable = [
        'request_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'service_name',
        'category',
        'date',
        'time',
        'address',
        'price',
        'status',
        'description',
        'assigned_to',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'price' => 'decimal:2',
        ];
    }
}
