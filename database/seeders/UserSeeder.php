<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@kedaibunda.com',
            'password' => Hash::make('superadmin123'),
            'role' => 'super_admin',
            'aktif' => true,
        ]);

        // Admin 1
        User::create([
            'name' => 'Admin Kedai',
            'email' => 'admin@kedaibunda.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'aktif' => true,
        ]);

        // Admin 2
        User::create([
            'name' => 'Admin Kasir',
            'email' => 'admin2@kedaibunda.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'aktif' => true,
        ]);
    }
}
