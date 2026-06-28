<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('address')->nullable()->after('time');
            $table->text('required_documents_hint')->nullable()->after('description');
            $table->string('confirmed_by_provider_id')->nullable()->after('provider_name');
            $table->string('confirmed_by_provider_name')->nullable()->after('confirmed_by_provider_id');
            $table->string('confirmed_by_provider_email')->nullable()->after('confirmed_by_provider_name');
            $table->timestamp('confirmed_at')->nullable()->after('confirmed_by_provider_email');
            $table->json('provider_documents_urls')->nullable()->after('documents_urls');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'address',
                'required_documents_hint',
                'confirmed_by_provider_id',
                'confirmed_by_provider_name',
                'confirmed_by_provider_email',
                'confirmed_at',
                'provider_documents_urls',
            ]);
        });
    }
};
