<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeoSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'page_name',
        'meta_title_de',
        'meta_title_ar',
        'meta_title_en',
        'meta_description_de',
        'meta_description_ar',
        'meta_description_en',
        'keywords_de',
        'keywords_ar',
        'keywords_en',
        'og_image',
        'canonical_url',
        'no_index',
        'priority',
        'change_frequency',
    ];

    protected function casts(): array
    {
        return [
            'no_index' => 'boolean',
            'priority' => 'decimal:1',
        ];
    }
}
