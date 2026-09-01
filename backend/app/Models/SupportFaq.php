<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportFaq extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_de',
        'question_ar',
        'question_en',
        'answer_de',
        'answer_ar',
        'answer_en',
        'category',
        'icon',
        'status',
        'sort_order',
    ];
}
