<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_key',
        'icon',
        'color',
        'light_color',
        'title_de',
        'title_ar',
        'title_en',
        'subtitle_de',
        'subtitle_ar',
        'subtitle_en',
        'description_de',
        'description_ar',
        'description_en',
        'suitable_de',
        'suitable_ar',
        'suitable_en',
        'features',
        'examples',
        'prices',
        'status',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'examples' => 'array',
            'prices' => 'array',
        ];
    }
}
