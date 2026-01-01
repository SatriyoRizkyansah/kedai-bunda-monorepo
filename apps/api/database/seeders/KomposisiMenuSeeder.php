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
        return KonversiBahan::whereHas('bahanBaku', fn ($q) => $q->where('nama', $namaBahan))
            ->whereHas('satuan', fn ($q) => $q->where('nama', $namaSatuan))
            ->first();
    }

    private function getBahan(string $namaBahan): ?BahanBaku
    {
        return BahanBaku::where('nama', $namaBahan)->first();
    }

    private function addKomposisi(?Menu $menu, string $namaBahan, float $jumlah, ?int $satuanId = null): void
    {
        if (!$menu) {
            return;
        }

        $bahan = $this->getBahan($namaBahan);
        if (!$bahan) {
            return;
        }

        KomposisiMenu::create([
            'menu_id' => $menu->id,
            'bahan_baku_id' => $bahan->id,
            'satuan_id' => $satuanId ?? $bahan->satuan_id,
            'jumlah' => $jumlah,
        ]);
    }

    private function jumlahDariKonversi(string $namaBahan, string $namaSatuan, float $jumlahSatuan): ?float
    {
        $konversi = $this->getKonversi($namaBahan, $namaSatuan);

        if (!$konversi || $konversi->jumlah_konversi <= 0) {
            return null;
        }

        return round($jumlahSatuan / $konversi->jumlah_konversi, 6);
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

        // Pre-computed jumlah manual untuk bahan yang membutuhkan konversi dari stok dasar
        $minyakLiterPerGelas = $this->jumlahDariKonversi('Minyak Goreng', 'gelas', 1) ?? 0.05;

        // Komposisi Ayam Goreng: 1 potong ayam, sedikit minyak
        $this->addKomposisi($ayamGoreng, 'Ayam', 1);
        $this->addKomposisi($ayamGoreng, 'Minyak Goreng', round(0.25 * $minyakLiterPerGelas, 6));

        // Komposisi Ayam Rica-Rica: 1 potong ayam, 1 porsi bumbu, sedikit minyak
        $this->addKomposisi($ayamRica, 'Ayam', 1);
        $this->addKomposisi($ayamRica, 'Bumbu Rica-Rica', 1);
        $this->addKomposisi($ayamRica, 'Minyak Goreng', round(0.25 * $minyakLiterPerGelas, 6));

        // Komposisi Nasi Ayam Goreng: 1 porsi nasi, 1 potong ayam, sedikit minyak
        $this->addKomposisi($nasiAyamGoreng, 'Nasi', 1);
        $this->addKomposisi($nasiAyamGoreng, 'Ayam', 1);
        $this->addKomposisi($nasiAyamGoreng, 'Minyak Goreng', round(0.25 * $minyakLiterPerGelas, 6));

        // Komposisi Nasi Ayam Rica-Rica
        $this->addKomposisi($nasiAyamRica, 'Nasi', 1);
        $this->addKomposisi($nasiAyamRica, 'Ayam', 1);
        $this->addKomposisi($nasiAyamRica, 'Bumbu Rica-Rica', 1);
        $this->addKomposisi($nasiAyamRica, 'Minyak Goreng', round(0.25 * $minyakLiterPerGelas, 6));

        // Komposisi Nasi Putih: 1 porsi nasi
        $this->addKomposisi($nasiPutih, 'Nasi', 1);

        // Komposisi Es Teh Manis: 1 gelas es, 1 porsi teh, 1 porsi gula
        $this->addKomposisi($esTeh, 'Es Batu', 1);
        $this->addKomposisi($esTeh, 'Teh', 1);
        $this->addKomposisi($esTeh, 'Gula', 1);

        // Komposisi Es Jeruk: 1 gelas es, 1 porsi jeruk, 1 porsi gula
        $this->addKomposisi($esJeruk, 'Es Batu', 1);
        $this->addKomposisi($esJeruk, 'Jeruk', 1);
        $this->addKomposisi($esJeruk, 'Gula', 1);

        // Komposisi Teh Hangat: 1 porsi teh, 1 porsi gula
        $this->addKomposisi($tehHangat, 'Teh', 1);
        $this->addKomposisi($tehHangat, 'Gula', 1);
    }
}
