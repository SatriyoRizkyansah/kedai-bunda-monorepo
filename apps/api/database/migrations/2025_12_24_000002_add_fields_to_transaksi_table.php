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
        Schema::table('transaksi', function (Blueprint $table) {
            // Add missing columns
            $table->string('nama_pelanggan')->nullable()->after('user_id');
            $table->enum('metode_pembayaran', ['tunai', 'qris', 'transfer'])->default('tunai')->after('kembalian');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaksi', function (Blueprint $table) {
            $table->dropColumn(['nama_pelanggan', 'metode_pembayaran']);
        });
    }
};
