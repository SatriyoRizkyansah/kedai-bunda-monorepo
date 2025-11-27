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
     * @OA\Get(
     *     path="/api/bahan-baku",
     *     summary="Mendapatkan daftar bahan baku",
     *     tags={"Bahan Baku"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Berhasil mengambil data bahan baku",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Berhasil mengambil data bahan baku"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="nama", type="string", example="Ayam Potong"),
     *                     @OA\Property(property="satuan_dasar", type="string", example="ekor"),
     *                     @OA\Property(property="stok_tersedia", type="number", format="float", example=10.5),
     *                     @OA\Property(property="harga_per_satuan", type="number", format="float", example=35000),
     *                     @OA\Property(property="keterangan", type="string", example="Ayam segar"),
     *                     @OA\Property(property="aktif", type="boolean", example=true)
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        $bahanBaku = BahanBaku::with(['konversi', 'satuan'])->get();
        
        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil data bahan baku',
            'data' => BahanBakuResource::collection($bahanBaku)
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/bahan-baku",
     *     summary="Menambah bahan baku baru",
     *     tags={"Bahan Baku"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nama","satuan_dasar","stok_tersedia","harga_per_satuan"},
     *             @OA\Property(property="nama", type="string", example="Ayam Potong"),
     *             @OA\Property(property="satuan_dasar", type="string", example="ekor"),
     *             @OA\Property(property="stok_tersedia", type="number", format="float", example=10),
     *             @OA\Property(property="harga_per_satuan", type="number", format="float", example=35000),
     *             @OA\Property(property="keterangan", type="string", example="Ayam segar"),
     *             @OA\Property(property="aktif", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Bahan baku berhasil ditambahkan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Bahan baku berhasil ditambahkan")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validasi gagal"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'satuan_id' => 'required|exists:satuan,id',
            'satuan_dasar' => 'nullable|string|max:50', // deprecated, untuk backward compat
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

        // Set satuan_dasar dari satuan untuk backward compatibility
        $data = $request->all();
        if ($request->satuan_id) {
            $satuan = \App\Models\Satuan::find($request->satuan_id);
            if ($satuan) {
                $data['satuan_dasar'] = $satuan->nama;
            }
        }

        $bahanBaku = BahanBaku::create($data);
        $bahanBaku->load('satuan');

        return response()->json([
            'sukses' => true,
            'pesan' => 'Bahan baku berhasil ditambahkan',
            'data' => new BahanBakuResource($bahanBaku)
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/bahan-baku/{id}",
     *     summary="Menampilkan detail bahan baku",
     *     tags={"Bahan Baku"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID Bahan Baku",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detail bahan baku berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Berhasil mengambil detail bahan baku"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="nama", type="string", example="Tepung Terigu"),
     *                 @OA\Property(property="satuan_dasar", type="string", example="kg"),
     *                 @OA\Property(property="stok_tersedia", type="number", format="float", example=50.5),
     *                 @OA\Property(property="harga_per_satuan", type="number", format="float", example=15000),
     *                 @OA\Property(property="keterangan", type="string", example="Tepung terigu protein tinggi"),
     *                 @OA\Property(property="aktif", type="boolean", example=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(
     *                     property="konversi",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="bahan_baku_id", type="integer", example=1),
     *                         @OA\Property(property="satuan_konversi", type="string", example="gram"),
     *                         @OA\Property(property="nilai_konversi", type="number", format="float", example=1000),
     *                         @OA\Property(property="keterangan", type="string", example="1 kg = 1000 gram")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Bahan baku tidak ditemukan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Bahan baku tidak ditemukan")
     *         )
     *     )
     * )
     *
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
     * @OA\Put(
     *     path="/api/bahan-baku/{id}",
     *     summary="Mengupdate bahan baku",
     *     tags={"Bahan Baku"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID Bahan Baku",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         description="Data bahan baku yang ingin diupdate (semua field opsional)",
     *         @OA\JsonContent(
     *             @OA\Property(property="nama", type="string", example="Tepung Terigu Premium"),
     *             @OA\Property(property="satuan_dasar", type="string", example="kg"),
     *             @OA\Property(property="stok_tersedia", type="number", format="float", example=60.5),
     *             @OA\Property(property="harga_per_satuan", type="number", format="float", example=18000),
     *             @OA\Property(property="keterangan", type="string", example="Tepung terigu protein tinggi premium"),
     *             @OA\Property(property="aktif", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Bahan baku berhasil diupdate",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Bahan baku berhasil diupdate"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="nama", type="string", example="Tepung Terigu Premium"),
     *                 @OA\Property(property="satuan_dasar", type="string", example="kg"),
     *                 @OA\Property(property="stok_tersedia", type="number", format="float", example=60.5),
     *                 @OA\Property(property="harga_per_satuan", type="number", format="float", example=18000),
     *                 @OA\Property(property="keterangan", type="string", example="Tepung terigu protein tinggi premium"),
     *                 @OA\Property(property="aktif", type="boolean", example=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Bahan baku tidak ditemukan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Bahan baku tidak ditemukan")
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
            'satuan_id' => 'sometimes|exists:satuan,id',
            'satuan_dasar' => 'sometimes|string|max:50', // deprecated
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

        // Sync satuan_dasar dari satuan jika satuan_id diupdate
        $data = $request->all();
        if ($request->has('satuan_id')) {
            $satuan = \App\Models\Satuan::find($request->satuan_id);
            if ($satuan) {
                $data['satuan_dasar'] = $satuan->nama;
            }
        }

        $bahanBaku->update($data);
        $bahanBaku->load('satuan');

        return response()->json([
            'sukses' => true,
            'pesan' => 'Bahan baku berhasil diupdate',
            'data' => new BahanBakuResource($bahanBaku)
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/bahan-baku/{id}",
     *     summary="Menghapus bahan baku",
     *     tags={"Bahan Baku"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID Bahan Baku",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Bahan baku berhasil dihapus",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Bahan baku berhasil dihapus")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Bahan baku tidak ditemukan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Bahan baku tidak ditemukan")
     *         )
     *     )
     * )
     *
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

    /**
     * Tambah stok bahan baku dengan tracking
     */
    public function tambahStok(Request $request, $id)
    {
        $bahanBaku = BahanBaku::find($id);

        if (!$bahanBaku) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Bahan baku tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'jumlah' => 'required|numeric|min:0.01',
            'keterangan' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $log = $bahanBaku->tambahStok(
            $request->jumlah,
            $request->user()->id,
            $request->keterangan
        );

        return response()->json([
            'sukses' => true,
            'pesan' => 'Stok berhasil ditambahkan',
            'data' => [
                'bahan_baku' => new BahanBakuResource($bahanBaku->fresh()),
                'log' => $log,
            ]
        ]);
    }

    /**
     * Kurangi stok bahan baku dengan tracking
     */
    public function kurangiStok(Request $request, $id)
    {
        $bahanBaku = BahanBaku::find($id);

        if (!$bahanBaku) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Bahan baku tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'jumlah' => 'required|numeric|min:0.01',
            'keterangan' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->jumlah > $bahanBaku->stok_tersedia) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Jumlah melebihi stok tersedia'
            ], 422);
        }

        $log = $bahanBaku->kurangiStok(
            $request->jumlah,
            $request->user()->id,
            $request->keterangan
        );

        return response()->json([
            'sukses' => true,
            'pesan' => 'Stok berhasil dikurangi',
            'data' => [
                'bahan_baku' => new BahanBakuResource($bahanBaku->fresh()),
                'log' => $log,
            ]
        ]);
    }

    /**
     * Get stok log untuk bahan baku tertentu
     */
    public function stokLog($id)
    {
        $bahanBaku = BahanBaku::find($id);

        if (!$bahanBaku) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Bahan baku tidak ditemukan'
            ], 404);
        }

        $logs = $bahanBaku->stokLog()
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'sukses' => true,
            'data' => $logs
        ]);
    }
}
