<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('stripe_session_id')->nullable()->index();
            $table->string('stripe_subscription_id')->nullable()->index();
            $table->timestamp('paid_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['stripe_session_id', 'stripe_subscription_id', 'paid_at']);
        });
    }
};
