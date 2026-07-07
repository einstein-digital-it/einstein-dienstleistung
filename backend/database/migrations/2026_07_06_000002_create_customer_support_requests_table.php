<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_support_requests', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('phone')->nullable();
            $table->string('request_type')->default('general')->index();
            $table->string('subject')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('new')->index();
            $table->string('priority')->default('normal');
            $table->string('source')->default('customer_service');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_support_requests');
    }
};
