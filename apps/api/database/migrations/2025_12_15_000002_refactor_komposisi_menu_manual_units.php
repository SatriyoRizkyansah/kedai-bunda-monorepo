<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('komposisi_menu', function (Blueprint $table) {
            $table->foreignId('bahan_baku_id')
                ->nullable()
                ->after('menu_id')
                ->constrained('bahan_baku')
                ->cascadeOnDelete();

            $table->foreignId('satuan_id')
                ->nullable()
                ->after('bahan_baku_id')
                ->constrained('satuan')
                ->nullOnDelete();
        });

        // Migrasikan data dari konversi ke manual
        $records = DB::table('komposisi_menu as km')
            ->select('km.id', 'kb.bahan_baku_id', 'kb.satuan_id')
            ->leftJoin('konversi_bahan as kb', 'km.konversi_bahan_id', '=', 'kb.id')
            ->get();

        foreach ($records as $record) {
            if ($record->bahan_baku_id) {
                DB::table('komposisi_menu')
                    ->where('id', $record->id)
                    ->update([
                        'bahan_baku_id' => $record->bahan_baku_id,
                        'satuan_id' => $record->satuan_id,
                    ]);
            }
        }

        // Pastikan satuan mengikuti bahan baku jika belum terisi
        $needsSatuan = DB::table('komposisi_menu')
            ->select('id', 'bahan_baku_id')
            ->whereNotNull('bahan_baku_id')
            ->whereNull('satuan_id')
            ->get();

        foreach ($needsSatuan as $row) {
            $bahanSatuanId = DB::table('bahan_baku')->where('id', $row->bahan_baku_id)->value('satuan_id');
            if ($bahanSatuanId) {
                DB::table('komposisi_menu')->where('id', $row->id)->update([
                    'satuan_id' => $bahanSatuanId,
                ]);
            }
        }

        Schema::table('komposisi_menu', function (Blueprint $table) {
            $table->dropForeign(['konversi_bahan_id']);
            $table->dropColumn('konversi_bahan_id');
        });

        // Bersihkan data yang gagal dimigrasi untuk menghindari data korup
        DB::table('komposisi_menu')->whereNull('bahan_baku_id')->delete();

        // Jadikan bahan_baku_id wajib setelah migrasi (skip untuk SQLite karena tidak mendukung MODIFY)
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE komposisi_menu MODIFY bahan_baku_id BIGINT UNSIGNED NOT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('komposisi_menu', function (Blueprint $table) {
            $table->foreignId('konversi_bahan_id')
                ->nullable()
                ->after('menu_id')
                ->constrained('konversi_bahan')
                ->nullOnDelete();
        });

        $records = DB::table('komposisi_menu')->select('id', 'bahan_baku_id', 'satuan_id')->get();

        foreach ($records as $record) {
            $konversiId = DB::table('konversi_bahan')
                ->where('bahan_baku_id', $record->bahan_baku_id)
                ->when($record->satuan_id, function ($query) use ($record) {
                    return $query->where('satuan_id', $record->satuan_id);
                })
                ->value('id');

            DB::table('komposisi_menu')->where('id', $record->id)->update([
                'konversi_bahan_id' => $konversiId,
            ]);
        }

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE komposisi_menu MODIFY bahan_baku_id BIGINT UNSIGNED NULL');
        }

        Schema::table('komposisi_menu', function (Blueprint $table) {
            $table->dropForeign(['satuan_id']);
            $table->dropColumn(['bahan_baku_id', 'satuan_id']);
        });
    }
};
