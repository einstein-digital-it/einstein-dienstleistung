<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerDocument extends Model
{
    /** Folder keys shown to customers (labels are translated in the frontend). */
    public const FOLDERS = [
        'jobcenter', 'auslaenderbehoerde', 'finanzamt', 'familienkasse', 'krankenkasse',
        'rentenversicherung', 'wohnen', 'arbeit', 'schule', 'bank', 'versicherung', 'sonstiges',
    ];

    protected $fillable = [
        'user_email', 'folder', 'title', 'file_path', 'original_name',
        'mime_type', 'size', 'uploaded_by', 'note', 'customer_file_id', 'section', 'ai_input_tokens', 'ai_output_tokens',
        'ai_status', 'translation_language', 'sender', 'sender_email', 'summary', 'translation', 'deadline',
    ];

    protected function casts(): array
    {
        return ['deadline' => 'date:Y-m-d'];
    }

    /** The storage path is internal; files are only served through the download endpoint. */
    protected $hidden = ['file_path', 'ai_input_tokens', 'ai_output_tokens'];
}
