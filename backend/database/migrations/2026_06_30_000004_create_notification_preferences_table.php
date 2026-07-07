<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->string('user_email')->unique();
            $table->boolean('booking_confirmed')->default(true);
            $table->boolean('booking_changed')->default(true);
            $table->boolean('booking_cancelled')->default(true);
            $table->boolean('appointment_reminder')->default(true);
            $table->boolean('provider_documents_uploaded')->default(true);
            $table->boolean('payment_due_reminder')->default(true);
            $table->boolean('payment_received')->default(true);
            $table->boolean('review_request')->default(true);
            $table->boolean('email_notifications')->default(true);
            $table->boolean('in_app_notifications')->default(true);
            $table->string('notification_language', 10)->default('de');
            $table->json('reminder_timing')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
