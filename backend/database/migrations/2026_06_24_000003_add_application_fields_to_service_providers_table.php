<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_providers', function (Blueprint $table) {
            $table->string('address')->nullable()->after('phone');
            $table->json('availability')->nullable()->after('service_area');
            $table->string('working_hours_start')->nullable()->after('availability');
            $table->string('working_hours_end')->nullable()->after('working_hours_start');
            $table->string('notes')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('service_providers', function (Blueprint $table) {
            $table->dropColumn(['address', 'availability', 'working_hours_start', 'working_hours_end', 'notes']);
        });
    }
};
