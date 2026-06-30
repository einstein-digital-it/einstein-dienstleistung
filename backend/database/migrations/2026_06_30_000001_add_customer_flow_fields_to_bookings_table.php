<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('service_id')->nullable()->after('service_name');
            $table->string('provider_id')->nullable()->after('address');
            $table->unsignedInteger('duration_hours')->nullable()->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['service_id', 'provider_id', 'duration_hours']);
        });
    }
};
