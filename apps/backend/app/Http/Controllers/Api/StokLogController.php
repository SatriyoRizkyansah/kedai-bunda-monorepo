<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StokLog;
use App\Models\BahanBaku;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StokLogController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/stok-log",
     *     summary="Menampilkan riwayat stok",
     *     tags={"Stok Log"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="bahan_baku_id",
     *         in="query",
     *         description="Filter berdasarkan ID bahan baku",
     *         required=false,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Parameter(
     *         name="tipe",
     *         in="query",
     *         description="Filter berdasarkan tipe (masuk/keluar)",
     *         required=false,
     *         @OA\Schema(type="string", enum={"masuk", "keluar"}, example="masuk")
     *     ),
     *     @OA\Parameter(
     *         name="tanggal_mulai",
     *         in="query",
     *         description="Filter tanggal mulai (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date", example="2025-01-01")
     *     ),
     *     @OA\Parameter(
     *         name="tanggal_selesai",
     *         in="query",
     *         description="Filter tanggal selesai (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date", example="2025-01-31")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Riwayat stok berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Berhasil mengambil riwayat stok"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="bahan_baku_id", type="integer", example=1),
     *                     @OA\Property(property="user_id", type="integer", example=1),
     *                     @OA\Property(property="tipe", type="string", example="masuk"),
     *                     @OA\Property(property="jumlah", type="number", format="float", example=10.5),
     *                     @OA\Property(property="stok_sebelum", type="number", format="float", example=20.0),
     *                     @OA\Property(property="stok_sesudah", type="number", format="float", example=30.5),
     *                     @OA\Property(property="referensi", type="string", example="RESTOK-20250125120000"),
     *                     @OA\Property(property="keterangan", type="string", example="Penambahan stok manual"),
     *                     @OA\Property(property="created_at", type="string", format="date-time")
     *                 )
     *             )
     *         )
     *     )
     * )
     *
     * Menampilkan riwayat stok
     */
    public function index(Request $request)
    {
        $query = StokLog::with(['bahanBaku', 'user']);

        // Filter berdasarkan bahan baku
        if ($request->has('bahan_baku_id')) {
            $query->where('bahan_baku_id', $request->bahan_baku_id);
        }

        // Filter berdasarkan tipe
        if ($request->has('tipe')) {
            $query->where('tipe', $request->tipe);
        }

        // Filter berdasarkan tanggal
        if ($request->has('tanggal_mulai') && $request->has('tanggal_selesai')) {
            $query->whereBetween('created_at', [
                $request->tanggal_mulai . ' 00:00:00',
                $request->tanggal_selesai . ' 23:59:59'
            ]);
        }

        $stokLog = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil riwayat stok',
            'data' => $stokLog
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/stok-log/tambah",
     *     summary="Menambah stok (pembelian/restok)",
     *     tags={"Stok Log"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Data penambahan stok",
     *         @OA\JsonContent(
     *             required={"bahan_baku_id", "jumlah"},
     *             @OA\Property(property="bahan_baku_id", type="integer", example=1),
     *             @OA\Property(property="jumlah", type="number", format="float", example=10.5),
     *             @OA\Property(property="keterangan", type="string", example="Pembelian dari supplier")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Stok berhasil ditambahkan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Stok berhasil ditambahkan"),
     *             @OA\Property(property="data", type="object")
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
     * Menambah stok (pembelian/restok)
     */
    public function tambahStok(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bahan_baku_id' => 'required|exists:bahan_baku,id',
            'jumlah' => 'required|numeric|min:0.01',
            'keterangan' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $bahanBaku = BahanBaku::find($request->bahan_baku_id);
        $stokSebelum = $bahanBaku->stok_tersedia;
        $stokSesudah = $stokSebelum + $request->jumlah;

        $bahanBaku->update(['stok_tersedia' => $stokSesudah]);

        $stokLog = StokLog::create([
            'bahan_baku_id' => $request->bahan_baku_id,
            'user_id' => auth()->id(),
            'tipe' => 'masuk',
            'jumlah' => $request->jumlah,
            'stok_sebelum' => $stokSebelum,
            'stok_sesudah' => $stokSesudah,
            'referensi' => 'RESTOK-' . date('YmdHis'),
            'keterangan' => $request->keterangan ?? 'Penambahan stok manual'
        ]);

        return response()->json([
            'sukses' => true,
            'pesan' => 'Stok berhasil ditambahkan',
            'data' => $stokLog->load(['bahanBaku', 'user'])
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/stok-log/kurangi",
     *     summary="Mengurangi stok (penyesuaian/rusak/hilang)",
     *     tags={"Stok Log"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Data pengurangan stok",
     *         @OA\JsonContent(
     *             required={"bahan_baku_id", "jumlah", "keterangan"},
     *             @OA\Property(property="bahan_baku_id", type="integer", example=1),
     *             @OA\Property(property="jumlah", type="number", format="float", example=2.5),
     *             @OA\Property(property="keterangan", type="string", example="Bahan rusak/expired")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Stok berhasil dikurangi",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Stok berhasil dikurangi"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Stok tidak mencukupi",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Stok tidak mencukupi untuk dikurangi")
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
     * Mengurangi stok (penyesuaian/rusak/hilang)
     */
    public function kurangiStok(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bahan_baku_id' => 'required|exists:bahan_baku,id',
            'jumlah' => 'required|numeric|min:0.01',
            'keterangan' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $bahanBaku = BahanBaku::find($request->bahan_baku_id);
        $stokSebelum = $bahanBaku->stok_tersedia;
        
        if ($stokSebelum < $request->jumlah) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Stok tidak mencukupi untuk dikurangi'
            ], 400);
        }

        $stokSesudah = $stokSebelum - $request->jumlah;
        $bahanBaku->update(['stok_tersedia' => $stokSesudah]);

        $stokLog = StokLog::create([
            'bahan_baku_id' => $request->bahan_baku_id,
            'user_id' => auth()->id(),
            'tipe' => 'keluar',
            'jumlah' => $request->jumlah,
            'stok_sebelum' => $stokSebelum,
            'stok_sesudah' => $stokSesudah,
            'referensi' => 'ADJUST-' . date('YmdHis'),
            'keterangan' => $request->keterangan
        ]);

        return response()->json([
            'sukses' => true,
            'pesan' => 'Stok berhasil dikurangi',
            'data' => $stokLog->load(['bahanBaku', 'user'])
        ], 201);
    }
}
