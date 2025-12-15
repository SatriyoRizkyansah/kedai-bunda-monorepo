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
        'base_satuan_id',
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
     * Relasi ke satuan dasar (bahan mentah)
     */
    public function baseSatuan(): BelongsTo
    {
        return $this->belongsTo(Satuan::class, 'base_satuan_id');
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
     * Relasi ke batch bahan baku (FIFO tracking)
     */
    public function batches(): HasMany
    {
        return $this->hasMany(BatchBahanBaku::class);
    }

    /**
     * Get active (non-consumed) batches ordered by FIFO
     */
    public function activeBatches()
    {
        return $this->hasMany(BatchBahanBaku::class)
            ->where('jumlah_sisa', '>', 0)
            ->orderBy('created_at', 'asc');
    }

    /**
     * Tambah stok dengan logging
     */
    public function tambahStok(
        float $jumlah,
        int $userId,
        ?string $keterangan = null,
        ?string $referensi = null,
        ?float $baseJumlah = null,
        ?int $baseSatuanId = null,
        ?int $konversiBahanId = null
    ): StokLog
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
            'base_jumlah' => $baseJumlah,
            'base_satuan_id' => $baseSatuanId,
            'konversi_bahan_id' => $konversiBahanId,
        ]);
    }

    /**
     * Kurangi stok dengan logging
     */
    public function kurangiStok(
        float $jumlah,
        int $userId,
        ?string $keterangan = null,
        ?string $referensi = null,
        ?float $baseJumlah = null,
        ?int $baseSatuanId = null,
        ?int $konversiBahanId = null
    ): StokLog
    {
        $stokSebelum = $this->stok_tersedia;
        $stokSesudah = max(0, $stokSebelum - $jumlah);

        $this->update(['stok_tersedia' => $stokSesudah]);

        // Apply FIFO batch tracking
        $this->reduceStockFIFO($jumlah);

        return $this->stokLog()->create([
            'user_id' => $userId,
            'tipe' => 'keluar',
            'jumlah' => $jumlah,
            'stok_sebelum' => $stokSebelum,
            'stok_sesudah' => $stokSesudah,
            'keterangan' => $keterangan,
            'referensi' => $referensi,
            'base_jumlah' => $baseJumlah,
            'base_satuan_id' => $baseSatuanId,
            'konversi_bahan_id' => $konversiBahanId,
        ]);
    }

    /**
     * Reduce stock using FIFO method
     */
    private function reduceStockFIFO(float $amount): void
    {
        $remaining = $amount;
        
        // Get active batches ordered by FIFO (oldest first)
        $batches = $this->batches()
            ->where('jumlah_sisa', '>', 0)
            ->orderBy('created_at', 'asc')
            ->get();

        foreach ($batches as $batch) {
            if ($remaining <= 0) {
                break;
            }

            if ($batch->jumlah_sisa >= $remaining) {
                // This batch has enough stock
                $batch->decrement('jumlah_sisa', $remaining);
                $remaining = 0;
            } else {
                // Consume entire batch and move to next
                $remaining -= $batch->jumlah_sisa;
                $batch->update(['jumlah_sisa' => 0]);
            }
        }
    }
}
