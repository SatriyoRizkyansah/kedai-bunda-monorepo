<?php

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
            if (!Schema::hasColumn('stok_log', 'harga_beli')) {
                $table->decimal('harga_beli', 12, 2)->nullable()->after('keterangan');
            }
            if (!Schema::hasColumn('stok_log', 'base_satuan_id')) {
                $table->foreignId('base_satuan_id')->nullable()->constrained('satuan')->onDelete('set null')->after('jumlah');
            }
            if (!Schema::hasColumn('stok_log', 'base_jumlah')) {
                $table->decimal('base_jumlah', 10, 2)->nullable()->after('base_satuan_id');
            }
            if (!Schema::hasColumn('stok_log', 'konversi_bahan_id')) {
                $table->foreignId('konversi_bahan_id')->nullable()->constrained('konversi_bahan')->onDelete('set null')->after('base_jumlah');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stok_log', function (Blueprint $table) {
            if (Schema::hasColumn('stok_log', 'harga_beli')) {
                $table->dropColumn('harga_beli');
            }
            if (Schema::hasColumn('stok_log', 'konversi_bahan_id')) {
                $table->dropForeign(['konversi_bahan_id']);
                $table->dropColumn('konversi_bahan_id');
            }
            if (Schema::hasColumn('stok_log', 'base_jumlah')) {
                $table->dropColumn('base_jumlah');
            }
            if (Schema::hasColumn('stok_log', 'base_satuan_id')) {
                $table->dropForeign(['base_satuan_id']);
                $table->dropColumn('base_satuan_id');
            }
        });
    }
};
