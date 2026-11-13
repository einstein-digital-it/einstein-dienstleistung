<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The website and app showed services from texts in the code, so "Dienste verwalten" was empty.
 * This adds the missing languages (tr/es/uk) and the feature lists, and puts the services that
 * were in the code into the table. A category that already has a row is left alone.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('name_tr')->nullable()->after('name_en');
            $table->string('name_es')->nullable()->after('name_tr');
            $table->string('name_uk')->nullable()->after('name_es');
            $table->text('description_tr')->nullable()->after('description_en');
            $table->text('description_es')->nullable()->after('description_tr');
            $table->text('description_uk')->nullable()->after('description_es');
            $table->json('features')->nullable()->after('description_uk');
        });

        $rows = json_decode(file_get_contents(database_path('data/default_services.json')), true);
        $now = now();
        foreach ($rows as $row) {
            if (DB::table('services')->where('category', $row['category'])->exists()) {
                continue;
            }
            $row['name'] = $row['name_de'];
            $row['description'] = $row['description_de'];
            $row['features'] = json_encode($row['features'], JSON_UNESCAPED_UNICODE);
            $row['status'] = 'active';
            DB::table('services')->insert($row + ['created_at' => $now, 'updated_at' => $now]);
        }
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['name_tr', 'name_es', 'name_uk', 'description_tr', 'description_es', 'description_uk', 'features']);
        });
    }
};
