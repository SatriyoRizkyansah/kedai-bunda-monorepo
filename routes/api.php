<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BahanBakuController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\TransaksiController;
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
    Route::post('/refresh', [AuthController::class, 'refresh']);
    
    // Register user baru (hanya super_admin)
    Route::post('/register', [AuthController::class, 'register'])->middleware('role:super_admin');

    // Bahan Baku (admin dan super_admin)
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::apiResource('bahan-baku', BahanBakuController::class);
    });

    // Menu (admin dan super_admin)
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::apiResource('menu', MenuController::class);
        Route::get('menu/{id}/cek-stok', [MenuController::class, 'cekStok']);
    });

    // Transaksi (semua role bisa akses)
    Route::apiResource('transaksi', TransaksiController::class)->except(['update', 'destroy']);
    Route::post('transaksi/{id}/batal', [TransaksiController::class, 'batal'])->middleware('role:super_admin,admin');
});
