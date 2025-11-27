<?php

namespace Database\Seeders;

use App\Models\BahanBaku;
use App\Models\KonversiBahan;
use App\Models\Satuan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KonversiBahanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil satuan yang dibutuhkan
        $potong = Satuan::where('nama', 'potong')->first();
        $porsi = Satuan::where('nama', 'porsi')->first();
        $gelas = Satuan::where('nama', 'gelas')->first();

        // Konversi untuk Ayam
        $ayam = BahanBaku::where('nama', 'Ayam')->first();
        if ($ayam && $potong) {
            KonversiBahan::create([
                'bahan_baku_id' => $ayam->id,
                'satuan_id' => $potong->id,
                'jumlah_konversi' => 8,
                'keterangan' => '1 ekor ayam = 8 potong',
            ]);
        }

        // Konversi untuk Nasi
        $nasi = BahanBaku::where('nama', 'Nasi')->first();
        if ($nasi && $porsi) {
            KonversiBahan::create([
                'bahan_baku_id' => $nasi->id,
                'satuan_id' => $porsi->id,
                'jumlah_konversi' => 12,
                'keterangan' => '1 liter nasi = 12 porsi',
            ]);
        }

        // Konversi untuk Es Batu
        $es = BahanBaku::where('nama', 'Es Batu')->first();
        if ($es && $gelas) {
            KonversiBahan::create([
                'bahan_baku_id' => $es->id,
                'satuan_id' => $gelas->id,
                'jumlah_konversi' => 20,
                'keterangan' => '1 balok es = 20 gelas',
            ]);
        }

        // Konversi untuk Teh
        $teh = BahanBaku::where('nama', 'Teh')->first();
        if ($teh && $gelas) {
            KonversiBahan::create([
                'bahan_baku_id' => $teh->id,
                'satuan_id' => $gelas->id,
                'jumlah_konversi' => 100,
                'keterangan' => '1 kg teh = 100 gelas',
            ]);
        }

        // Konversi untuk Jeruk
        $jeruk = BahanBaku::where('nama', 'Jeruk')->first();
        if ($jeruk && $gelas) {
            KonversiBahan::create([
                'bahan_baku_id' => $jeruk->id,
                'satuan_id' => $gelas->id,
                'jumlah_konversi' => 10,
                'keterangan' => '1 kg jeruk = 10 gelas',
            ]);
        }

        // Konversi untuk Gula - menggunakan porsi sebagai takaran
        $gula = BahanBaku::where('nama', 'Gula')->first();
        if ($gula && $porsi) {
            KonversiBahan::create([
                'bahan_baku_id' => $gula->id,
                'satuan_id' => $porsi->id,
                'jumlah_konversi' => 100,
                'keterangan' => '1 kg gula = 100 takaran/porsi',
            ]);
        }

        // Konversi untuk Bumbu Rica-Rica
        $bumbu = BahanBaku::where('nama', 'Bumbu Rica-Rica')->first();
        if ($bumbu && $porsi) {
            KonversiBahan::create([
                'bahan_baku_id' => $bumbu->id,
                'satuan_id' => $porsi->id,
                'jumlah_konversi' => 20,
                'keterangan' => '1 kg bumbu = 20 porsi',
            ]);
        }

        // Konversi untuk Minyak Goreng - menggunakan gelas sebagai takaran
        $minyak = BahanBaku::where('nama', 'Minyak Goreng')->first();
        if ($minyak && $gelas) {
            KonversiBahan::create([
                'bahan_baku_id' => $minyak->id,
                'satuan_id' => $gelas->id,
                'jumlah_konversi' => 20,
                'keterangan' => '1 liter minyak = 20 gelas/takaran',
            ]);
        }
    }
}
