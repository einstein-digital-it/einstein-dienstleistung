<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // "Meine Unterlagen" Abo: automatic sorting + translation, 5 €/month incl. VAT
            $table->string('file_abo_status')->default('none'); // none | pending | active | past_due | canceled
            $table->string('file_abo_subscription_id')->nullable()->index();
            $table->timestamp('file_abo_ends_at')->nullable(); // set when cancelled at period end
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['file_abo_subscription_id']);
            $table->dropColumn(['file_abo_status', 'file_abo_subscription_id', 'file_abo_ends_at']);
        });
    }
};
