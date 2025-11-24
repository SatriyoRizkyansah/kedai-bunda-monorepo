<?php

namespace Database\Seeders;

use App\Models\BahanBaku;
use App\Models\KonversiBahan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KonversiBahanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Konversi untuk Ayam
        $ayam = BahanBaku::where('nama', 'Ayam')->first();
        KonversiBahan::create([
            'bahan_baku_id' => $ayam->id,
            'satuan_konversi' => 'potong',
            'jumlah_konversi' => 8,
            'keterangan' => '1 ekor ayam = 8 potong',
        ]);

        // Konversi untuk Nasi
        $nasi = BahanBaku::where('nama', 'Nasi')->first();
        KonversiBahan::create([
            'bahan_baku_id' => $nasi->id,
            'satuan_konversi' => 'porsi',
            'jumlah_konversi' => 12,
            'keterangan' => '1 liter nasi = 12 porsi',
        ]);

        // Konversi untuk Es Batu
        $es = BahanBaku::where('nama', 'Es Batu')->first();
        KonversiBahan::create([
            'bahan_baku_id' => $es->id,
            'satuan_konversi' => 'gelas',
            'jumlah_konversi' => 20,
            'keterangan' => '1 balok es = 20 gelas',
        ]);

        // Konversi untuk Teh
        $teh = BahanBaku::where('nama', 'Teh')->first();
        KonversiBahan::create([
            'bahan_baku_id' => $teh->id,
            'satuan_konversi' => 'gelas',
            'jumlah_konversi' => 100,
            'keterangan' => '1 kg teh = 100 gelas',
        ]);

        // Konversi untuk Jeruk
        $jeruk = BahanBaku::where('nama', 'Jeruk')->first();
        KonversiBahan::create([
            'bahan_baku_id' => $jeruk->id,
            'satuan_konversi' => 'gelas',
            'jumlah_konversi' => 10,
            'keterangan' => '1 kg jeruk = 10 gelas',
        ]);

        // Konversi untuk Gula
        $gula = BahanBaku::where('nama', 'Gula')->first();
        KonversiBahan::create([
            'bahan_baku_id' => $gula->id,
            'satuan_konversi' => 'takaran',
            'jumlah_konversi' => 100,
            'keterangan' => '1 kg gula = 100 takaran',
        ]);

        // Konversi untuk Bumbu Rica-Rica
        $bumbu = BahanBaku::where('nama', 'Bumbu Rica-Rica')->first();
        KonversiBahan::create([
            'bahan_baku_id' => $bumbu->id,
            'satuan_konversi' => 'porsi',
            'jumlah_konversi' => 20,
            'keterangan' => '1 kg bumbu = 20 porsi',
        ]);

        // Konversi untuk Minyak Goreng
        $minyak = BahanBaku::where('nama', 'Minyak Goreng')->first();
        KonversiBahan::create([
            'bahan_baku_id' => $minyak->id,
            'satuan_konversi' => 'takaran',
            'jumlah_konversi' => 20,
            'keterangan' => '1 liter minyak = 20 takaran',
        ]);
    }
}
