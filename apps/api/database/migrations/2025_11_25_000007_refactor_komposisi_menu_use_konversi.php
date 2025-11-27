<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Refactor: Hubungkan komposisi_menu ke konversi_bahan
     * Jadi user tidak perlu input satuan manual, tinggal pilih dari konversi yang tersedia
     */
    public function up(): void
    {
        Schema::table('komposisi_menu', function (Blueprint $table) {
            // Hapus kolom satuan (string) yang ada di migration awal
            $table->dropColumn('satuan');
            
            // Hapus foreign key bahan_baku_id karena sekarang ambil dari konversi
            $table->dropForeign(['bahan_baku_id']);
            $table->dropColumn('bahan_baku_id');
            
            // Tambah konversi_bahan_id - ini sudah include bahan_baku + satuan
            $table->foreignId('konversi_bahan_id')->after('menu_id')->constrained('konversi_bahan')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('komposisi_menu', function (Blueprint $table) {
            $table->dropForeign(['konversi_bahan_id']);
            $table->dropColumn('konversi_bahan_id');
            
            $table->foreignId('bahan_baku_id')->after('menu_id')->constrained('bahan_baku')->onDelete('cascade');
            $table->string('satuan')->after('jumlah');
        });
    }
};
