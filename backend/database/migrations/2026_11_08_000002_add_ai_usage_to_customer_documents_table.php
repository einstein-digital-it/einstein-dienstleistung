<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tokens Claude billed for reading this paper (see documents:ai-cost)
        Schema::table('customer_documents', function (Blueprint $table) {
            $table->unsignedInteger('ai_input_tokens')->nullable();
            $table->unsignedInteger('ai_output_tokens')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('customer_documents', function (Blueprint $table) {
            $table->dropColumn(['ai_input_tokens', 'ai_output_tokens']);
        });
    }
};
