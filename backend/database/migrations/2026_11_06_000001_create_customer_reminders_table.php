<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Reminders found in uploaded letters (e.g. "residence permit ends on ...")
        Schema::create('customer_reminders', function (Blueprint $table) {
            $table->id();
            $table->string('user_email');
            $table->foreignId('customer_document_id')->nullable()->constrained('customer_documents')->nullOnDelete();
            $table->string('folder', 40)->default('sonstiges');
            $table->string('kind', 20)->default('deadline'); // deadline | expiry | appointment
            $table->string('title');
            $table->text('details')->nullable();
            $table->date('due_date');
            $table->date('remind_on');
            $table->string('status', 20)->default('open'); // open | done | dismissed
            $table->timestamp('notified_at')->nullable();
            $table->timestamp('due_notified_at')->nullable();
            $table->timestamps();

            $table->index(['user_email', 'status']);
            $table->index(['remind_on', 'status']);
        });

        // Personal data the customer enters once and reuses for applications (Anträge)
        Schema::table('users', function (Blueprint $table) {
            $table->json('form_data')->nullable();
        });

        // Reply address found in a letter (used to suggest the recipient of an application)
        Schema::table('customer_documents', function (Blueprint $table) {
            $table->string('sender_email')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_reminders');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('form_data');
        });
        Schema::table('customer_documents', function (Blueprint $table) {
            $table->dropColumn('sender_email');
        });
    }
};
