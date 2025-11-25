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
     * @OA\Get(
     *     path="/api/menu",
     *     summary="Menampilkan daftar menu",
     *     tags={"Menu"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="kategori",
     *         in="query",
     *         description="Filter berdasarkan kategori (makanan/minuman)",
     *         required=false,
     *         @OA\Schema(type="string", enum={"makanan", "minuman"}, example="makanan")
     *     ),
     *     @OA\Parameter(
     *         name="tersedia",
     *         in="query",
     *         description="Filter menu yang tersedia (1/0)",
     *         required=false,
     *         @OA\Schema(type="integer", enum={0, 1}, example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Daftar menu berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Berhasil mengambil data menu"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="nama", type="string", example="Nasi Goreng"),
     *                     @OA\Property(property="kategori", type="string", example="makanan"),
     *                     @OA\Property(property="harga_jual", type="number", format="float", example=25000),
     *                     @OA\Property(property="gambar", type="string", example="nasi-goreng.jpg"),
     *                     @OA\Property(property="deskripsi", type="string", example="Nasi goreng spesial dengan telur"),
     *                     @OA\Property(property="tersedia", type="boolean", example=true),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time")
     *                 )
     *             )
     *         )
     *     )
     * )
     *
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
     * @OA\Post(
     *     path="/api/menu",
     *     summary="Menyimpan menu baru",
     *     tags={"Menu"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Data menu baru",
     *         @OA\JsonContent(
     *             required={"nama", "kategori", "harga_jual"},
     *             @OA\Property(property="nama", type="string", example="Nasi Goreng"),
     *             @OA\Property(property="kategori", type="string", enum={"makanan", "minuman"}, example="makanan"),
     *             @OA\Property(property="harga_jual", type="number", format="float", example=25000),
     *             @OA\Property(property="gambar", type="string", example="nasi-goreng.jpg"),
     *             @OA\Property(property="deskripsi", type="string", example="Nasi goreng spesial dengan telur"),
     *             @OA\Property(property="tersedia", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Menu berhasil ditambahkan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Menu berhasil ditambahkan"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="nama", type="string", example="Nasi Goreng"),
     *                 @OA\Property(property="kategori", type="string", example="makanan"),
     *                 @OA\Property(property="harga_jual", type="number", format="float", example=25000)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validasi gagal",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Validasi gagal"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     *
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
     * @OA\Get(
     *     path="/api/menu/{id}",
     *     summary="Menampilkan detail menu",
     *     tags={"Menu"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID Menu",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detail menu berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Berhasil mengambil detail menu"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="nama", type="string", example="Nasi Goreng"),
     *                 @OA\Property(property="kategori", type="string", example="makanan"),
     *                 @OA\Property(property="harga_jual", type="number", format="float", example=25000),
     *                 @OA\Property(property="gambar", type="string", example="nasi-goreng.jpg"),
     *                 @OA\Property(property="deskripsi", type="string", example="Nasi goreng spesial"),
     *                 @OA\Property(property="tersedia", type="boolean", example=true),
     *                 @OA\Property(
     *                     property="komposisi_menu",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="menu_id", type="integer", example=1),
     *                         @OA\Property(property="bahan_baku_id", type="integer", example=1),
     *                         @OA\Property(property="jumlah", type="number", format="float", example=0.2),
     *                         @OA\Property(property="satuan", type="string", example="kg")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Menu tidak ditemukan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Menu tidak ditemukan")
     *         )
     *     )
     * )
     *
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
     * @OA\Put(
     *     path="/api/menu/{id}",
     *     summary="Mengupdate menu",
     *     tags={"Menu"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID Menu",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         description="Data menu yang ingin diupdate (semua field opsional)",
     *         @OA\JsonContent(
     *             @OA\Property(property="nama", type="string", example="Nasi Goreng Spesial"),
     *             @OA\Property(property="kategori", type="string", enum={"makanan", "minuman"}, example="makanan"),
     *             @OA\Property(property="harga_jual", type="number", format="float", example=28000),
     *             @OA\Property(property="gambar", type="string", example="nasi-goreng-spesial.jpg"),
     *             @OA\Property(property="deskripsi", type="string", example="Nasi goreng spesial dengan seafood"),
     *             @OA\Property(property="tersedia", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Menu berhasil diupdate",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Menu berhasil diupdate"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Menu tidak ditemukan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Menu tidak ditemukan")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validasi gagal",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Validasi gagal"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     *
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
     * @OA\Delete(
     *     path="/api/menu/{id}",
     *     summary="Menghapus menu",
     *     tags={"Menu"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID Menu",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Menu berhasil dihapus",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Menu berhasil dihapus")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Menu tidak ditemukan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Menu tidak ditemukan")
     *         )
     *     )
     * )
     *
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
     * @OA\Get(
     *     path="/api/menu/{id}/cek-stok",
     *     summary="Cek ketersediaan stok untuk menu",
     *     tags={"Menu"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID Menu",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Hasil pengecekan stok",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="tersedia", type="boolean", example=false),
     *             @OA\Property(property="menu", type="string", example="Nasi Goreng"),
     *             @OA\Property(
     *                 property="kekurangan_bahan",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="bahan", type="string", example="Beras"),
     *                     @OA\Property(property="dibutuhkan", type="number", format="float", example=0.5),
     *                     @OA\Property(property="tersedia", type="number", format="float", example=0.3),
     *                     @OA\Property(property="satuan", type="string", example="kg")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Menu tidak ditemukan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Menu tidak ditemukan")
     *         )
     *     )
     * )
     *
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
