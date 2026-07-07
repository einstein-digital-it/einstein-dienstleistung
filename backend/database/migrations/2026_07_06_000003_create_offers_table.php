<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->string('package_key')->unique();
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            $table->string('light_color')->nullable();
            $table->string('title_de');
            $table->string('title_ar')->nullable();
            $table->string('title_en')->nullable();
            $table->string('subtitle_de')->nullable();
            $table->string('subtitle_ar')->nullable();
            $table->string('subtitle_en')->nullable();
            $table->text('description_de')->nullable();
            $table->text('description_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->text('suitable_de')->nullable();
            $table->text('suitable_ar')->nullable();
            $table->text('suitable_en')->nullable();
            $table->json('features')->nullable();
            $table->json('examples')->nullable();
            $table->json('prices')->nullable();
            $table->string('status')->default('active')->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
