<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One question a customer asked the AI about one of their letters, and the answer. */
class DocumentQuestion extends Model
{
    protected $fillable = ['customer_document_id', 'user_id', 'question', 'answer', 'status', 'ai_input_tokens', 'ai_output_tokens'];

    public function document(): BelongsTo
    {
        return $this->belongsTo(CustomerDocument::class, 'customer_document_id');
    }
}
