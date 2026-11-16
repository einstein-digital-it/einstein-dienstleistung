<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Unterlagen-Abo plan: basic | silver | unlimited (existing subscribers are "basic")
            $table->string('file_abo_plan', 20)->default('basic');
            // AI questions asked this calendar month
            $table->string('file_abo_questions_month', 7)->nullable();
            $table->unsignedInteger('file_abo_questions_used')->default(0);
        });

        // Questions a customer asked the AI about one of their letters, with the answer
        Schema::create('document_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_document_id')->constrained('customer_documents')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('question');
            $table->text('answer')->nullable();
            $table->string('status', 20)->default('answered'); // answered | failed
            $table->unsignedInteger('ai_input_tokens')->nullable();
            $table->unsignedInteger('ai_output_tokens')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_questions');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['file_abo_plan', 'file_abo_questions_month', 'file_abo_questions_used']);
        });
    }
};
