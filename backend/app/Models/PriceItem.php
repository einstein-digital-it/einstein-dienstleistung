<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'price_group_id',
        'label',
        'price',
        'unit',
        'label_de',
        'label_en',
        'label_tr',
        'label_ar',
        'unit_de',
        'unit_en',
        'unit_tr',
        'unit_ar',
        'status',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(PriceGroup::class, 'price_group_id');
    }
}
