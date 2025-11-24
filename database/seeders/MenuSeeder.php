<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menu = [
            [
                'nama' => 'Ayam Goreng',
                'kategori' => 'makanan',
                'harga_jual' => 15000,
                'deskripsi' => 'Ayam goreng renyah dan gurih',
                'tersedia' => true,
            ],
            [
                'nama' => 'Ayam Rica-Rica',
                'kategori' => 'makanan',
                'harga_jual' => 18000,
                'deskripsi' => 'Ayam dengan bumbu rica-rica pedas',
                'tersedia' => true,
            ],
            [
                'nama' => 'Nasi Ayam Goreng',
                'kategori' => 'makanan',
                'harga_jual' => 20000,
                'deskripsi' => 'Nasi dengan ayam goreng',
                'tersedia' => true,
            ],
            [
                'nama' => 'Nasi Ayam Rica-Rica',
                'kategori' => 'makanan',
                'harga_jual' => 23000,
                'deskripsi' => 'Nasi dengan ayam rica-rica',
                'tersedia' => true,
            ],
            [
                'nama' => 'Nasi Putih',
                'kategori' => 'makanan',
                'harga_jual' => 5000,
                'deskripsi' => 'Nasi putih hangat',
                'tersedia' => true,
            ],
            [
                'nama' => 'Es Teh Manis',
                'kategori' => 'minuman',
                'harga_jual' => 3000,
                'deskripsi' => 'Es teh manis segar',
                'tersedia' => true,
            ],
            [
                'nama' => 'Es Jeruk',
                'kategori' => 'minuman',
                'harga_jual' => 5000,
                'deskripsi' => 'Es jeruk segar asli',
                'tersedia' => true,
            ],
            [
                'nama' => 'Teh Hangat',
                'kategori' => 'minuman',
                'harga_jual' => 2000,
                'deskripsi' => 'Teh hangat manis',
                'tersedia' => true,
            ],
        ];

        foreach ($menu as $item) {
            Menu::create($item);
        }
    }
}
