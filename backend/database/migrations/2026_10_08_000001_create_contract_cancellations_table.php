<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // "Verträge hier kündigen" (§ 312k BGB) — every submitted cancellation is stored as proof of receipt
        Schema::create('contract_cancellations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('cancellation_type')->default('ordinary'); // ordinary | extraordinary
            $table->string('termination_timing')->default('soonest'); // soonest | specific_date
            $table->date('termination_date')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('language', 5)->default('de');
            $table->string('status')->default('received'); // received | confirmed | processed
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index('email');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->boolean('agb_accepted')->default(false);
            $table->boolean('withdrawal_consent')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contract_cancellations');

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['agb_accepted', 'withdrawal_consent']);
        });
    }
};
