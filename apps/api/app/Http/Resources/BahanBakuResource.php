<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BahanBakuResource extends JsonResource
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
            'satuan_id' => $this->satuan_id,
            'base_satuan_id' => $this->base_satuan_id,
            'satuan_dasar' => $this->baseSatuan?->nama ?? $this->satuan_dasar, // backward compat
            'satuan' => $this->whenLoaded('satuan', function() {
                return [
                    'id' => $this->satuan->id,
                    'nama' => $this->satuan->nama,
                    'singkatan' => $this->satuan->singkatan,
                ];
            }),
            'base_satuan' => $this->whenLoaded('baseSatuan', function () {
                return [
                    'id' => $this->baseSatuan->id,
                    'nama' => $this->baseSatuan->nama,
                    'singkatan' => $this->baseSatuan->singkatan,
                ];
            }),
            'stok_tersedia' => (float) $this->stok_tersedia,
            'harga_per_satuan' => (float) $this->harga_per_satuan,
            'keterangan' => $this->keterangan,
            'aktif' => $this->aktif,
            'konversi' => $this->whenLoaded('konversi'),
            'dibuat_pada' => $this->created_at?->format('Y-m-d H:i:s'),
            'diupdate_pada' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
