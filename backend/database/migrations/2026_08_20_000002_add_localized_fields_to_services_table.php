<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('name_de')->nullable()->after('name');
            $table->string('name_ar')->nullable()->after('name_de');
            $table->string('name_en')->nullable()->after('name_ar');
            $table->text('description_de')->nullable()->after('description');
            $table->text('description_ar')->nullable()->after('description_de');
            $table->text('description_en')->nullable()->after('description_ar');
        });

        DB::table('services')->update([
            'name_de' => DB::raw('name'),
            'description_de' => DB::raw('description'),
        ]);
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn([
                'name_de',
                'name_ar',
                'name_en',
                'description_de',
                'description_ar',
                'description_en',
            ]);
        });
    }
};
