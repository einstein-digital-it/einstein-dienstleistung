<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A file the customer creates and names; its papers are sorted into numbered sections. */
class CustomerFile extends Model
{
    protected $fillable = ['user_email', 'name'];

    public function documents(): HasMany
    {
        return $this->hasMany(CustomerDocument::class);
    }
}
