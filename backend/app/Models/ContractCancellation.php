<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContractCancellation extends Model
{
    protected $fillable = [
        'name',
        'email',
        'cancellation_type',
        'termination_timing',
        'termination_date',
        'reference_number',
        'language',
        'status',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'termination_date' => 'date:Y-m-d',
        ];
    }
}
