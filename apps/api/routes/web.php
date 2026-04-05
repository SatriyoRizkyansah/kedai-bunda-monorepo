<?php

use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return response()->json([
        'app' => 'Kedai Bunda API',
        'version' => '1.0.0',
        'message' => 'API berjalan dengan baik',
        'dokumentasi' => url('/api/documentation')
    ]);
});

Route::get('/api/uploads/menu/{filename}', function ($filename) {
    $path = base_path('laravel/public/uploads/menu/' . $filename);

    if (!file_exists($path)) abort(404);

    return response()->file($path);
});