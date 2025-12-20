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
        Schema::table('batch_bahan_baku', function (Blueprint $table) {
            // Total harga beli untuk batch ini (misal: 2 ekor ayam = Rp 80.000)
            $table->decimal('harga_beli', 12, 2)->nullable()->after('base_jumlah');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batch_bahan_baku', function (Blueprint $table) {
            $table->dropColumn('harga_beli');
        });
    }
};
