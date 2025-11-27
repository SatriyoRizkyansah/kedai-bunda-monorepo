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
        Schema::table('konversi_bahan', function (Blueprint $table) {
            // Hapus kolom string satuan_konversi
            $table->dropColumn('satuan_konversi');
            
            // Tambah foreign key ke tabel satuan
            $table->foreignId('satuan_id')->after('bahan_baku_id')->constrained('satuan')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('konversi_bahan', function (Blueprint $table) {
            $table->dropForeign(['satuan_id']);
            $table->dropColumn('satuan_id');
            $table->string('satuan_konversi')->after('bahan_baku_id');
        });
    }
};
