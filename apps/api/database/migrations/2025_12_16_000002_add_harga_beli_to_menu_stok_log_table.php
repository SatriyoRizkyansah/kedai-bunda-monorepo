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
        Schema::table('menu_stok_log', function (Blueprint $table) {
            // Harga beli per unit saat stok ditambah (untuk tracking HPP)
            $table->decimal('harga_beli', 12, 2)->nullable()->after('jumlah');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_stok_log', function (Blueprint $table) {
            $table->dropColumn('harga_beli');
        });
    }
};
