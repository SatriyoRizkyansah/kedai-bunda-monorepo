<?php

namespace Database\Seeders;

use App\Models\BahanBaku;
use App\Models\KomposisiMenu;
use App\Models\Menu;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KomposisiMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get bahan baku
        $ayam = BahanBaku::where('nama', 'Ayam')->first();
        $nasi = BahanBaku::where('nama', 'Nasi')->first();
        $es = BahanBaku::where('nama', 'Es Batu')->first();
        $teh = BahanBaku::where('nama', 'Teh')->first();
        $jeruk = BahanBaku::where('nama', 'Jeruk')->first();
        $gula = BahanBaku::where('nama', 'Gula')->first();
        $bumbuRica = BahanBaku::where('nama', 'Bumbu Rica-Rica')->first();
        $minyak = BahanBaku::where('nama', 'Minyak Goreng')->first();

        // Get menu
        $ayamGoreng = Menu::where('nama', 'Ayam Goreng')->first();
        $ayamRica = Menu::where('nama', 'Ayam Rica-Rica')->first();
        $nasiAyamGoreng = Menu::where('nama', 'Nasi Ayam Goreng')->first();
        $nasiAyamRica = Menu::where('nama', 'Nasi Ayam Rica-Rica')->first();
        $nasiPutih = Menu::where('nama', 'Nasi Putih')->first();
        $esTeh = Menu::where('nama', 'Es Teh Manis')->first();
        $esJeruk = Menu::where('nama', 'Es Jeruk')->first();
        $tehHangat = Menu::where('nama', 'Teh Hangat')->first();

        // Komposisi Ayam Goreng
        KomposisiMenu::create([
            'menu_id' => $ayamGoreng->id,
            'bahan_baku_id' => $ayam->id,
            'jumlah' => 1,
            'satuan' => 'potong',
        ]);
        KomposisiMenu::create([
            'menu_id' => $ayamGoreng->id,
            'bahan_baku_id' => $minyak->id,
            'jumlah' => 1,
            'satuan' => 'takaran',
        ]);

        // Komposisi Ayam Rica-Rica
        KomposisiMenu::create([
            'menu_id' => $ayamRica->id,
            'bahan_baku_id' => $ayam->id,
            'jumlah' => 1,
            'satuan' => 'potong',
        ]);
        KomposisiMenu::create([
            'menu_id' => $ayamRica->id,
            'bahan_baku_id' => $bumbuRica->id,
            'jumlah' => 1,
            'satuan' => 'porsi',
        ]);
        KomposisiMenu::create([
            'menu_id' => $ayamRica->id,
            'bahan_baku_id' => $minyak->id,
            'jumlah' => 1,
            'satuan' => 'takaran',
        ]);

        // Komposisi Nasi Ayam Goreng
        KomposisiMenu::create([
            'menu_id' => $nasiAyamGoreng->id,
            'bahan_baku_id' => $nasi->id,
            'jumlah' => 1,
            'satuan' => 'porsi',
        ]);
        KomposisiMenu::create([
            'menu_id' => $nasiAyamGoreng->id,
            'bahan_baku_id' => $ayam->id,
            'jumlah' => 1,
            'satuan' => 'potong',
        ]);
        KomposisiMenu::create([
            'menu_id' => $nasiAyamGoreng->id,
            'bahan_baku_id' => $minyak->id,
            'jumlah' => 1,
            'satuan' => 'takaran',
        ]);

        // Komposisi Nasi Ayam Rica-Rica
        KomposisiMenu::create([
            'menu_id' => $nasiAyamRica->id,
            'bahan_baku_id' => $nasi->id,
            'jumlah' => 1,
            'satuan' => 'porsi',
        ]);
        KomposisiMenu::create([
            'menu_id' => $nasiAyamRica->id,
            'bahan_baku_id' => $ayam->id,
            'jumlah' => 1,
            'satuan' => 'potong',
        ]);
        KomposisiMenu::create([
            'menu_id' => $nasiAyamRica->id,
            'bahan_baku_id' => $bumbuRica->id,
            'jumlah' => 1,
            'satuan' => 'porsi',
        ]);
        KomposisiMenu::create([
            'menu_id' => $nasiAyamRica->id,
            'bahan_baku_id' => $minyak->id,
            'jumlah' => 1,
            'satuan' => 'takaran',
        ]);

        // Komposisi Nasi Putih
        KomposisiMenu::create([
            'menu_id' => $nasiPutih->id,
            'bahan_baku_id' => $nasi->id,
            'jumlah' => 1,
            'satuan' => 'porsi',
        ]);

        // Komposisi Es Teh Manis
        KomposisiMenu::create([
            'menu_id' => $esTeh->id,
            'bahan_baku_id' => $es->id,
            'jumlah' => 1,
            'satuan' => 'gelas',
        ]);
        KomposisiMenu::create([
            'menu_id' => $esTeh->id,
            'bahan_baku_id' => $teh->id,
            'jumlah' => 1,
            'satuan' => 'gelas',
        ]);
        KomposisiMenu::create([
            'menu_id' => $esTeh->id,
            'bahan_baku_id' => $gula->id,
            'jumlah' => 1,
            'satuan' => 'takaran',
        ]);

        // Komposisi Es Jeruk
        KomposisiMenu::create([
            'menu_id' => $esJeruk->id,
            'bahan_baku_id' => $es->id,
            'jumlah' => 1,
            'satuan' => 'gelas',
        ]);
        KomposisiMenu::create([
            'menu_id' => $esJeruk->id,
            'bahan_baku_id' => $jeruk->id,
            'jumlah' => 1,
            'satuan' => 'gelas',
        ]);
        KomposisiMenu::create([
            'menu_id' => $esJeruk->id,
            'bahan_baku_id' => $gula->id,
            'jumlah' => 1,
            'satuan' => 'takaran',
        ]);

        // Komposisi Teh Hangat
        KomposisiMenu::create([
            'menu_id' => $tehHangat->id,
            'bahan_baku_id' => $teh->id,
            'jumlah' => 1,
            'satuan' => 'gelas',
        ]);
        KomposisiMenu::create([
            'menu_id' => $tehHangat->id,
            'bahan_baku_id' => $gula->id,
            'jumlah' => 1,
            'satuan' => 'takaran',
        ]);
    }
}
