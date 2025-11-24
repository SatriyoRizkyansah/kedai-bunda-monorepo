<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BahanBakuResource;
use App\Models\BahanBaku;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BahanBakuController extends Controller
{
    /**
     * Menampilkan daftar bahan baku
     */
    public function index()
    {
        $bahanBaku = BahanBaku::with('konversi')->get();
        
        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil data bahan baku',
            'data' => BahanBakuResource::collection($bahanBaku)
        ]);
    }

    /**
     * Menyimpan bahan baku baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'satuan_dasar' => 'required|string|max:50',
            'stok_tersedia' => 'required|numeric|min:0',
            'harga_per_satuan' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'aktif' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $bahanBaku = BahanBaku::create($request->all());

        return response()->json([
            'sukses' => true,
            'pesan' => 'Bahan baku berhasil ditambahkan',
            'data' => new BahanBakuResource($bahanBaku)
        ], 201);
    }

    /**
     * Menampilkan detail bahan baku
     */
    public function show($id)
    {
        $bahanBaku = BahanBaku::with('konversi')->find($id);

        if (!$bahanBaku) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Bahan baku tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil detail bahan baku',
            'data' => new BahanBakuResource($bahanBaku)
        ]);
    }

    /**
     * Mengupdate bahan baku
     */
    public function update(Request $request, $id)
    {
        $bahanBaku = BahanBaku::find($id);

        if (!$bahanBaku) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Bahan baku tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama' => 'sometimes|string|max:255',
            'satuan_dasar' => 'sometimes|string|max:50',
            'stok_tersedia' => 'sometimes|numeric|min:0',
            'harga_per_satuan' => 'sometimes|numeric|min:0',
            'keterangan' => 'nullable|string',
            'aktif' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $bahanBaku->update($request->all());

        return response()->json([
            'sukses' => true,
            'pesan' => 'Bahan baku berhasil diupdate',
            'data' => new BahanBakuResource($bahanBaku)
        ]);
    }

    /**
     * Menghapus bahan baku
     */
    public function destroy($id)
    {
        $bahanBaku = BahanBaku::find($id);

        if (!$bahanBaku) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Bahan baku tidak ditemukan'
            ], 404);
        }

        $bahanBaku->delete();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Bahan baku berhasil dihapus'
        ]);
    }
}
