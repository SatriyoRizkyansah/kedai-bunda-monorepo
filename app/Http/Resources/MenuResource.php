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
            'komposisi' => $this->whenLoaded('komposisiMenu'),
            'bahan_baku' => $this->whenLoaded('bahanBaku'),
            'dibuat_pada' => $this->created_at?->format('Y-m-d H:i:s'),
            'diupdate_pada' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
