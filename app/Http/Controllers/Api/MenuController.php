<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MenuController extends Controller
{
    /**
     * Menampilkan daftar menu
     */
    public function index(Request $request)
    {
        $query = Menu::with(['komposisiMenu.bahanBaku']);

        // Filter berdasarkan kategori
        if ($request->has('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        // Filter menu yang tersedia
        if ($request->has('tersedia')) {
            $query->where('tersedia', $request->tersedia);
        }

        $menu = $query->get();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil data menu',
            'data' => MenuResource::collection($menu)
        ]);
    }

    /**
     * Menyimpan menu baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'kategori' => 'required|in:makanan,minuman',
            'harga_jual' => 'required|numeric|min:0',
            'gambar' => 'nullable|string',
            'deskripsi' => 'nullable|string',
            'tersedia' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $menu = Menu::create($request->all());

        return response()->json([
            'sukses' => true,
            'pesan' => 'Menu berhasil ditambahkan',
            'data' => new MenuResource($menu)
        ], 201);
    }

    /**
     * Menampilkan detail menu
     */
    public function show($id)
    {
        $menu = Menu::with(['komposisiMenu.bahanBaku'])->find($id);

        if (!$menu) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Menu tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil detail menu',
            'data' => new MenuResource($menu)
        ]);
    }

    /**
     * Mengupdate menu
     */
    public function update(Request $request, $id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Menu tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama' => 'sometimes|string|max:255',
            'kategori' => 'sometimes|in:makanan,minuman',
            'harga_jual' => 'sometimes|numeric|min:0',
            'gambar' => 'nullable|string',
            'deskripsi' => 'nullable|string',
            'tersedia' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $menu->update($request->all());

        return response()->json([
            'sukses' => true,
            'pesan' => 'Menu berhasil diupdate',
            'data' => new MenuResource($menu)
        ]);
    }

    /**
     * Menghapus menu
     */
    public function destroy($id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Menu tidak ditemukan'
            ], 404);
        }

        $menu->delete();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Menu berhasil dihapus'
        ]);
    }

    /**
     * Cek ketersediaan stok untuk menu
     */
    public function cekStok($id)
    {
        $menu = Menu::with(['komposisiMenu.bahanBaku'])->find($id);

        if (!$menu) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Menu tidak ditemukan'
            ], 404);
        }

        $tersedia = true;
        $kekuranganBahan = [];

        foreach ($menu->komposisiMenu as $komposisi) {
            $bahanBaku = $komposisi->bahanBaku;
            
            if ($bahanBaku->stok_tersedia < $komposisi->jumlah) {
                $tersedia = false;
                $kekuranganBahan[] = [
                    'bahan' => $bahanBaku->nama,
                    'dibutuhkan' => $komposisi->jumlah,
                    'tersedia' => $bahanBaku->stok_tersedia,
                    'satuan' => $komposisi->satuan
                ];
            }
        }

        return response()->json([
            'sukses' => true,
            'tersedia' => $tersedia,
            'menu' => $menu->nama,
            'kekurangan_bahan' => $kekuranganBahan
        ]);
    }
}
