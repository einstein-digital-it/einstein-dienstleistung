<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A file the customer creates and names (e.g. one employee); the AI sorts its papers into sections
        Schema::create('customer_files', function (Blueprint $table) {
            $table->id();
            $table->string('user_email')->index();
            $table->string('name');
            $table->timestamps();
        });

        Schema::table('customer_documents', function (Blueprint $table) {
            $table->unsignedBigInteger('customer_file_id')->nullable()->index();
            $table->string('section', 100)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('customer_documents', function (Blueprint $table) {
            $table->dropIndex(['customer_file_id']);
            $table->dropColumn(['customer_file_id', 'section']);
        });
        Schema::dropIfExists('customer_files');
    }
};
