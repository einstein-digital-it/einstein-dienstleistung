<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $columns = [
        'label_de', 'label_en', 'label_tr', 'label_ar',
        'unit_de', 'unit_en', 'unit_tr', 'unit_ar',
    ];

    public function up(): void
    {
        Schema::table('price_items', function (Blueprint $table) {
            foreach ($this->columns as $column) {
                $table->string($column)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('price_items', function (Blueprint $table) {
            $table->dropColumn($this->columns);
        });
    }
};
