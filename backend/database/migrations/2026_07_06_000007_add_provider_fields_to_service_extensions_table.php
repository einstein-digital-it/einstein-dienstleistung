<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_extensions', function (Blueprint $table) {
            $table->string('provider_id')->nullable()->after('customer_email');
            $table->string('provider_email')->nullable()->index()->after('provider_id');
        });
    }

    public function down(): void
    {
        Schema::table('service_extensions', function (Blueprint $table) {
            $table->dropColumn(['provider_id', 'provider_email']);
        });
    }
};
