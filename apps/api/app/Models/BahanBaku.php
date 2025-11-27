<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class BahanBaku extends Model
{
    protected $table = 'bahan_baku';

    protected $fillable = [
        'nama',
        'satuan_dasar',
        'satuan_id',
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
     * Relasi ke satuan
     */
    public function satuan(): BelongsTo
    {
        return $this->belongsTo(Satuan::class);
    }

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

    /**
     * Tambah stok dengan logging
     */
    public function tambahStok(float $jumlah, int $userId, ?string $keterangan = null, ?string $referensi = null): StokLog
    {
        $stokSebelum = $this->stok_tersedia;
        $stokSesudah = $stokSebelum + $jumlah;

        $this->update(['stok_tersedia' => $stokSesudah]);

        return $this->stokLog()->create([
            'user_id' => $userId,
            'tipe' => 'masuk',
            'jumlah' => $jumlah,
            'stok_sebelum' => $stokSebelum,
            'stok_sesudah' => $stokSesudah,
            'keterangan' => $keterangan,
            'referensi' => $referensi,
        ]);
    }

    /**
     * Kurangi stok dengan logging
     */
    public function kurangiStok(float $jumlah, int $userId, ?string $keterangan = null, ?string $referensi = null): StokLog
    {
        $stokSebelum = $this->stok_tersedia;
        $stokSesudah = max(0, $stokSebelum - $jumlah);

        $this->update(['stok_tersedia' => $stokSesudah]);

        return $this->stokLog()->create([
            'user_id' => $userId,
            'tipe' => 'keluar',
            'jumlah' => $jumlah,
            'stok_sebelum' => $stokSebelum,
            'stok_sesudah' => $stokSesudah,
            'keterangan' => $keterangan,
            'referensi' => $referensi,
        ]);
    }
}
