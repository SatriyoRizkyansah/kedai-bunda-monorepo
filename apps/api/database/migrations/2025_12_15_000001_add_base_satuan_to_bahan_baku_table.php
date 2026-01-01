<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bahan_baku', function (Blueprint $table) {
            $table->foreignId('base_satuan_id')
                ->nullable()
                ->after('satuan_id')
                ->constrained('satuan')
                ->nullOnDelete();
        });

        // Seed initial base_satuan_id with existing satuan_id values for backward compatibility
        DB::table('bahan_baku')->update([
            'base_satuan_id' => DB::raw('satuan_id'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bahan_baku', function (Blueprint $table) {
            $table->dropForeign(['base_satuan_id']);
            $table->dropColumn('base_satuan_id');
        });
    }
};
