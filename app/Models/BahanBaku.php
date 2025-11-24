<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class BahanBaku extends Model
{
    protected $table = 'bahan_baku';

    protected $fillable = [
        'nama',
        'satuan_dasar',
        'stok_tersedia',
        'harga_per_satuan',
        'keterangan',
        'aktif',
    ];

    protected $casts = [
        'stok_tersedia' => 'decimal:2',
        'harga_per_satuan' => 'decimal:2',
        'aktif' => 'boolean',
    ];

    /**
     * Relasi ke konversi bahan
     */
    public function konversi(): HasMany
    {
        return $this->hasMany(KonversiBahan::class);
    }

    /**
     * Relasi ke komposisi menu
     */
    public function komposisiMenu(): HasMany
    {
        return $this->hasMany(KomposisiMenu::class);
    }

    /**
     * Relasi ke menu melalui komposisi menu
     */
    public function menu(): BelongsToMany
    {
        return $this->belongsToMany(Menu::class, 'komposisi_menu')
            ->withPivot('jumlah', 'satuan')
            ->withTimestamps();
    }

    /**
     * Relasi ke stok log
     */
    public function stokLog(): HasMany
    {
        return $this->hasMany(StokLog::class);
    }
}
