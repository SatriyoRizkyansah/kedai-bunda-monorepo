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
        Schema::table('detail_transaksi', function (Blueprint $table) {
            $table->decimal('hpp_per_unit', 12, 2)->nullable()->after('harga_satuan');
            $table->decimal('hpp_total', 12, 2)->nullable()->after('subtotal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('detail_transaksi', function (Blueprint $table) {
            $table->dropColumn(['hpp_per_unit', 'hpp_total']);
        });
    }
};
