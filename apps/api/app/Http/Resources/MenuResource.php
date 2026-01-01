<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'kategori' => $this->kategori,
            'harga_jual' => (float) $this->harga_jual,
            'gambar' => $this->gambar,
            'deskripsi' => $this->deskripsi,
            'tersedia' => $this->tersedia,
            'stok' => (float) $this->stok,
            'kelola_stok_mandiri' => $this->kelola_stok_mandiri,
            'satuan_id' => $this->satuan_id,
            'satuan' => $this->whenLoaded('satuan'),
            'stok_efektif' => $this->stok_efektif,
            'komposisi' => $this->whenLoaded('komposisiMenu', function () {
                return $this->komposisiMenu->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'menu_id' => $item->menu_id,
                        'bahan_baku_id' => $item->bahan_baku_id,
                        'satuan_id' => $item->satuan_id,
                        'jumlah' => (float) $item->jumlah,
                        'bahan_baku' => $item->bahanBaku ? [
                            'id' => $item->bahanBaku->id,
                            'nama' => $item->bahanBaku->nama,
                            'satuan' => $item->bahanBaku->satuan?->only(['id', 'nama', 'singkatan']),
                        ] : null,
                        'satuan' => $item->satuan ? [
                            'id' => $item->satuan->id,
                            'nama' => $item->satuan->nama,
                            'singkatan' => $item->satuan->singkatan,
                        ] : null,
                    ];
                });
            }),
            'dibuat_pada' => $this->created_at?->format('Y-m-d H:i:s'),
            'diupdate_pada' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
