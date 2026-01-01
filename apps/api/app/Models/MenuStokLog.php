<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuStokLog extends Model
{
    protected $table = 'menu_stok_log';

    protected $fillable = [
        'menu_id',
        'user_id',
        'tipe',
        'jumlah',
        'harga_beli',
        'stok_sebelum',
        'stok_sesudah',
        'referensi',
        'keterangan',
    ];

    protected $casts = [
        'jumlah' => 'decimal:2',
        'harga_beli' => 'decimal:2',
        'stok_sebelum' => 'decimal:2',
        'stok_sesudah' => 'decimal:2',
    ];

    /**
     * Relasi ke menu
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Relasi ke user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope untuk tipe masuk
     */
    public function scopeMasuk($query)
    {
        return $query->where('tipe', 'masuk');
    }

    /**
     * Scope untuk tipe keluar
     */
    public function scopeKeluar($query)
    {
        return $query->where('tipe', 'keluar');
    }
}
