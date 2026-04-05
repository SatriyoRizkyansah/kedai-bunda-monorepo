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
        Schema::create('batch_menu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained('menu')->onDelete('cascade');
            $table->foreignId('menu_stok_log_id')->nullable()->constrained('menu_stok_log')->onDelete('set null');
            $table->decimal('jumlah_awal', 10, 2);
            $table->decimal('jumlah_sisa', 10, 2);
            $table->decimal('harga_beli', 12, 2)->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->index(['menu_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_menu');
    }
};
