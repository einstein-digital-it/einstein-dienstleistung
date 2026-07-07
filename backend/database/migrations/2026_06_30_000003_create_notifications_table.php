<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('user_email')->index();
            $table->string('type')->default('general')->index();
            $table->string('title_de')->nullable();
            $table->string('title_ar')->nullable();
            $table->string('title_en')->nullable();
            $table->string('title_tr')->nullable();
            $table->string('title_es')->nullable();
            $table->text('message_de')->nullable();
            $table->text('message_ar')->nullable();
            $table->text('message_en')->nullable();
            $table->text('message_tr')->nullable();
            $table->text('message_es')->nullable();
            $table->string('link')->nullable();
            $table->string('booking_id')->nullable()->index();
            $table->boolean('is_read')->default(false)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
