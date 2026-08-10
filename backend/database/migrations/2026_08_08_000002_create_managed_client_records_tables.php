<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_communications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('managed_client_id')->constrained()->cascadeOnDelete();
            $table->string('channel')->index();
            $table->string('direction')->default('outbound');
            $table->text('summary');
            $table->text('details')->nullable();
            $table->text('translated_summary')->nullable();
            $table->string('attachment_name')->nullable();
            $table->string('attachment_url')->nullable();
            $table->string('performed_by')->nullable();
            $table->timestamp('occurred_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('client_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('managed_client_id')->constrained()->cascadeOnDelete();
            $table->string('request_number')->unique();
            $table->string('subject');
            $table->text('description')->nullable();
            $table->string('status')->default('open')->index();
            $table->string('priority')->default('normal');
            $table->string('assigned_to')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamps();
        });

        Schema::create('client_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('managed_client_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('file_url');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->string('uploaded_by')->nullable();
            $table->timestamps();
        });

        Schema::create('client_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('managed_client_id')->constrained()->cascadeOnDelete();
            $table->string('invoice_number')->unique();
            $table->string('title');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('EUR');
            $table->string('status')->default('draft')->index();
            $table->date('due_date')->nullable();
            $table->string('invoice_url')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('client_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('managed_client_id')->constrained()->cascadeOnDelete();
            $table->string('event_type')->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('actor_name')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_histories');
        Schema::dropIfExists('client_invoices');
        Schema::dropIfExists('client_files');
        Schema::dropIfExists('client_requests');
        Schema::dropIfExists('client_communications');
    }
};
