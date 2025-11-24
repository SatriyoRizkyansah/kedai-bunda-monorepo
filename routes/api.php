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
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Bahan Baku
    Route::apiResource('bahan-baku', BahanBakuController::class);

    // Menu
    Route::apiResource('menu', MenuController::class);
    Route::get('menu/{id}/cek-stok', [MenuController::class, 'cekStok']);

    // Transaksi
    Route::apiResource('transaksi', TransaksiController::class)->except(['update', 'destroy']);
    Route::post('transaksi/{id}/batal', [TransaksiController::class, 'batal']);
});
