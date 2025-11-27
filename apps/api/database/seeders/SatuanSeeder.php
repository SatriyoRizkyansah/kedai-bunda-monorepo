<?php

namespace Database\Seeders;

use App\Models\Satuan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SatuanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $satuanList = [
            // === SATUAN BERAT ===
            [
                'nama' => 'Kilogram',
                'singkatan' => 'kg',
                'tipe' => 'berat',
                'satuan_dasar' => null,
                'faktor_konversi' => 1,
                'is_satuan_dasar' => true,
                'aktif' => true,
            ],
            [
                'nama' => 'Gram',
                'singkatan' => 'g',
                'tipe' => 'berat',
                'satuan_dasar' => 'kg',
                'faktor_konversi' => 0.001, // 1 gram = 0.001 kg
                'is_satuan_dasar' => false,
                'aktif' => true,
            ],
            [
                'nama' => 'Ons',
                'singkatan' => 'ons',
                'tipe' => 'berat',
                'satuan_dasar' => 'kg',
                'faktor_konversi' => 0.1, // 1 ons = 0.1 kg = 100 gram
                'is_satuan_dasar' => false,
                'aktif' => true,
            ],

            // === SATUAN VOLUME ===
            [
                'nama' => 'Liter',
                'singkatan' => 'l',
                'tipe' => 'volume',
                'satuan_dasar' => null,
                'faktor_konversi' => 1,
                'is_satuan_dasar' => true,
                'aktif' => true,
            ],
            [
                'nama' => 'Mililiter',
                'singkatan' => 'ml',
                'tipe' => 'volume',
                'satuan_dasar' => 'l',
                'faktor_konversi' => 0.001, // 1 ml = 0.001 liter
                'is_satuan_dasar' => false,
                'aktif' => true,
            ],
            [
                'nama' => 'Gelas',
                'singkatan' => 'gelas',
                'tipe' => 'volume',
                'satuan_dasar' => 'l',
                'faktor_konversi' => 0.25, // 1 gelas = 250 ml = 0.25 liter
                'is_satuan_dasar' => false,
                'aktif' => true,
            ],

            // === SATUAN JUMLAH ===
            [
                'nama' => 'Pieces',
                'singkatan' => 'pcs',
                'tipe' => 'jumlah',
                'satuan_dasar' => null,
                'faktor_konversi' => 1,
                'is_satuan_dasar' => true,
                'aktif' => true,
            ],
            [
                'nama' => 'Porsi',
                'singkatan' => 'porsi',
                'tipe' => 'jumlah',
                'satuan_dasar' => 'pcs',
                'faktor_konversi' => 1, // 1 porsi = 1 pcs (bisa disesuaikan)
                'is_satuan_dasar' => false,
                'aktif' => true,
            ],
            [
                'nama' => 'Potong',
                'singkatan' => 'ptg',
                'tipe' => 'jumlah',
                'satuan_dasar' => 'pcs',
                'faktor_konversi' => 1,
                'is_satuan_dasar' => false,
                'aktif' => true,
            ],
            [
                'nama' => 'Ekor',
                'singkatan' => 'ekor',
                'tipe' => 'jumlah',
                'satuan_dasar' => 'pcs',
                'faktor_konversi' => 1,
                'is_satuan_dasar' => false,
                'aktif' => true,
            ],
            [
                'nama' => 'Bungkus',
                'singkatan' => 'bks',
                'tipe' => 'jumlah',
                'satuan_dasar' => 'pcs',
                'faktor_konversi' => 1,
                'is_satuan_dasar' => false,
                'aktif' => true,
            ],
            [
                'nama' => 'Balok',
                'singkatan' => 'blk',
                'tipe' => 'jumlah',
                'satuan_dasar' => 'pcs',
                'faktor_konversi' => 1,
                'is_satuan_dasar' => false,
                'aktif' => true,
            ],
            [
                'nama' => 'Butir',
                'singkatan' => 'btr',
                'tipe' => 'jumlah',
                'satuan_dasar' => 'pcs',
                'faktor_konversi' => 1,
                'is_satuan_dasar' => false,
                'aktif' => true,
            ],
            [
                'nama' => 'Ikat',
                'singkatan' => 'ikat',
                'tipe' => 'jumlah',
                'satuan_dasar' => 'pcs',
                'faktor_konversi' => 1,
                'is_satuan_dasar' => false,
                'aktif' => true,
            ],
            [
                'nama' => 'Sachet',
                'singkatan' => 'sct',
                'tipe' => 'jumlah',
                'satuan_dasar' => 'pcs',
                'faktor_konversi' => 1,
                'is_satuan_dasar' => false,
                'aktif' => true,
            ],
            [
                'nama' => 'Dus',
                'singkatan' => 'dus',
                'tipe' => 'jumlah',
                'satuan_dasar' => 'pcs',
                'faktor_konversi' => 1,
                'is_satuan_dasar' => false,
                'aktif' => true,
            ],
        ];

        foreach ($satuanList as $satuan) {
            Satuan::create($satuan);
        }
    }
}
