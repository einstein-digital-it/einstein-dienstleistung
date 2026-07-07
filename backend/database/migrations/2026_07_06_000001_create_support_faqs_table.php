<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question_de');
            $table->string('question_ar')->nullable();
            $table->string('question_en')->nullable();
            $table->text('answer_de')->nullable();
            $table->text('answer_ar')->nullable();
            $table->text('answer_en')->nullable();
            $table->string('category')->nullable();
            $table->string('icon')->nullable();
            $table->string('status')->default('active')->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_faqs');
    }
};
