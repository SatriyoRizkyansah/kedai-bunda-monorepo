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
        Schema::create('satuan', function (Blueprint $table) {
            $table->id();
            $table->string('nama'); // kg, gram, liter, ml, pcs, potong, ekor, balok, dll
            $table->string('singkatan'); // kg, g, l, ml, pcs, ptg, dll
            $table->enum('tipe', ['berat', 'volume', 'jumlah']); // kategori satuan
            $table->string('satuan_dasar')->nullable(); // referensi ke satuan dasar (kg untuk gram, liter untuk ml)
            $table->decimal('faktor_konversi', 15, 6)->default(1); // 1 kg = 1000 gram, jadi gram punya faktor 0.001
            $table->boolean('is_satuan_dasar')->default(false); // apakah ini satuan dasar
            $table->boolean('aktif')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('satuan');
    }
};
