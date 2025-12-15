<?php

namespace Database\Seeders;

use App\Models\BahanBaku;
use App\Models\Satuan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BahanBakuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $satuanLookup = Satuan::all()
            ->keyBy(fn ($satuan) => strtolower($satuan->nama));

        $bahanBaku = [
            [
                'nama' => 'Ayam',
                'satuan' => 'Potong',           // Satuan STOK (hasil konversi)
                'base_satuan' => 'Ekor',        // Satuan BELI (bahan mentah)
                'stok_tersedia' => 80,
                'harga_per_satuan' => 45000,
                'keterangan' => 'Ayam kampung segar - Stok dihitung per potong (1 ekor ≈ 8 potong)',
                'aktif' => true,
            ],
            [
                'nama' => 'Nasi',
                'satuan' => 'Porsi',            // Satuan STOK
                'base_satuan' => 'Liter',       // Satuan BELI
                'stok_tersedia' => 120,
                'harga_per_satuan' => 12000,
                'keterangan' => 'Nasi putih - Stok dihitung per porsi (1 liter beras ≈ 10 porsi)',
                'aktif' => true,
            ],
            [
                'nama' => 'Es Batu',
                'satuan' => 'Gelas',            // Satuan STOK
                'base_satuan' => 'Balok',       // Satuan BELI
                'stok_tersedia' => 200,
                'harga_per_satuan' => 8000,
                'keterangan' => 'Es batu siap saji - Stok per gelas (1 balok ≈ 50 gelas)',
                'aktif' => true,
            ],
            [
                'nama' => 'Teh',
                'satuan' => 'Gram',             // Satuan STOK
                'base_satuan' => 'Kilogram',    // Satuan BELI
                'stok_tersedia' => 5000,        // 5000 gram = 5 kg
                'harga_per_satuan' => 50,       // Rp 50 per gram
                'keterangan' => 'Teh celup - Stok dalam gram (1 kg = 1000 gram)',
                'aktif' => true,
            ],
            [
                'nama' => 'Jeruk',
                'satuan' => 'Gram',
                'base_satuan' => 'Kilogram',
                'stok_tersedia' => 10000,       // 10 kg = 10000 gram
                'harga_per_satuan' => 25,       // Rp 25 per gram
                'keterangan' => 'Jeruk segar untuk jus - Stok dalam gram',
                'aktif' => true,
            ],
            [
                'nama' => 'Gula',
                'satuan' => 'Gram',
                'base_satuan' => 'Kilogram',
                'stok_tersedia' => 15000,       // 15 kg
                'harga_per_satuan' => 15,       // Rp 15 per gram
                'keterangan' => 'Gula pasir - Stok dalam gram',
                'aktif' => true,
            ],
            [
                'nama' => 'Bumbu Rica-Rica',
                'satuan' => 'Gram',
                'base_satuan' => 'Kilogram',
                'stok_tersedia' => 3000,        // 3 kg
                'harga_per_satuan' => 35,       // Rp 35 per gram
                'keterangan' => 'Bumbu rica-rica siap pakai - Stok dalam gram',
                'aktif' => true,
            ],
            [
                'nama' => 'Minyak Goreng',
                'satuan' => 'Liter',
                'base_satuan' => null,          // Tidak perlu tracking, langsung liter
                'stok_tersedia' => 20,
                'harga_per_satuan' => 18000,
                'keterangan' => 'Minyak goreng curah',
                'aktif' => true,
            ],
        ];

        foreach ($bahanBaku as $bahan) {
            $satuanId = $satuanLookup[strtolower($bahan['satuan'])]->id ?? null;
            $baseSatuanId = isset($bahan['base_satuan'])
                ? ($satuanLookup[strtolower($bahan['base_satuan'])]->id ?? $satuanId)
                : $satuanId;

            BahanBaku::create([
                'nama' => $bahan['nama'],
                'satuan_dasar' => strtolower($bahan['satuan']),
                'satuan_id' => $satuanId,
                'base_satuan_id' => $baseSatuanId,
                'stok_tersedia' => $bahan['stok_tersedia'],
                'harga_per_satuan' => $bahan['harga_per_satuan'],
                'keterangan' => $bahan['keterangan'] ?? null,
                'aktif' => $bahan['aktif'],
            ]);
        }
    }
}
