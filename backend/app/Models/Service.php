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
        'name_tr',
        'name_es',
        'name_uk',
        'category',
        'description',
        'description_de',
        'description_ar',
        'description_en',
        'description_tr',
        'description_es',
        'description_uk',
        'features',
        'price_from',
        'price_unit',
        'status',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price_from' => 'decimal:2',
            'features' => 'array',
            'sort_order' => 'integer',
        ];
    }
}
