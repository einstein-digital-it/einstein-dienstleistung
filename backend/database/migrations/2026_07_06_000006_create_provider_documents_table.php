<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provider_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_provider_id')->nullable()->constrained('service_providers')->nullOnDelete();
            $table->string('provider_email')->nullable()->index();
            $table->string('title');
            $table->string('document_type')->default('general')->index();
            $table->string('file_url')->nullable();
            $table->string('status')->default('active')->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provider_documents');
    }
};
