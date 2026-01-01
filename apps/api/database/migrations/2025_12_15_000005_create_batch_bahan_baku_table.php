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
        Schema::create('batch_bahan_baku', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bahan_baku_id')->constrained('bahan_baku')->onDelete('cascade');
            $table->foreignId('stok_log_id')->nullable()->constrained('stok_log')->onDelete('set null');
            
            // Raw material info (e.g., 2 ekor)
            $table->decimal('base_jumlah', 10, 2)->nullable();
            $table->foreignId('base_satuan_id')->nullable()->constrained('satuan')->onDelete('set null');
            
            // Converted stock info (e.g., 14 potong)
            $table->decimal('jumlah_awal', 10, 2); // Initial amount after conversion
            $table->decimal('jumlah_sisa', 10, 2); // Remaining amount
            
            $table->text('keterangan')->nullable();
            $table->timestamps();
            
            // Index for FIFO queries
            $table->index(['bahan_baku_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_bahan_baku');
    }
};
