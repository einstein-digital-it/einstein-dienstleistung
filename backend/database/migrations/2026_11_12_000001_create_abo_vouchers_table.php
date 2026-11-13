<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Codes the admin hands out: sorting + translation for free, without Stripe
        Schema::create('abo_vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->unsignedSmallInteger('months')->default(1); // free months per redemption
            $table->unsignedInteger('max_uses')->default(1);     // how many customers may use it
            $table->unsignedInteger('used_count')->default(0);
            $table->date('valid_until')->nullable();              // last day the code can be entered
            $table->boolean('active')->default(true);
            $table->string('note')->nullable();                   // for whom / why (admin only)
            $table->timestamps();
        });

        Schema::create('abo_voucher_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('abo_voucher_id')->constrained('abo_vouchers')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('free_until');
            $table->timestamps();
            $table->unique(['abo_voucher_id', 'user_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('file_abo_free_until')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('file_abo_free_until');
        });
        Schema::dropIfExists('abo_voucher_redemptions');
        Schema::dropIfExists('abo_vouchers');
    }
};
