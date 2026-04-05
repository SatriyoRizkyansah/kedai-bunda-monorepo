<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DetailTransaksiResource extends JsonResource
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
            'transaksi_id' => $this->transaksi_id,
            'menu_id' => $this->menu_id,
            'menu' => $this->whenLoaded('menu', function () {
                return [
                    'id' => $this->menu->id,
                    'nama' => $this->menu->nama,
                    'kategori' => $this->menu->kategori,
                ];
            }),
            'jumlah' => $this->jumlah,
            'harga' => (float) $this->harga_satuan,
            'subtotal' => (float) $this->subtotal,
            'hpp_per_unit' => $this->hpp_per_unit !== null ? (float) $this->hpp_per_unit : null,
            'hpp_total' => $this->hpp_total !== null ? (float) $this->hpp_total : null,
        ];
    }
}
