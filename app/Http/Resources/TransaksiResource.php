<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransaksiResource extends JsonResource
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
            'nomor_transaksi' => $this->nomor_transaksi,
            'user_id' => $this->user_id,
            'kasir' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'nama' => $this->user->name,
                ];
            }),
            'total' => (float) $this->total,
            'bayar' => (float) $this->bayar,
            'kembalian' => (float) $this->kembalian,
            'status' => $this->status,
            'catatan' => $this->catatan,
            'detail' => DetailTransaksiResource::collection($this->whenLoaded('detailTransaksi')),
            'dibuat_pada' => $this->created_at?->format('Y-m-d H:i:s'),
            'diupdate_pada' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
