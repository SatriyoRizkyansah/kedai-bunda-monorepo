<?php

namespace Database\Seeders;

use App\Models\BahanBaku;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BahanBakuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bahanBaku = [
            [
                'nama' => 'Ayam',
                'satuan_dasar' => 'ekor',
                'stok_tersedia' => 20,
                'harga_per_satuan' => 45000,
                'keterangan' => 'Ayam kampung segar',
                'aktif' => true,
            ],
            [
                'nama' => 'Nasi',
                'satuan_dasar' => 'liter',
                'stok_tersedia' => 15,
                'harga_per_satuan' => 12000,
                'keterangan' => 'Nasi putih',
                'aktif' => true,
            ],
            [
                'nama' => 'Es Batu',
                'satuan_dasar' => 'balok',
                'stok_tersedia' => 10,
                'harga_per_satuan' => 8000,
                'keterangan' => 'Es batu balok',
                'aktif' => true,
            ],
            [
                'nama' => 'Teh',
                'satuan_dasar' => 'kg',
                'stok_tersedia' => 5,
                'harga_per_satuan' => 50000,
                'keterangan' => 'Teh celup',
                'aktif' => true,
            ],
            [
                'nama' => 'Jeruk',
                'satuan_dasar' => 'kg',
                'stok_tersedia' => 8,
                'harga_per_satuan' => 25000,
                'keterangan' => 'Jeruk segar untuk jus',
                'aktif' => true,
            ],
            [
                'nama' => 'Gula',
                'satuan_dasar' => 'kg',
                'stok_tersedia' => 10,
                'harga_per_satuan' => 15000,
                'keterangan' => 'Gula pasir',
                'aktif' => true,
            ],
            [
                'nama' => 'Bumbu Rica-Rica',
                'satuan_dasar' => 'kg',
                'stok_tersedia' => 3,
                'harga_per_satuan' => 35000,
                'keterangan' => 'Bumbu rica-rica siap pakai',
                'aktif' => true,
            ],
            [
                'nama' => 'Minyak Goreng',
                'satuan_dasar' => 'liter',
                'stok_tersedia' => 20,
                'harga_per_satuan' => 18000,
                'keterangan' => 'Minyak goreng curah',
                'aktif' => true,
            ],
        ];

        foreach ($bahanBaku as $bahan) {
            BahanBaku::create($bahan);
        }
    }
}
