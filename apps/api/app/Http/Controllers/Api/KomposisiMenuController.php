<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KomposisiMenu;
use App\Models\Menu;
use App\Models\BahanBaku;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KomposisiMenuController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/komposisi-menu",
     *     summary="Menampilkan daftar komposisi menu",
     *     tags={"Komposisi Menu"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="menu_id",
     *         in="query",
     *         description="Filter berdasarkan ID menu",
     *         required=false,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Daftar komposisi menu berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Berhasil mengambil data komposisi menu"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
    *                 @OA\Items(
    *                     @OA\Property(property="id", type="integer", example=1),
    *                     @OA\Property(property="menu_id", type="integer", example=1),
    *                     @OA\Property(property="bahan_baku_id", type="integer", example=1),
    *                     @OA\Property(property="satuan_id", type="integer", nullable=true, example=5),
    *                     @OA\Property(property="jumlah", type="number", format="float", example=1)
    *                 )
     *             )
     *         )
     *     )
     * )
     *
     * Menampilkan daftar komposisi menu
     */
    public function index(Request $request)
    {
    $query = KomposisiMenu::with(['menu', 'bahanBaku.satuan', 'satuan']);

        // Filter berdasarkan menu
        if ($request->has('menu_id')) {
            $query->where('menu_id', $request->menu_id);
        }

        $komposisi = $query->get();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil data komposisi menu',
            'data' => $komposisi
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/komposisi-menu",
     *     summary="Menyimpan komposisi menu baru",
     *     tags={"Komposisi Menu"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Data komposisi menu baru",
    *         @OA\JsonContent(
    *             required={"menu_id", "bahan_baku_id", "jumlah"},
    *             @OA\Property(property="menu_id", type="integer", example=1),
    *             @OA\Property(property="bahan_baku_id", type="integer", example=5),
    *             @OA\Property(property="satuan_id", type="integer", nullable=true, example=8),
    *             @OA\Property(property="jumlah", type="number", format="float", example=1)
    *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Komposisi menu berhasil ditambahkan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Komposisi menu berhasil ditambahkan"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bahan sudah ada di komposisi",
    *         @OA\JsonContent(
    *             @OA\Property(property="sukses", type="boolean", example=false),
    *             @OA\Property(property="pesan", type="string", example="Bahan baku ini sudah ada di komposisi menu")
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
     * Menyimpan komposisi menu baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'menu_id' => 'required|exists:menu,id',
            'bahan_baku_id' => 'required|exists:bahan_baku,id',
            'jumlah' => 'required|numeric|min:0.01',
            'satuan_id' => 'nullable|exists:satuan,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check apakah menu adalah mode "Terhubung Bahan Baku" (kelola_stok_mandiri = false)
        $menu = Menu::find($request->menu_id);
        if ($menu && $menu->kelola_stok_mandiri) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Komposisi hanya dapat ditambahkan untuk menu yang mode "Terhubung Bahan Baku". Menu ini dalam mode stok manual.'
            ], 400);
        }

        $existing = KomposisiMenu::where('menu_id', $request->menu_id)
            ->where('bahan_baku_id', $request->bahan_baku_id)
            ->first();

        if ($existing) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Bahan baku ini sudah ada di komposisi menu'
            ], 400);
        }

        $bahanBaku = BahanBaku::with('satuan')->find($request->bahan_baku_id);
        $satuanId = $request->satuan_id ?? $bahanBaku?->satuan_id;

        if (!$satuanId) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Bahan baku belum memiliki satuan stok, mohon lengkapi data bahan terlebih dahulu'
            ], 422);
        }

        $komposisi = KomposisiMenu::create([
            'menu_id' => $request->menu_id,
            'bahan_baku_id' => $request->bahan_baku_id,
            'satuan_id' => $satuanId,
            'jumlah' => $request->jumlah,
        ]);

        return response()->json([
            'sukses' => true,
            'pesan' => 'Komposisi menu berhasil ditambahkan',
            'data' => $komposisi->load(['menu', 'bahanBaku.satuan', 'satuan'])
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/komposisi-menu/multiple",
     *     summary="Menyimpan multiple komposisi sekaligus untuk menu",
     *     tags={"Komposisi Menu"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Data multiple komposisi menu",
     *         @OA\JsonContent(
     *             required={"menu_id", "komposisi"},
     *             @OA\Property(property="menu_id", type="integer", example=1),
     *             @OA\Property(
     *                 property="komposisi",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="konversi_bahan_id", type="integer", example=1),
     *                     @OA\Property(property="jumlah", type="number", format="float", example=0.2)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Komposisi menu berhasil disimpan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Komposisi menu berhasil disimpan"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="menu", type="object"),
     *                 @OA\Property(property="komposisi", type="array", @OA\Items(type="object"))
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
     * Menyimpan multiple komposisi sekaligus untuk menu
     */
    public function storeMultiple(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'menu_id' => 'required|exists:menu,id',
            'komposisi' => 'required|array|min:1',
            'komposisi.*.bahan_baku_id' => 'required|exists:bahan_baku,id',
            'komposisi.*.jumlah' => 'required|numeric|min:0.01',
            'komposisi.*.satuan_id' => 'nullable|exists:satuan,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check apakah menu adalah mode "Terhubung Bahan Baku" (kelola_stok_mandiri = false)
        $menu = Menu::find($request->menu_id);
        if ($menu && $menu->kelola_stok_mandiri) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Komposisi hanya dapat ditambahkan untuk menu yang mode "Terhubung Bahan Baku". Menu ini dalam mode stok manual.'
            ], 400);
        }

        $komposisiList = [];

        foreach ($request->komposisi as $item) {
            $bahanId = $item['bahan_baku_id'];
            $bahan = BahanBaku::with('satuan')->find($bahanId);
            $satuanId = $item['satuan_id'] ?? $bahan?->satuan_id;

            if (!$satuanId) {
                return response()->json([
                    'sukses' => false,
                    'pesan' => 'Bahan baku belum memiliki satuan stok, mohon lengkapi data bahan terlebih dahulu'
                ], 422);
            }

            $komposisi = KomposisiMenu::updateOrCreate(
                [
                    'menu_id' => $request->menu_id,
                    'bahan_baku_id' => $bahanId
                ],
                [
                    'satuan_id' => $satuanId,
                    'jumlah' => $item['jumlah'],
                ]
            );

            $komposisiList[] = $komposisi->load(['bahanBaku.satuan', 'satuan']);
        }

        return response()->json([
            'sukses' => true,
            'pesan' => 'Komposisi menu berhasil disimpan',
            'data' => [
                'menu' => $menu,
                'komposisi' => $komposisiList
            ]
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/komposisi-menu/{id}",
     *     summary="Menampilkan detail komposisi menu",
     *     tags={"Komposisi Menu"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID Komposisi Menu",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detail komposisi menu berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Berhasil mengambil detail komposisi menu"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Komposisi menu tidak ditemukan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Komposisi menu tidak ditemukan")
     *         )
     *     )
     * )
     *
     * Menampilkan detail komposisi menu
     */
    public function show($id)
    {
    $komposisi = KomposisiMenu::with(['menu', 'bahanBaku.satuan', 'satuan'])->find($id);

        if (!$komposisi) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Komposisi menu tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil detail komposisi menu',
            'data' => $komposisi
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/komposisi-menu/{id}",
     *     summary="Mengupdate komposisi menu",
     *     tags={"Komposisi Menu"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID Komposisi Menu",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         description="Data komposisi menu yang ingin diupdate",
     *         @OA\JsonContent(
     *             @OA\Property(property="konversi_bahan_id", type="integer", example=1),
     *             @OA\Property(property="jumlah", type="number", format="float", example=0.3)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Komposisi menu berhasil diupdate",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Komposisi menu berhasil diupdate"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Komposisi menu tidak ditemukan"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validasi gagal"
     *     )
     * )
     *
     * Mengupdate komposisi menu
     */
    public function update(Request $request, $id)
    {
        $komposisi = KomposisiMenu::find($id);

        if (!$komposisi) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Komposisi menu tidak ditemukan'
            ], 404);
        }

        // Check apakah menu adalah mode "Terhubung Bahan Baku" (kelola_stok_mandiri = false)
        $menu = Menu::find($komposisi->menu_id);
        if ($menu && $menu->kelola_stok_mandiri) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Tidak dapat mengubah komposisi untuk menu yang mode stok manual.'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'bahan_baku_id' => 'sometimes|exists:bahan_baku,id',
            'satuan_id' => 'sometimes|nullable|exists:satuan,id',
            'jumlah' => 'sometimes|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        if ($request->has('bahan_baku_id')) {
            $duplicate = KomposisiMenu::where('menu_id', $komposisi->menu_id)
                ->where('bahan_baku_id', $request->bahan_baku_id)
                ->where('id', '!=', $komposisi->id)
                ->exists();

            if ($duplicate) {
                return response()->json([
                    'sukses' => false,
                    'pesan' => 'Bahan baku ini sudah ada di komposisi menu'
                ], 400);
            }

            $bahan = BahanBaku::with('satuan')->find($request->bahan_baku_id);
            if (!$bahan) {
                return response()->json([
                    'sukses' => false,
                    'pesan' => 'Bahan baku tidak ditemukan'
                ], 404);
            }

            if (!$request->filled('satuan_id') && $bahan->satuan_id) {
                $data['satuan_id'] = $bahan->satuan_id;
            }
        }

        $komposisi->update($data);

        return response()->json([
            'sukses' => true,
            'pesan' => 'Komposisi menu berhasil diupdate',
            'data' => $komposisi->load(['menu', 'bahanBaku.satuan', 'satuan'])
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/komposisi-menu/{id}",
     *     summary="Menghapus komposisi menu",
     *     tags={"Komposisi Menu"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID Komposisi Menu",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Komposisi menu berhasil dihapus",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Komposisi menu berhasil dihapus")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Komposisi menu tidak ditemukan"
     *     )
     * )
     *
     * Menghapus komposisi menu
     */
    public function destroy($id)
    {
        $komposisi = KomposisiMenu::find($id);

        if (!$komposisi) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Komposisi menu tidak ditemukan'
            ], 404);
        }

        $komposisi->delete();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Komposisi menu berhasil dihapus'
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/komposisi-menu/menu/{menuId}",
     *     summary="Menghapus semua komposisi untuk menu tertentu",
     *     tags={"Komposisi Menu"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="menuId",
     *         in="path",
     *         description="ID Menu",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Semua komposisi menu berhasil dihapus",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Semua komposisi menu berhasil dihapus")
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
     * Menghapus semua komposisi untuk menu tertentu
     */
    public function destroyByMenu($menuId)
    {
        $menu = Menu::find($menuId);

        if (!$menu) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Menu tidak ditemukan'
            ], 404);
        }

        KomposisiMenu::where('menu_id', $menuId)->delete();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Semua komposisi menu berhasil dihapus'
        ]);
    }
}
