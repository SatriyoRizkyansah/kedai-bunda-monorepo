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
