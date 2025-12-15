<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransaksiResource;
use App\Models\Transaksi;
use App\Models\DetailTransaksi;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransaksiController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/transaksi",
     *     summary="Menampilkan daftar transaksi",
     *     tags={"Transaksi"},
     *     security={{"sanctum":{}}},
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
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter berdasarkan status (selesai/dibatalkan)",
     *         required=false,
     *         @OA\Schema(type="string", enum={"selesai", "dibatalkan"}, example="selesai")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Daftar transaksi berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Berhasil mengambil data transaksi"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="nomor_transaksi", type="string", example="TRX-20250125-001"),
     *                     @OA\Property(property="user_id", type="integer", example=1),
     *                     @OA\Property(property="total", type="number", format="float", example=50000),
     *                     @OA\Property(property="bayar", type="number", format="float", example=50000),
     *                     @OA\Property(property="kembalian", type="number", format="float", example=0),
     *                     @OA\Property(property="status", type="string", example="selesai"),
     *                     @OA\Property(property="catatan", type="string", example="Untuk dibungkus"),
     *                     @OA\Property(property="created_at", type="string", format="date-time")
     *                 )
     *             )
     *         )
     *     )
     * )
     *
     * Menampilkan daftar transaksi
     */
    public function index(Request $request)
    {
        $query = Transaksi::with(['user', 'detailTransaksi.menu']);

        // Filter berdasarkan tanggal
        if ($request->has('tanggal_mulai') && $request->has('tanggal_selesai')) {
            $query->whereBetween('created_at', [
                $request->tanggal_mulai . ' 00:00:00',
                $request->tanggal_selesai . ' 23:59:59'
            ]);
        }

        // Filter berdasarkan status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $transaksi = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil data transaksi',
            'data' => TransaksiResource::collection($transaksi)
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/transaksi",
     *     summary="Membuat transaksi baru",
     *     tags={"Transaksi"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Data transaksi baru",
     *         @OA\JsonContent(
     *             required={"user_id", "bayar", "items"},
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="bayar", type="number", format="float", example=100000),
     *             @OA\Property(property="catatan", type="string", example="Untuk dibungkus"),
     *             @OA\Property(
     *                 property="items",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="menu_id", type="integer", example=1),
     *                     @OA\Property(property="jumlah", type="integer", example=2)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Transaksi berhasil dibuat",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Transaksi berhasil dibuat"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Error transaksi (stok tidak cukup, dll)",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Stok tidak mencukupi")
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
     * Membuat transaksi baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'bayar' => 'required|numeric|min:0',
            'catatan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menu,id',
            'items.*.jumlah' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Cek stok untuk semua menu
            $total = 0;
            $detailItems = [];
            
            foreach ($request->items as $item) {
                $menu = Menu::with('komposisiMenu.bahanBaku.satuan', 'komposisiMenu.satuan')->find($item['menu_id']);
                
                if (!$menu) {
                    throw new \Exception("Menu dengan ID {$item['menu_id']} tidak ditemukan");
                }

                if (!$menu->tersedia) {
                    throw new \Exception("Menu {$menu->nama} tidak tersedia");
                }

                // Cek stok bahan untuk menu ini
                foreach ($menu->komposisiMenu as $komposisi) {
                    $bahanBaku = $komposisi->bahanBaku;
                    if (!$bahanBaku || $komposisi->jumlah <= 0) {
                        continue;
                    }

                    $jumlahDibutuhkan = $komposisi->jumlah * $item['jumlah'];
                    $satuanNama = $komposisi->satuan?->nama ?? $bahanBaku->satuan?->nama ?? 'satuan';

                    if ($bahanBaku->stok_tersedia < $jumlahDibutuhkan) {
                        throw new \Exception(
                            "Stok {$bahanBaku->nama} tidak mencukupi. " .
                            "Dibutuhkan: {$jumlahDibutuhkan} {$satuanNama}, " .
                            "Tersedia: {$bahanBaku->stok_tersedia} {$satuanNama}"
                        );
                    }
                }

                $subtotal = $menu->harga_jual * $item['jumlah'];
                $total += $subtotal;

                $detailItems[] = [
                    'menu' => $menu,
                    'jumlah' => $item['jumlah'],
                    'harga_satuan' => $menu->harga_jual,
                    'subtotal' => $subtotal
                ];
            }

            // Validasi pembayaran
            if ($request->bayar < $total) {
                throw new \Exception("Pembayaran kurang. Total: Rp " . number_format($total, 0, ',', '.'));
            }

            $kembalian = $request->bayar - $total;

            // Buat transaksi
            $transaksi = Transaksi::create([
                'nomor_transaksi' => Transaksi::generateNomorTransaksi(),
                'user_id' => $request->user_id,
                'total' => $total,
                'bayar' => $request->bayar,
                'kembalian' => $kembalian,
                'status' => 'selesai',
                'catatan' => $request->catatan
            ]);

            // Simpan detail transaksi dan kurangi stok
            foreach ($detailItems as $detail) {
                DetailTransaksi::create([
                    'transaksi_id' => $transaksi->id,
                    'menu_id' => $detail['menu']->id,
                    'jumlah' => $detail['jumlah'],
                    'harga_satuan' => $detail['harga_satuan'],
                    'subtotal' => $detail['subtotal']
                ]);

                // Kurangi stok bahan baku sesuai komposisi manual
                foreach ($detail['menu']->komposisiMenu as $komposisi) {
                    $bahanBaku = $komposisi->bahanBaku;

                    if (!$bahanBaku || $komposisi->jumlah <= 0) {
                        continue;
                    }

                    $jumlahPemakaian = $komposisi->jumlah * $detail['jumlah'];

                    if ($jumlahPemakaian <= 0) {
                        continue;
                    }

                    $satuanNama = $komposisi->satuan?->nama
                        ?? $bahanBaku->satuan?->nama
                        ?? $bahanBaku->satuan_dasar
                        ?? 'satuan';

                    $deskripsi = "Pemakaian {$jumlahPemakaian} {$satuanNama} {$bahanBaku->nama} untuk menu {$detail['menu']->nama}";

                    $bahanBaku->kurangiStok(
                        $jumlahPemakaian,
                        $request->user_id,
                        $deskripsi,
                        $transaksi->nomor_transaksi
                    );
                }
            }

            DB::commit();

            $transaksi->load(['user', 'detailTransaksi.menu']);

            return response()->json([
                'sukses' => true,
                'pesan' => 'Transaksi berhasil dibuat',
                'data' => new TransaksiResource($transaksi)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'sukses' => false,
                'pesan' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/transaksi/{id}",
     *     summary="Menampilkan detail transaksi",
     *     tags={"Transaksi"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID Transaksi",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detail transaksi berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Berhasil mengambil detail transaksi"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Transaksi tidak ditemukan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Transaksi tidak ditemukan")
     *         )
     *     )
     * )
     *
     * Menampilkan detail transaksi
     */
    public function show($id)
    {
        $transaksi = Transaksi::with(['user', 'detailTransaksi.menu'])->find($id);

        if (!$transaksi) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Transaksi tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil detail transaksi',
            'data' => new TransaksiResource($transaksi)
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/transaksi/{id}/batal",
     *     summary="Membatalkan transaksi",
     *     tags={"Transaksi"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID Transaksi",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Transaksi berhasil dibatalkan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Transaksi berhasil dibatalkan dan stok dikembalikan"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Error pembatalan transaksi",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Transaksi sudah dibatalkan sebelumnya")
     *         )
     *     )
     * )
     *
     * Membatalkan transaksi
     */
    public function batal($id)
    {
        DB::beginTransaction();

        try {
            $transaksi = Transaksi::with([
                'detailTransaksi.menu.komposisiMenu.bahanBaku.satuan',
                'detailTransaksi.menu.komposisiMenu.satuan',
            ])->find($id);

            if (!$transaksi) {
                throw new \Exception('Transaksi tidak ditemukan');
            }

            if ($transaksi->status === 'dibatalkan') {
                throw new \Exception('Transaksi sudah dibatalkan sebelumnya');
            }

            // Kembalikan stok sesuai komposisi manual
            foreach ($transaksi->detailTransaksi as $detail) {
                foreach ($detail->menu->komposisiMenu as $komposisi) {
                    $bahanBaku = $komposisi->bahanBaku;

                    if (!$bahanBaku || $komposisi->jumlah <= 0) {
                        continue;
                    }

                    $jumlahPengembalian = $komposisi->jumlah * $detail->jumlah;

                    if ($jumlahPengembalian <= 0) {
                        continue;
                    }

                    $satuanNama = $komposisi->satuan?->nama
                        ?? $bahanBaku->satuan?->nama
                        ?? $bahanBaku->satuan_dasar
                        ?? 'satuan';

                    $deskripsi = "Pengembalian {$jumlahPengembalian} {$satuanNama} {$bahanBaku->nama} dari pembatalan transaksi";

                    $bahanBaku->tambahStok(
                        $jumlahPengembalian,
                        $transaksi->user_id,
                        $deskripsi,
                        $transaksi->nomor_transaksi
                    );
                }
            }

            $transaksi->update(['status' => 'dibatalkan']);

            DB::commit();

            return response()->json([
                'sukses' => true,
                'pesan' => 'Transaksi berhasil dibatalkan dan stok dikembalikan',
                'data' => new TransaksiResource($transaksi)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'sukses' => false,
                'pesan' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update tidak digunakan untuk transaksi (hanya batal)
     */
    public function update(Request $request, $id)
    {
        return response()->json([
            'sukses' => false,
            'pesan' => 'Transaksi tidak dapat diupdate. Gunakan endpoint batal untuk membatalkan transaksi.'
        ], 405);
    }

    /**
     * Hapus tidak digunakan untuk transaksi (hanya batal)
     */
    public function destroy($id)
    {
        return response()->json([
            'sukses' => false,
            'pesan' => 'Transaksi tidak dapat dihapus. Gunakan endpoint batal untuk membatalkan transaksi.'
        ], 405);
    }
}
