<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Papers sorted and translated under the Unterlagen-Abo in the current calendar month
        Schema::table('users', function (Blueprint $table) {
            $table->string('file_abo_month', 7)->nullable();
            $table->unsignedInteger('file_abo_used')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['file_abo_month', 'file_abo_used']);
        });
    }
};
