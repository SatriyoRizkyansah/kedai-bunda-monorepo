<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stok_log', function (Blueprint $table) {
            $table->foreignId('base_satuan_id')
                ->nullable()
                ->after('jumlah')
                ->constrained('satuan')
                ->nullOnDelete();

            $table->decimal('base_jumlah', 10, 2)->nullable()->after('base_satuan_id');

            $table->foreignId('konversi_bahan_id')
                ->nullable()
                ->after('base_jumlah')
                ->constrained('konversi_bahan')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stok_log', function (Blueprint $table) {
            $table->dropForeign(['konversi_bahan_id']);
            $table->dropForeign(['base_satuan_id']);
            $table->dropColumn(['konversi_bahan_id', 'base_jumlah', 'base_satuan_id']);
        });
    }
};
