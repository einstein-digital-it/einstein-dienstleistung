<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_drafts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_document_id')->constrained('customer_documents')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('language', 5)->nullable();
            $table->json('payload');
            $table->unsignedInteger('ai_input_tokens')->nullable();
            $table->unsignedInteger('ai_output_tokens')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_drafts');
    }
};
