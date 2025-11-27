<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SatuanSeeder::class, // Harus pertama karena menjadi referensi
            UserSeeder::class,
            BahanBakuSeeder::class,
            KonversiBahanSeeder::class,
            MenuSeeder::class,
            KomposisiMenuSeeder::class,
        ]);
    }
}
