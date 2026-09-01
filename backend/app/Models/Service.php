<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    public const STATUSES = ['active', 'draft', 'inactive'];

    protected $fillable = [
        'name',
        'name_de',
        'name_ar',
        'name_en',
        'category',
        'description',
        'description_de',
        'description_ar',
        'description_en',
        'price_from',
        'price_unit',
        'status',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price_from' => 'decimal:2',
            'sort_order' => 'integer',
        ];
    }
}
