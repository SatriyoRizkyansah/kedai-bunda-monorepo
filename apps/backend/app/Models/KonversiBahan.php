<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KonversiBahan extends Model
{
    protected $table = 'konversi_bahan';

    protected $fillable = [
        'bahan_baku_id',
        'satuan_id',
        'jumlah_konversi',
        'keterangan',
    ];

    protected $casts = [
        'jumlah_konversi' => 'decimal:2',
    ];

    /**
     * Relasi ke bahan baku
     */
    public function bahanBaku(): BelongsTo
    {
        return $this->belongsTo(BahanBaku::class);
    }

    /**
     * Relasi ke satuan
     */
    public function satuan(): BelongsTo
    {
        return $this->belongsTo(Satuan::class);
    }
}
