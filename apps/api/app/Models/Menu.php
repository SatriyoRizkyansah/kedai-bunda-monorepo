<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'stok',
        'kelola_stok_mandiri',
        'satuan_id',
    ];

    protected $casts = [
        'harga_jual' => 'decimal:2',
        'stok' => 'decimal:2',
        'tersedia' => 'boolean',
        'kelola_stok_mandiri' => 'boolean',
    ];

    /**
     * Relasi ke satuan
     */
    public function satuan(): BelongsTo
    {
        return $this->belongsTo(Satuan::class);
    }

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
    public function getBahanBakuViaKomposisiAttribute()
    {
        return $this->komposisiMenu->map(function ($komposisi) {
            return $komposisi->bahanBaku;
        })->filter();
    }

    /**
     * Relasi ke detail transaksi
     */
    public function detailTransaksi(): HasMany
    {
        return $this->hasMany(DetailTransaksi::class);
    }

    /**
     * Relasi ke stok log menu
     */
    public function stokLog(): HasMany
    {
        return $this->hasMany(MenuStokLog::class);
    }

    /**
     * Hitung stok berdasarkan bahan baku (jika tidak kelola mandiri)
     * Menghitung berapa banyak menu yang bisa dibuat berdasarkan stok bahan baku
     */
    public function hitungStokDariBahanBaku(): float
    {
        if ($this->kelola_stok_mandiri) {
            return $this->stok;
        }

        $komposisi = $this->komposisiMenu()->with('bahanBaku')->get();
        
        if ($komposisi->isEmpty()) {
            return 0;
        }

        $stokTerkecil = PHP_FLOAT_MAX;

        foreach ($komposisi as $item) {
            $bahanBaku = $item->bahanBaku;

            if (!$bahanBaku || $item->jumlah <= 0) {
                continue;
            }

            // Hitung berapa menu yang bisa dibuat dari stok bahan baku pada satuan akhir
            $stokTersedia = (float) $bahanBaku->stok_tersedia;
            $kebutuhanPerMenu = (float) $item->jumlah;
            if ($kebutuhanPerMenu <= 0) {
                continue;
            }

            $menuDariBahan = (int) floor($stokTersedia / $kebutuhanPerMenu);
            
            if ($menuDariBahan < $stokTerkecil) {
                $stokTerkecil = $menuDariBahan;
            }
        }

        return $stokTerkecil === PHP_FLOAT_MAX ? 0 : $stokTerkecil;
    }

    /**
     * Get stok efektif (manual atau dari bahan baku)
     */
    public function getStokEfektifAttribute(): float
    {
        return $this->kelola_stok_mandiri ? $this->stok : $this->hitungStokDariBahanBaku();
    }
}
