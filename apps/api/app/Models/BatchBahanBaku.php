<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BatchBahanBaku extends Model
{
    use HasFactory;

    protected $table = 'batch_bahan_baku';

    protected $fillable = [
        'bahan_baku_id',
        'stok_log_id',
        'base_jumlah',
        'base_satuan_id',
        'jumlah_awal',
        'jumlah_sisa',
        'keterangan',
    ];

    protected $casts = [
        'base_jumlah' => 'decimal:2',
        'jumlah_awal' => 'decimal:2',
        'jumlah_sisa' => 'decimal:2',
    ];

    // Relationships
    public function bahanBaku()
    {
        return $this->belongsTo(BahanBaku::class, 'bahan_baku_id');
    }

    public function stokLog()
    {
        return $this->belongsTo(StokLog::class, 'stok_log_id');
    }

    public function baseSatuan()
    {
        return $this->belongsTo(Satuan::class, 'base_satuan_id');
    }

    // Check if batch is fully consumed
    public function isFullyConsumed(): bool
    {
        return $this->jumlah_sisa <= 0;
    }

    // Check if batch has enough stock
    public function hasEnoughStock(float $amount): bool
    {
        return $this->jumlah_sisa >= $amount;
    }
}
