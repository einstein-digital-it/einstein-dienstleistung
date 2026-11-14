<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Reminders whose letter was deleted stayed behind (the foreign key only set
     * customer_document_id to NULL) and showed up in the customer's file. Every
     * reminder comes from a letter (no screen creates one by hand), so a reminder
     * without a letter is such a leftover.
     */
    public function up(): void
    {
        DB::table('customer_reminders')
            ->whereNull('customer_document_id')
            ->delete();
    }

    public function down(): void
    {
        // Deleted reminders cannot be restored
    }
};
