<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_providers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('profile_image')->nullable();
            $table->text('bio_de')->nullable();
            $table->text('bio_ar')->nullable();
            $table->text('bio_en')->nullable();
            $table->unsignedInteger('experience_years')->default(0);
            $table->string('service_area')->nullable();
            $table->json('categories')->nullable();
            $table->json('languages')->nullable();
            $table->text('qualifications')->nullable();
            $table->json('documents_urls')->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->string('city')->nullable();
            $table->string('status')->default('pending')->index();
            $table->boolean('login_enabled')->default(false);
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('welcome_email_requested_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_providers');
    }
};
