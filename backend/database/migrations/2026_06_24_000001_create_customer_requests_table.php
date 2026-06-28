<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('service_name')->nullable();
            $table->string('category')->nullable();
            $table->date('date')->nullable();
            $table->string('time')->nullable();
            $table->string('address')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('status')->default('new')->index();
            $table->text('description')->nullable();
            $table->string('assigned_to')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_requests');
    }
};
