<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** What the AI prepared for a letter: reply needed or not, the German reply, form values. */
class DocumentDraft extends Model
{
    protected $fillable = ['customer_document_id', 'user_id', 'language', 'payload', 'ai_input_tokens', 'ai_output_tokens'];

    protected $casts = ['payload' => 'array'];
}
