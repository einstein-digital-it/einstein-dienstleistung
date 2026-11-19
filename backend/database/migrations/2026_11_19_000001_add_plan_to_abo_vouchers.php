<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Each voucher code is for one plan (basic / silver / unlimited); customers keep that plan while free. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('abo_vouchers', function (Blueprint $table) {
            $table->string('plan', 20)->default('basic')->after('code');
        });
        Schema::table('users', function (Blueprint $table) {
            $table->string('file_abo_free_plan', 20)->nullable()->after('file_abo_free_until');
        });
    }

    public function down(): void
    {
        Schema::table('abo_vouchers', fn (Blueprint $table) => $table->dropColumn('plan'));
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('file_abo_free_plan'));
    }
};
