<?php

namespace Database\Seeders;

use App\Models\BahanBaku;
use App\Models\KomposisiMenu;
use App\Models\KonversiBahan;
use App\Models\Menu;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KomposisiMenuSeeder extends Seeder
{
    /**
     * Helper: Cari konversi bahan berdasarkan nama bahan & nama satuan
     */
    private function getKonversi(string $namaBahan, string $namaSatuan): ?KonversiBahan
    {
        return KonversiBahan::whereHas('bahanBaku', fn($q) => $q->where('nama', $namaBahan))
            ->whereHas('satuan', fn($q) => $q->where('nama', $namaSatuan))
            ->first();
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get menu
        $ayamGoreng = Menu::where('nama', 'Ayam Goreng')->first();
        $ayamRica = Menu::where('nama', 'Ayam Rica-Rica')->first();
        $nasiAyamGoreng = Menu::where('nama', 'Nasi Ayam Goreng')->first();
        $nasiAyamRica = Menu::where('nama', 'Nasi Ayam Rica-Rica')->first();
        $nasiPutih = Menu::where('nama', 'Nasi Putih')->first();
        $esTeh = Menu::where('nama', 'Es Teh Manis')->first();
        $esJeruk = Menu::where('nama', 'Es Jeruk')->first();
        $tehHangat = Menu::where('nama', 'Teh Hangat')->first();

        // Get konversi bahan (bahan + satuan sudah terhubung)
        $ayamPotong = $this->getKonversi('Ayam', 'potong');
        $nasiPorsi = $this->getKonversi('Nasi', 'porsi');
        $esGelas = $this->getKonversi('Es Batu', 'gelas');
        $tehGelas = $this->getKonversi('Teh', 'gelas');
        $jerukGelas = $this->getKonversi('Jeruk', 'gelas');
        $gulaPorsi = $this->getKonversi('Gula', 'porsi');
        $bumbuPorsi = $this->getKonversi('Bumbu Rica-Rica', 'porsi');
        $minyakGelas = $this->getKonversi('Minyak Goreng', 'gelas');

        // Komposisi Ayam Goreng: 1 potong ayam, sedikit minyak
        if ($ayamGoreng && $ayamPotong) {
            KomposisiMenu::create([
                'menu_id' => $ayamGoreng->id,
                'konversi_bahan_id' => $ayamPotong->id,
                'jumlah' => 1,
            ]);
        }
        if ($ayamGoreng && $minyakGelas) {
            KomposisiMenu::create([
                'menu_id' => $ayamGoreng->id,
                'konversi_bahan_id' => $minyakGelas->id,
                'jumlah' => 0.25, // 1/4 gelas minyak
            ]);
        }

        // Komposisi Ayam Rica-Rica: 1 potong ayam, 1 porsi bumbu, sedikit minyak
        if ($ayamRica && $ayamPotong) {
            KomposisiMenu::create([
                'menu_id' => $ayamRica->id,
                'konversi_bahan_id' => $ayamPotong->id,
                'jumlah' => 1,
            ]);
        }
        if ($ayamRica && $bumbuPorsi) {
            KomposisiMenu::create([
                'menu_id' => $ayamRica->id,
                'konversi_bahan_id' => $bumbuPorsi->id,
                'jumlah' => 1,
            ]);
        }
        if ($ayamRica && $minyakGelas) {
            KomposisiMenu::create([
                'menu_id' => $ayamRica->id,
                'konversi_bahan_id' => $minyakGelas->id,
                'jumlah' => 0.25,
            ]);
        }

        // Komposisi Nasi Ayam Goreng: 1 porsi nasi, 1 potong ayam, sedikit minyak
        if ($nasiAyamGoreng && $nasiPorsi) {
            KomposisiMenu::create([
                'menu_id' => $nasiAyamGoreng->id,
                'konversi_bahan_id' => $nasiPorsi->id,
                'jumlah' => 1,
            ]);
        }
        if ($nasiAyamGoreng && $ayamPotong) {
            KomposisiMenu::create([
                'menu_id' => $nasiAyamGoreng->id,
                'konversi_bahan_id' => $ayamPotong->id,
                'jumlah' => 1,
            ]);
        }
        if ($nasiAyamGoreng && $minyakGelas) {
            KomposisiMenu::create([
                'menu_id' => $nasiAyamGoreng->id,
                'konversi_bahan_id' => $minyakGelas->id,
                'jumlah' => 0.25,
            ]);
        }

        // Komposisi Nasi Ayam Rica-Rica
        if ($nasiAyamRica && $nasiPorsi) {
            KomposisiMenu::create([
                'menu_id' => $nasiAyamRica->id,
                'konversi_bahan_id' => $nasiPorsi->id,
                'jumlah' => 1,
            ]);
        }
        if ($nasiAyamRica && $ayamPotong) {
            KomposisiMenu::create([
                'menu_id' => $nasiAyamRica->id,
                'konversi_bahan_id' => $ayamPotong->id,
                'jumlah' => 1,
            ]);
        }
        if ($nasiAyamRica && $bumbuPorsi) {
            KomposisiMenu::create([
                'menu_id' => $nasiAyamRica->id,
                'konversi_bahan_id' => $bumbuPorsi->id,
                'jumlah' => 1,
            ]);
        }
        if ($nasiAyamRica && $minyakGelas) {
            KomposisiMenu::create([
                'menu_id' => $nasiAyamRica->id,
                'konversi_bahan_id' => $minyakGelas->id,
                'jumlah' => 0.25,
            ]);
        }

        // Komposisi Nasi Putih: 1 porsi nasi
        if ($nasiPutih && $nasiPorsi) {
            KomposisiMenu::create([
                'menu_id' => $nasiPutih->id,
                'konversi_bahan_id' => $nasiPorsi->id,
                'jumlah' => 1,
            ]);
        }

        // Komposisi Es Teh Manis: 1 gelas es, 1 gelas teh, 1 porsi gula
        if ($esTeh && $esGelas) {
            KomposisiMenu::create([
                'menu_id' => $esTeh->id,
                'konversi_bahan_id' => $esGelas->id,
                'jumlah' => 1,
            ]);
        }
        if ($esTeh && $tehGelas) {
            KomposisiMenu::create([
                'menu_id' => $esTeh->id,
                'konversi_bahan_id' => $tehGelas->id,
                'jumlah' => 1,
            ]);
        }
        if ($esTeh && $gulaPorsi) {
            KomposisiMenu::create([
                'menu_id' => $esTeh->id,
                'konversi_bahan_id' => $gulaPorsi->id,
                'jumlah' => 1,
            ]);
        }

        // Komposisi Es Jeruk: 1 gelas es, 1 gelas jeruk, 1 porsi gula
        if ($esJeruk && $esGelas) {
            KomposisiMenu::create([
                'menu_id' => $esJeruk->id,
                'konversi_bahan_id' => $esGelas->id,
                'jumlah' => 1,
            ]);
        }
        if ($esJeruk && $jerukGelas) {
            KomposisiMenu::create([
                'menu_id' => $esJeruk->id,
                'konversi_bahan_id' => $jerukGelas->id,
                'jumlah' => 1,
            ]);
        }
        if ($esJeruk && $gulaPorsi) {
            KomposisiMenu::create([
                'menu_id' => $esJeruk->id,
                'konversi_bahan_id' => $gulaPorsi->id,
                'jumlah' => 1,
            ]);
        }

        // Komposisi Teh Hangat: 1 gelas teh, 1 porsi gula
        if ($tehHangat && $tehGelas) {
            KomposisiMenu::create([
                'menu_id' => $tehHangat->id,
                'konversi_bahan_id' => $tehGelas->id,
                'jumlah' => 1,
            ]);
        }
        if ($tehHangat && $gulaPorsi) {
            KomposisiMenu::create([
                'menu_id' => $tehHangat->id,
                'konversi_bahan_id' => $gulaPorsi->id,
                'jumlah' => 1,
            ]);
        }
    }
}
