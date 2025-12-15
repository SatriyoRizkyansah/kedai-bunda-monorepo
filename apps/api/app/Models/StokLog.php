<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StokLog extends Model
{
    protected $table = 'stok_log';

    protected $fillable = [
        'bahan_baku_id',
        'user_id',
        'tipe',
        'jumlah',
        'base_satuan_id',
        'base_jumlah',
        'stok_sebelum',
        'stok_sesudah',
        'referensi',
        'keterangan',
        'konversi_bahan_id',
    ];

    protected $casts = [
        'jumlah' => 'decimal:2',
        'base_jumlah' => 'decimal:2',
        'stok_sebelum' => 'decimal:2',
        'stok_sesudah' => 'decimal:2',
    ];

    /**
     * Relasi ke bahan baku
     */
    public function bahanBaku(): BelongsTo
    {
        return $this->belongsTo(BahanBaku::class);
    }

    /**
     * Relasi ke user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke satuan dasar yang dipakai saat log dibuat.
     */
    public function baseSatuan(): BelongsTo
    {
        return $this->belongsTo(Satuan::class, 'base_satuan_id');
    }

    /**
     * Relasi ke template konversi (jika ada) yang digunakan saat log dibuat.
     */
    public function konversiBahan(): BelongsTo
    {
        return $this->belongsTo(KonversiBahan::class);
    }
}
