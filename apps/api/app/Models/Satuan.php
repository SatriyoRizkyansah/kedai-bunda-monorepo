<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Satuan extends Model
{
    protected $table = 'satuan';

    protected $fillable = [
        'nama',
        'singkatan',
        'tipe',
        'satuan_dasar',
        'faktor_konversi',
        'is_satuan_dasar',
        'aktif',
    ];

    protected $casts = [
        'faktor_konversi' => 'decimal:6',
        'is_satuan_dasar' => 'boolean',
        'aktif' => 'boolean',
    ];

    /**
     * Relasi ke bahan baku
     */
    public function bahanBaku(): HasMany
    {
        return $this->hasMany(BahanBaku::class);
    }

    /**
     * Relasi ke menu
     */
    public function menu(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    /**
     * Konversi nilai ke satuan dasar
     */
    public function konversiKeSatuanDasar(float $nilai): float
    {
        return $nilai * $this->faktor_konversi;
    }

    /**
     * Konversi dari satuan dasar ke satuan ini
     */
    public function konversiDariSatuanDasar(float $nilai): float
    {
        if ($this->faktor_konversi == 0) {
            return 0;
        }
        return $nilai / $this->faktor_konversi;
    }

    /**
     * Scope untuk mendapatkan satuan aktif
     */
    public function scopeAktif($query)
    {
        return $query->where('aktif', true);
    }

    /**
     * Scope berdasarkan tipe
     */
    public function scopeTipe($query, string $tipe)
    {
        return $query->where('tipe', $tipe);
    }

    /**
     * Scope untuk satuan dasar saja
     */
    public function scopeSatuanDasar($query)
    {
        return $query->where('is_satuan_dasar', true);
    }
}
