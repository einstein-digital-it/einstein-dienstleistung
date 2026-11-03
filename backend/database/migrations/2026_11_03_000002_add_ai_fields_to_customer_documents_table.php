<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Automatic sorting + translation of uploaded documents
        Schema::table('customer_documents', function (Blueprint $table) {
            $table->string('ai_status', 20)->default('none'); // none | pending | done | failed | skipped
            $table->string('translation_language', 5)->nullable();
            $table->string('sender')->nullable();
            $table->text('summary')->nullable();
            $table->longText('translation')->nullable();
            $table->date('deadline')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('customer_documents', function (Blueprint $table) {
            $table->dropColumn(['ai_status', 'translation_language', 'sender', 'summary', 'translation', 'deadline']);
        });
    }
};
