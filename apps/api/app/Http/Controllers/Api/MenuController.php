<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use App\Models\MenuStokLog;
use App\Models\KomposisiMenu;
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
    $query = Menu::with(['komposisiMenu.bahanBaku.satuan', 'komposisiMenu.satuan']);

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
            'gambar' => 'nullable|file|max:2048',
            'deskripsi' => 'nullable|string',
            'tersedia' => 'nullable|in:true,false,1,0',
            'stok' => 'nullable|numeric|min:0',
            'kelola_stok_mandiri' => 'nullable|in:true,false,1,0',
            'satuan_id' => 'nullable|exists:satuan,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        
        // Convert string boolean ke boolean
        if (isset($data['tersedia'])) {
            $data['tersedia'] = in_array($data['tersedia'], ['true', '1', true, 1]);
        } else {
            $data['tersedia'] = true;
        }
        
        if (isset($data['kelola_stok_mandiri'])) {
            $data['kelola_stok_mandiri'] = in_array($data['kelola_stok_mandiri'], ['true', '1', true, 1]);
        } else {
            $data['kelola_stok_mandiri'] = true;
        }
        
        // Handle file upload
        if ($request->hasFile('gambar')) {
            $file = $request->file('gambar');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('menu', $filename, 'public');
            $data['gambar'] = '/storage/menu/' . $filename;
        }

        $menu = Menu::create($data);

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
    $menu = Menu::with(['komposisiMenu.bahanBaku.satuan', 'komposisiMenu.satuan'])->find($id);

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
            'gambar' => 'nullable|file|max:2048',
            'deskripsi' => 'nullable|string',
            'tersedia' => 'nullable|in:true,false,1,0',
            'stok' => 'nullable|numeric|min:0',
            'kelola_stok_mandiri' => 'nullable|in:true,false,1,0',
            'satuan_id' => 'nullable|exists:satuan,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        
        // Convert string boolean ke boolean
        if (isset($data['tersedia'])) {
            $data['tersedia'] = in_array($data['tersedia'], ['true', '1', true, 1]);
        }
        
        if (isset($data['kelola_stok_mandiri'])) {
            $data['kelola_stok_mandiri'] = in_array($data['kelola_stok_mandiri'], ['true', '1', true, 1]);
        }
        
        // Handle file upload - hanya jika ada file baru (frontend hanya kirim jika File object)
        if ($request->hasFile('gambar')) {
            // Hapus file lama jika ada
            if ($menu->gambar) {
                $oldPath = public_path($menu->gambar);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }
            
            $file = $request->file('gambar');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('menu', $filename, 'public');
            $data['gambar'] = '/storage/menu/' . $filename;
        } else {
            // Jangan update gambar jika tidak ada file baru
            unset($data['gambar']);
        }

        // Jika menu diubah dari "Terhubung Bahan Baku" (false) ke "Manual" (true), hapus semua komposisi
        if ($request->has('kelola_stok_mandiri') && 
            $request->kelola_stok_mandiri === true && 
            $menu->kelola_stok_mandiri === false) {
            KomposisiMenu::where('menu_id', $menu->id)->delete();
        }

        $menu->update($data);

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
    $menu = Menu::with(['komposisiMenu.bahanBaku.satuan', 'komposisiMenu.satuan'])->find($id);

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
                if (!$bahanBaku || $komposisi->jumlah <= 0) {
                continue;
            }
            
                $satuan = $komposisi->satuan ?? $bahanBaku->satuan;
                $kebutuhan = (float) $komposisi->jumlah;
                $stokTersedia = (float) $bahanBaku->stok_tersedia;

                if ($stokTersedia < $kebutuhan) {
                $tersedia = false;
                $kekuranganBahan[] = [
                    'bahan' => $bahanBaku->nama,
                        'dibutuhkan' => round($kebutuhan, 2) . ' ' . ($satuan?->nama ?? $bahanBaku->satuan?->nama ?? 'satuan'),
                        'tersedia' => round($stokTersedia, 2) . ' ' . ($satuan?->nama ?? $bahanBaku->satuan?->nama ?? 'satuan'),
                        'satuan' => $satuan?->nama ?? $bahanBaku->satuan?->nama ?? $bahanBaku->satuan_dasar,
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

    /**
     * Tambah stok menu (untuk mode kelola_stok_mandiri = true)
     */
    public function tambahStok(Request $request, $id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Menu tidak ditemukan'
            ], 404);
        }

        if (!$menu->kelola_stok_mandiri) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Menu ini menggunakan stok dari bahan baku, tidak bisa ditambah manual'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'jumlah' => 'required|numeric|min:0.01',
            'keterangan' => 'nullable|string|max:500',
            'harga_beli' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $stokSebelum = $menu->stok;
        $stokSesudah = $stokSebelum + $request->jumlah;

        $menu->update(['stok' => $stokSesudah]);

        $log = MenuStokLog::create([
            'menu_id' => $menu->id,
            'user_id' => $request->user()->id,
            'tipe' => 'masuk',
            'jumlah' => $request->jumlah,
            'harga_beli' => $request->harga_beli,
            'stok_sebelum' => $stokSebelum,
            'stok_sesudah' => $stokSesudah,
            'keterangan' => $request->keterangan,
        ]);

        return response()->json([
            'sukses' => true,
            'pesan' => 'Stok menu berhasil ditambahkan',
            'data' => [
                'menu' => new MenuResource($menu->fresh()),
                'log' => $log,
            ]
        ]);
    }

    /**
     * Kurangi stok menu (untuk mode kelola_stok_mandiri = true)
     */
    public function kurangiStok(Request $request, $id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Menu tidak ditemukan'
            ], 404);
        }

        if (!$menu->kelola_stok_mandiri) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Menu ini menggunakan stok dari bahan baku, tidak bisa dikurangi manual'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'jumlah' => 'required|numeric|min:0.01',
            'keterangan' => 'nullable|string|max:500',
            'harga_beli' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->jumlah > $menu->stok) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Jumlah melebihi stok tersedia'
            ], 422);
        }

        $stokSebelum = $menu->stok;
        $stokSesudah = max(0, $stokSebelum - $request->jumlah);

        $menu->update(['stok' => $stokSesudah]);

        $log = MenuStokLog::create([
            'menu_id' => $menu->id,
            'user_id' => $request->user()->id,
            'tipe' => 'keluar',
            'jumlah' => $request->jumlah,
            'harga_beli' => $request->harga_beli,
            'stok_sebelum' => $stokSebelum,
            'stok_sesudah' => $stokSesudah,
            'keterangan' => $request->keterangan,
        ]);

        return response()->json([
            'sukses' => true,
            'pesan' => 'Stok menu berhasil dikurangi',
            'data' => [
                'menu' => new MenuResource($menu->fresh()),
                'log' => $log,
            ]
        ]);
    }

    /**
     * Get stok log untuk menu tertentu
     */
    public function stokLog($id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Menu tidak ditemukan'
            ], 404);
        }

        $logs = MenuStokLog::where('menu_id', $id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'sukses' => true,
            'data' => $logs
        ]);
    }

    /**
     * Get stok efektif menu (baik manual maupun dari bahan baku)
     */
    public function getStokEfektif($id)
    {
    $menu = Menu::with(['komposisiMenu.bahanBaku.satuan', 'komposisiMenu.satuan', 'satuan'])->find($id);

        if (!$menu) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Menu tidak ditemukan'
            ], 404);
        }

        $stokEfektif = $menu->stok_efektif;
        $mode = $menu->kelola_stok_mandiri ? 'manual' : 'dari_bahan_baku';

        return response()->json([
            'sukses' => true,
            'data' => [
                'menu_id' => $menu->id,
                'nama' => $menu->nama,
                'stok_efektif' => $stokEfektif,
                'mode_stok' => $mode,
                'satuan' => $menu->satuan?->singkatan ?? 'pcs',
            ]
        ]);
    }
}
