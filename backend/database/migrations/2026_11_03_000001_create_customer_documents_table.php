<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // "Meine Unterlagen": each customer's documents, sorted into folders
        // (Jobcenter, Finanzamt, ...). Files live on the private disk only.
        Schema::create('customer_documents', function (Blueprint $table) {
            $table->id();
            $table->string('user_email');
            $table->string('folder', 40);            // see CustomerDocument::FOLDERS
            $table->string('title');
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->string('uploaded_by', 20)->default('customer'); // customer | einstein
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['user_email', 'folder']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_documents');
    }
};
