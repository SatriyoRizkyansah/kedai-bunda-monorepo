<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BahanBakuController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\StokLogController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\KonversiBahanController;
use App\Http\Controllers\Api\KomposisiMenuController;
use App\Http\Controllers\Api\SatuanController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Routes untuk API Kedai Bunda
|
*/

// Auth routes (public)
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware(['auth:api'])->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Register user baru (hanya super_admin)
    Route::post('/register', [AuthController::class, 'register'])->middleware('role:super_admin');

    // Dashboard & Laporan (semua yang login bisa akses)
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/laporan/penjualan', [DashboardController::class, 'laporanPenjualan']);
    Route::get('/laporan/stok', [DashboardController::class, 'laporanStok']);
    Route::get('/laporan/stok-log', [DashboardController::class, 'laporanStokLog']);
    Route::get('/laporan/keuntungan', [DashboardController::class, 'laporanKeuntungan']);

    // Master Data Satuan (semua yang login bisa baca)
    Route::get('satuan', [SatuanController::class, 'index']);
    Route::get('satuan/grouped', [SatuanController::class, 'groupedByTipe']);
    Route::get('satuan/{satuan}', [SatuanController::class, 'show']);

    // Bahan Baku (admin dan super_admin)
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::apiResource('bahan-baku', BahanBakuController::class);
        Route::post('bahan-baku/{id}/tambah-stok', [BahanBakuController::class, 'tambahStok']);
        Route::post('bahan-baku/{id}/kurangi-stok', [BahanBakuController::class, 'kurangiStok']);
        Route::get('bahan-baku/{id}/stok-log', [BahanBakuController::class, 'stokLog']);
        Route::get('bahan-baku/{id}/batch-tracking', [BahanBakuController::class, 'batchTracking']);
        
        // Konversi Bahan
        Route::apiResource('konversi-bahan', KonversiBahanController::class);
        
        // Master Data Satuan (CRUD hanya admin)
        Route::post('satuan', [SatuanController::class, 'store']);
        Route::put('satuan/{satuan}', [SatuanController::class, 'update']);
        Route::delete('satuan/{satuan}', [SatuanController::class, 'destroy']);
    });

    // Menu - read access untuk kasir (untuk transaksi)
    Route::get('menu', [MenuController::class, 'index']);
    Route::get('menu/{id}', [MenuController::class, 'show']);
    Route::get('menu/{id}/cek-stok', [MenuController::class, 'cekStok']);
    Route::get('menu/{id}/stok-efektif', [MenuController::class, 'getStokEfektif']);
    
    // Menu - write access hanya untuk admin dan super_admin
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::post('menu', [MenuController::class, 'store']);
        Route::put('menu/{id}', [MenuController::class, 'update']);
        Route::delete('menu/{id}', [MenuController::class, 'destroy']);
        Route::post('menu/{id}/tambah-stok', [MenuController::class, 'tambahStok']);
        Route::post('menu/{id}/kurangi-stok', [MenuController::class, 'kurangiStok']);
        Route::get('menu/{id}/stok-log', [MenuController::class, 'stokLog']);
        
        // Komposisi Menu
        Route::apiResource('komposisi-menu', KomposisiMenuController::class);
        Route::post('komposisi-menu/batch', [KomposisiMenuController::class, 'storeMultiple']);
        Route::delete('komposisi-menu/menu/{menuId}', [KomposisiMenuController::class, 'destroyByMenu']);
    });

    // Transaksi (kasir dan super_admin)
    Route::middleware('role:super_admin,kasir')->group(function () {
        Route::apiResource('transaksi', TransaksiController::class)->except(['update', 'destroy']);
    });
    
    // Cancel transaksi - only admin dan super_admin
    Route::post('transaksi/{id}/batal', [TransaksiController::class, 'batal'])->middleware('role:super_admin,admin');

    // Stok Log / Riwayat Stok
    Route::get('/stok-log', [StokLogController::class, 'index']);
    Route::post('/stok-log/tambah', [StokLogController::class, 'tambahStok'])->middleware('role:super_admin,admin');
    Route::post('/stok-log/kurangi', [StokLogController::class, 'kurangiStok'])->middleware('role:super_admin,admin');

    // User Management (hanya super_admin)
    Route::middleware('role:super_admin')->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // Profile (semua user yang login)
    Route::put('/profil', [UserController::class, 'updateProfil']);
});
