<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailTransaksi extends Model
{
    protected $table = 'detail_transaksi';

    protected $fillable = [
        'transaksi_id',
        'menu_id',
        'jumlah',
        'harga_satuan',
        'hpp_per_unit',
        'subtotal',
        'hpp_total',
    ];

    protected $casts = [
        'harga_satuan' => 'decimal:2',
        'hpp_per_unit' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'hpp_total' => 'decimal:2',
        'jumlah' => 'integer',
    ];

    /**
     * Relasi ke transaksi
     */
    public function transaksi(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class);
    }

    /**
     * Relasi ke menu
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }
}
