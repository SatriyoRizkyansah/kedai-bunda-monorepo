<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Menambahkan satuan_id ke bahan_baku dan migrasi data dari satuan_dasar
     */
    public function up(): void
    {
        // 1. Tambahkan kolom satuan_id (nullable dulu) - hanya jika belum ada
        if (!Schema::hasColumn('bahan_baku', 'satuan_id')) {
            Schema::table('bahan_baku', function (Blueprint $table) {
                $table->foreignId('satuan_id')->nullable()->after('nama')->constrained('satuan')->nullOnDelete();
            });
        }

        // 2. Migrasi data - cari atau buat satuan berdasarkan satuan_dasar
        $bahanBakuList = DB::table('bahan_baku')->get();
        foreach ($bahanBakuList as $bahan) {
            if (!empty($bahan->satuan_dasar)) {
                // Cari satuan yang cocok
                $satuan = DB::table('satuan')
                    ->where('nama', 'like', $bahan->satuan_dasar)
                    ->orWhere('singkatan', 'like', $bahan->satuan_dasar)
                    ->first();

                // Jika tidak ada, buat baru
                if (!$satuan) {
                    $satuanId = DB::table('satuan')->insertGetId([
                        'nama' => ucfirst($bahan->satuan_dasar),
                        'singkatan' => strtolower($bahan->satuan_dasar),
                        'keterangan' => 'Auto-created dari bahan baku: ' . $bahan->nama,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    $satuanId = $satuan->id;
                }

                // Update bahan_baku
                DB::table('bahan_baku')
                    ->where('id', $bahan->id)
                    ->update(['satuan_id' => $satuanId]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bahan_baku', function (Blueprint $table) {
            $table->dropForeign(['satuan_id']);
            $table->dropColumn('satuan_id');
        });
    }
};
