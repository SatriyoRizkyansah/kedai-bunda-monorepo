<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Menu extends Model
{
    protected $table = 'menu';

    protected $fillable = [
        'nama',
        'kategori',
        'harga_jual',
        'gambar',
        'deskripsi',
        'tersedia',
    ];

    protected $casts = [
        'harga_jual' => 'decimal:2',
        'tersedia' => 'boolean',
    ];

    /**
     * Relasi ke komposisi menu
     */
    public function komposisiMenu(): HasMany
    {
        return $this->hasMany(KomposisiMenu::class);
    }

    /**
     * Relasi ke bahan baku melalui komposisi menu
     */
    public function bahanBaku(): BelongsToMany
    {
        return $this->belongsToMany(BahanBaku::class, 'komposisi_menu')
            ->withPivot('jumlah', 'satuan')
            ->withTimestamps();
    }

    /**
     * Relasi ke detail transaksi
     */
    public function detailTransaksi(): HasMany
    {
        return $this->hasMany(DetailTransaksi::class);
    }
}
