<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KomposisiMenu extends Model
{
    protected $table = 'komposisi_menu';

    protected $fillable = [
        'menu_id',
        'konversi_bahan_id',
        'jumlah',
    ];

    protected $casts = [
        'jumlah' => 'decimal:2',
    ];

    // Append virtual attributes untuk backward compatibility
    protected $appends = ['bahan_baku', 'satuan'];

    // Pastikan konversiBahan selalu di-load untuk accessor
    protected $with = ['konversiBahan.bahanBaku', 'konversiBahan.satuan'];

    /**
     * Relasi ke menu
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Relasi ke konversi bahan (include bahan_baku + satuan)
     */
    public function konversiBahan(): BelongsTo
    {
        return $this->belongsTo(KonversiBahan::class);
    }

    /**
     * Helper: akses bahan baku via konversi (backward compatible)
     */
    public function getBahanBakuAttribute()
    {
        return $this->konversiBahan?->bahanBaku;
    }

    /**
     * Helper: akses satuan via konversi (backward compatible)
     */
    public function getSatuanAttribute()
    {
        return $this->konversiBahan?->satuan;
    }
}
