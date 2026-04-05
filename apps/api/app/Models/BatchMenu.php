<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BatchMenu extends Model
{
    use HasFactory;

    protected $table = 'batch_menu';

    protected $fillable = [
        'menu_id',
        'menu_stok_log_id',
        'jumlah_awal',
        'jumlah_sisa',
        'harga_beli',
        'keterangan',
    ];

    protected $casts = [
        'jumlah_awal' => 'decimal:2',
        'jumlah_sisa' => 'decimal:2',
        'harga_beli' => 'decimal:2',
    ];

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    public function stokLog(): BelongsTo
    {
        return $this->belongsTo(MenuStokLog::class, 'menu_stok_log_id');
    }
}
