<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use App\Models\Menu;
use App\Models\BahanBaku;
use App\Models\User;
use App\Models\StokLog;
use App\Models\DetailTransaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/dashboard",
     *     summary="Statistik Dashboard",
     *     description="Mendapatkan statistik lengkap: transaksi hari ini & bulan ini, menu terlaris, stok menipis, grafik penjualan 7 hari",
     *     tags={"Dashboard"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Data statistik dashboard",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="transaksi_hari_ini", type="integer", example=25),
     *                 @OA\Property(property="pendapatan_hari_ini", type="number", example=1250000),
     *                 @OA\Property(property="transaksi_bulan_ini", type="integer", example=350),
     *                 @OA\Property(property="pendapatan_bulan_ini", type="number", example=17500000),
     *                 @OA\Property(property="menu_terlaris", type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="nama", type="string", example="Ayam Goreng"),
     *                         @OA\Property(property="total_terjual", type="integer", example=150)
     *                     )
     *                 ),
     *                 @OA\Property(property="stok_menipis", type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="nama", type="string", example="Ayam Potong"),
     *                         @OA\Property(property="stok", type="number", example=5)
     *                     )
     *                 ),
     *                 @OA\Property(property="grafik_penjualan", type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="tanggal", type="string", example="2025-01-24"),
     *                         @OA\Property(property="total", type="number", example=750000)
     *                     )
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        
        // Transaksi hari ini
        $transaksiHariIni = Transaksi::whereDate('created_at', $today)
            ->where('status', 'selesai')
            ->count();
            
        $pendapatanHariIni = Transaksi::whereDate('created_at', $today)
            ->where('status', 'selesai')
            ->sum('total');
            
        // Transaksi bulan ini
        $transaksiBulanIni = Transaksi::where('created_at', '>=', $thisMonth)
            ->where('status', 'selesai')
            ->count();
            
        $pendapatanBulanIni = Transaksi::where('created_at', '>=', $thisMonth)
            ->where('status', 'selesai')
            ->sum('total');
            
        // Menu terlaris bulan ini
        $menuTerlaris = DB::table('detail_transaksi')
            ->join('transaksi', 'detail_transaksi.transaksi_id', '=', 'transaksi.id')
            ->join('menu', 'detail_transaksi.menu_id', '=', 'menu.id')
            ->where('transaksi.created_at', '>=', $thisMonth)
            ->where('transaksi.status', 'selesai')
            ->select(
                'menu.id',
                'menu.nama',
                'menu.kategori',
                'menu.harga_jual',
                DB::raw('SUM(detail_transaksi.jumlah) as total_terjual'),
                DB::raw('SUM(detail_transaksi.subtotal) as total_pendapatan')
            )
            ->groupBy('menu.id', 'menu.nama', 'menu.kategori', 'menu.harga_jual')
            ->orderBy('total_terjual', 'desc')
            ->limit(5)
            ->get();
            
        // Bahan baku stok menipis (< 20% dari stok awal atau < 10 unit)
        $stokMenupis = BahanBaku::where('aktif', true)
            ->where(function($query) {
                $query->where('stok_tersedia', '<', 10);
            })
            ->orderBy('stok_tersedia', 'asc')
            ->limit(10)
            ->get();
            
        // Grafik pendapatan 7 hari terakhir
        $pendapatan7Hari = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $pendapatan = Transaksi::whereDate('created_at', $date)
                ->where('status', 'selesai')
                ->sum('total');
                
            $pendapatan7Hari[] = [
                'tanggal' => $date->format('Y-m-d'),
                'hari' => $date->locale('id')->isoFormat('dddd'),
                'pendapatan' => $pendapatan
            ];
        }
        
        // Total statistik
        $totalMenu = Menu::where('tersedia', true)->count();
        $totalBahanBaku = BahanBaku::where('aktif', true)->count();
        $totalUser = User::count();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil data dashboard',
            'data' => [
                'hari_ini' => [
                    'transaksi' => $transaksiHariIni,
                    'pendapatan' => $pendapatanHariIni
                ],
                'bulan_ini' => [
                    'transaksi' => $transaksiBulanIni,
                    'pendapatan' => $pendapatanBulanIni
                ],
                'total' => [
                    'menu' => $totalMenu,
                    'bahan_baku' => $totalBahanBaku,
                    'user' => $totalUser
                ],
                'menu_terlaris' => $menuTerlaris,
                'stok_menipis' => $stokMenupis,
                'grafik_pendapatan' => $pendapatan7Hari
            ]
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/dashboard/laporan-penjualan",
     *     summary="Laporan penjualan berdasarkan periode",
     *     tags={"Dashboard"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tanggal_mulai",
     *         in="query",
     *         description="Tanggal mulai periode (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date", example="2025-01-01")
     *     ),
     *     @OA\Parameter(
     *         name="tanggal_selesai",
     *         in="query",
     *         description="Tanggal selesai periode (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date", example="2025-01-31")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Laporan penjualan berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Berhasil mengambil laporan penjualan"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="periode",
     *                     type="object",
     *                     @OA\Property(property="mulai", type="string", example="2025-01-01"),
     *                     @OA\Property(property="selesai", type="string", example="2025-01-31")
     *                 ),
     *                 @OA\Property(
     *                     property="ringkasan",
     *                     type="object",
     *                     @OA\Property(property="total_transaksi", type="integer", example=350),
     *                     @OA\Property(property="total_pendapatan", type="number", format="float", example=17500000),
     *                     @OA\Property(property="total_bayar", type="number", format="float", example=18000000),
     *                     @OA\Property(property="total_kembalian", type="number", format="float", example=500000),
     *                     @OA\Property(property="rata_rata_per_transaksi", type="number", format="float", example=50000)
     *                 ),
     *                 @OA\Property(
     *                     property="per_kategori",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="kategori", type="string", example="makanan"),
     *                         @OA\Property(property="jumlah_transaksi", type="integer", example=200),
     *                         @OA\Property(property="total_item", type="integer", example=450),
     *                         @OA\Property(property="total_pendapatan", type="number", format="float", example=12000000)
     *                     )
     *                 ),
     *                 @OA\Property(property="transaksi", type="array", @OA\Items(type="object"))
     *             )
     *         )
     *     )
     * )
     *
     * Laporan penjualan berdasarkan periode
     */
    public function laporanPenjualan(Request $request)
    {
        $tanggalMulai = $request->input('tanggal_mulai', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $tanggalSelesai = $request->input('tanggal_selesai', Carbon::now()->format('Y-m-d'));
        
        $transaksi = Transaksi::with(['user', 'detailTransaksi.menu'])
            ->whereBetween('created_at', [
                $tanggalMulai . ' 00:00:00',
                $tanggalSelesai . ' 23:59:59'
            ])
            ->where('status', 'selesai')
            ->orderBy('created_at', 'desc')
            ->get();
            
        $totalTransaksi = $transaksi->count();
        $totalPendapatan = $transaksi->sum('total');
        $totalBayar = $transaksi->sum('bayar');
        $totalKembalian = $transaksi->sum('kembalian');
        
        // Ringkasan per kategori
        $penjualanPerKategori = DB::table('detail_transaksi')
            ->join('transaksi', 'detail_transaksi.transaksi_id', '=', 'transaksi.id')
            ->join('menu', 'detail_transaksi.menu_id', '=', 'menu.id')
            ->whereBetween('transaksi.created_at', [
                $tanggalMulai . ' 00:00:00',
                $tanggalSelesai . ' 23:59:59'
            ])
            ->where('transaksi.status', 'selesai')
            ->select(
                'menu.kategori',
                DB::raw('COUNT(DISTINCT transaksi.id) as jumlah_transaksi'),
                DB::raw('SUM(detail_transaksi.jumlah) as total_item'),
                DB::raw('SUM(detail_transaksi.subtotal) as total_pendapatan')
            )
            ->groupBy('menu.kategori')
            ->get();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil laporan penjualan',
            'data' => [
                'periode' => [
                    'mulai' => $tanggalMulai,
                    'selesai' => $tanggalSelesai
                ],
                'ringkasan' => [
                    'total_transaksi' => $totalTransaksi,
                    'total_pendapatan' => $totalPendapatan,
                    'total_bayar' => $totalBayar,
                    'total_kembalian' => $totalKembalian,
                    'rata_rata_per_transaksi' => $totalTransaksi > 0 ? $totalPendapatan / $totalTransaksi : 0
                ],
                'per_kategori' => $penjualanPerKategori,
                'transaksi' => $transaksi
            ]
        ]);
    }
    
    /**
     * @OA\Get(
     *     path="/api/dashboard/laporan-stok",
     *     summary="Laporan stok bahan baku",
     *     tags={"Dashboard"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Laporan stok berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Berhasil mengambil laporan stok"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="ringkasan",
     *                     type="object",
     *                     @OA\Property(property="total_bahan_baku", type="integer", example=25),
     *                     @OA\Property(property="stok_aman", type="integer", example=15),
     *                     @OA\Property(property="stok_menipis", type="integer", example=7),
     *                     @OA\Property(property="stok_habis", type="integer", example=3),
     *                     @OA\Property(property="total_nilai_stok", type="number", format="float", example=5000000)
     *                 ),
     *                 @OA\Property(
     *                     property="bahan_baku",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="nama", type="string", example="Tepung Terigu"),
     *                         @OA\Property(property="satuan_dasar", type="string", example="kg"),
     *                         @OA\Property(property="stok_tersedia", type="number", format="float", example=50.5),
     *                         @OA\Property(property="harga_per_satuan", type="number", format="float", example=15000),
     *                         @OA\Property(property="keterangan", type="string", example="Tepung terigu protein tinggi"),
     *                         @OA\Property(property="aktif", type="boolean", example=true)
     *                     )
     *                 )
     *             )
     *         )
     *     )
     * )
     *
     * Laporan stok bahan baku
     */
    public function laporanStok()
    {
        $bahanBaku = BahanBaku::with('konversi')
            ->where('aktif', true)
            ->orderBy('nama')
            ->get();
            
        $stokAman = $bahanBaku->filter(function($item) {
            return $item->stok_tersedia >= 20;
        })->count();
        
        $stokMenupis = $bahanBaku->filter(function($item) {
            return $item->stok_tersedia < 20 && $item->stok_tersedia >= 5;
        })->count();
        
        $stokHabis = $bahanBaku->filter(function($item) {
            return $item->stok_tersedia < 5;
        })->count();
        
        $totalNilaiStok = $bahanBaku->sum(function($item) {
            return $item->stok_tersedia * $item->harga_per_satuan;
        });

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil laporan stok',
            'data' => [
                'ringkasan' => [
                    'total_bahan_baku' => $bahanBaku->count(),
                    'stok_aman' => $stokAman,
                    'stok_menipis' => $stokMenupis,
                    'stok_habis' => $stokHabis,
                    'total_nilai_stok' => $totalNilaiStok
                ],
                'bahan_baku' => $bahanBaku
            ]
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/laporan/stok-log",
     *     summary="Laporan riwayat stok masuk/keluar",
     *     tags={"Laporan"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tanggal_mulai",
     *         in="query",
     *         description="Tanggal mulai periode (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="tanggal_selesai",
     *         in="query",
     *         description="Tanggal selesai periode (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="bahan_baku_id",
     *         in="query",
     *         description="Filter berdasarkan bahan baku",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Laporan stok log berhasil diambil"
     *     )
     * )
     */
    public function laporanStokLog(Request $request)
    {
        $tanggalMulai = $request->input('tanggal_mulai', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $tanggalSelesai = $request->input('tanggal_selesai', Carbon::now()->format('Y-m-d'));
        $bahanBakuId = $request->input('bahan_baku_id');
        
        $query = StokLog::with(['bahanBaku', 'user'])
            ->whereBetween('created_at', [
                $tanggalMulai . ' 00:00:00',
                $tanggalSelesai . ' 23:59:59'
            ]);
            
        if ($bahanBakuId) {
            $query->where('bahan_baku_id', $bahanBakuId);
        }
        
        $stokLogs = $query->orderBy('created_at', 'desc')->get();
        
        // Ringkasan stok masuk
        $stokMasuk = $stokLogs->where('tipe', 'masuk');
        $totalStokMasuk = $stokMasuk->sum('jumlah');
        $nilaiStokMasuk = $stokMasuk->sum(function($log) {
            return $log->jumlah * ($log->bahanBaku->harga_per_satuan ?? 0);
        });
        
        // Ringkasan stok keluar
        $stokKeluar = $stokLogs->where('tipe', 'keluar');
        $totalStokKeluar = $stokKeluar->sum('jumlah');
        $nilaiStokKeluar = $stokKeluar->sum(function($log) {
            return $log->jumlah * ($log->bahanBaku->harga_per_satuan ?? 0);
        });
        
        // Group by bahan baku
        $perBahanBaku = $stokLogs->groupBy('bahan_baku_id')->map(function($logs) {
            $bahanBaku = $logs->first()->bahanBaku;
            $masuk = $logs->where('tipe', 'masuk')->sum('jumlah');
            $keluar = $logs->where('tipe', 'keluar')->sum('jumlah');
            
            return [
                'bahan_baku_id' => $bahanBaku->id,
                'nama' => $bahanBaku->nama,
                'satuan_dasar' => $bahanBaku->satuan_dasar,
                'stok_masuk' => $masuk,
                'stok_keluar' => $keluar,
                'selisih' => $masuk - $keluar,
                'nilai_masuk' => $masuk * ($bahanBaku->harga_per_satuan ?? 0),
                'nilai_keluar' => $keluar * ($bahanBaku->harga_per_satuan ?? 0),
            ];
        })->values();
        
        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil laporan stok log',
            'data' => [
                'periode' => [
                    'mulai' => $tanggalMulai,
                    'selesai' => $tanggalSelesai
                ],
                'ringkasan' => [
                    'total_transaksi' => $stokLogs->count(),
                    'stok_masuk' => [
                        'jumlah_transaksi' => $stokMasuk->count(),
                        'total_unit' => $totalStokMasuk,
                        'nilai' => $nilaiStokMasuk
                    ],
                    'stok_keluar' => [
                        'jumlah_transaksi' => $stokKeluar->count(),
                        'total_unit' => $totalStokKeluar,
                        'nilai' => $nilaiStokKeluar
                    ]
                ],
                'per_bahan_baku' => $perBahanBaku,
                'logs' => $stokLogs
            ]
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/laporan/keuntungan",
     *     summary="Laporan keuntungan/laba rugi",
     *     tags={"Laporan"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tanggal_mulai",
     *         in="query",
     *         description="Tanggal mulai periode (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="tanggal_selesai",
     *         in="query",
     *         description="Tanggal selesai periode (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Laporan keuntungan berhasil diambil"
     *     )
     * )
     */
    public function laporanKeuntungan(Request $request)
    {
        $tanggalMulai = $request->input('tanggal_mulai', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $tanggalSelesai = $request->input('tanggal_selesai', Carbon::now()->format('Y-m-d'));
        
        // Pendapatan dari penjualan
        $transaksi = Transaksi::with(['detailTransaksi.menu.komposisi.konversiBahan.bahanBaku'])
            ->whereBetween('created_at', [
                $tanggalMulai . ' 00:00:00',
                $tanggalSelesai . ' 23:59:59'
            ])
            ->where('status', 'selesai')
            ->get();
            
        $totalPendapatan = $transaksi->sum('total');
        $totalTransaksi = $transaksi->count();
        
        // Hitung perkiraan HPP (Harga Pokok Penjualan)
        $totalHPP = 0;
        $detailPerMenu = [];
        
        foreach ($transaksi as $trx) {
            foreach ($trx->detailTransaksi as $detail) {
                $menu = $detail->menu;
                $jumlahTerjual = $detail->jumlah;
                $pendapatanMenu = $detail->subtotal;
                
                // Hitung HPP dari komposisi
                $hppPerUnit = 0;
                if ($menu && $menu->komposisi) {
                    foreach ($menu->komposisi as $komp) {
                        $konversi = $komp->konversiBahan;
                        if ($konversi && $konversi->bahanBaku) {
                            // Hitung biaya bahan baku per unit menu
                            $hargaPerSatuanDasar = $konversi->bahanBaku->harga_per_satuan ?? 0;
                            $biayaPerUnit = ($komp->jumlah / $konversi->jumlah_konversi) * $hargaPerSatuanDasar;
                            $hppPerUnit += $biayaPerUnit;
                        }
                    }
                }
                
                $hppTotal = $hppPerUnit * $jumlahTerjual;
                $totalHPP += $hppTotal;
                
                // Track per menu
                $menuId = $menu->id ?? 0;
                if (!isset($detailPerMenu[$menuId])) {
                    $detailPerMenu[$menuId] = [
                        'menu_id' => $menuId,
                        'nama_menu' => $menu->nama ?? 'Unknown',
                        'kategori' => $menu->kategori ?? 'Unknown',
                        'harga_jual' => $menu->harga_jual ?? 0,
                        'hpp_per_unit' => $hppPerUnit,
                        'margin_per_unit' => ($menu->harga_jual ?? 0) - $hppPerUnit,
                        'jumlah_terjual' => 0,
                        'total_pendapatan' => 0,
                        'total_hpp' => 0,
                        'total_laba' => 0,
                    ];
                }
                
                $detailPerMenu[$menuId]['jumlah_terjual'] += $jumlahTerjual;
                $detailPerMenu[$menuId]['total_pendapatan'] += $pendapatanMenu;
                $detailPerMenu[$menuId]['total_hpp'] += $hppTotal;
                $detailPerMenu[$menuId]['total_laba'] += ($pendapatanMenu - $hppTotal);
            }
        }
        
        // Hitung biaya stok masuk (pembelian bahan baku)
        $biayaPembelian = StokLog::where('tipe', 'masuk')
            ->whereBetween('created_at', [
                $tanggalMulai . ' 00:00:00',
                $tanggalSelesai . ' 23:59:59'
            ])
            ->get()
            ->sum(function($log) {
                return $log->jumlah * ($log->bahanBaku->harga_per_satuan ?? 0);
            });
        
        $labaKotor = $totalPendapatan - $totalHPP;
        $marginKotor = $totalPendapatan > 0 ? ($labaKotor / $totalPendapatan) * 100 : 0;
        
        // Urutkan per menu berdasarkan laba
        $detailPerMenu = collect($detailPerMenu)->sortByDesc('total_laba')->values();
        
        // Trend harian
        $trendHarian = [];
        $currentDate = Carbon::parse($tanggalMulai);
        $endDate = Carbon::parse($tanggalSelesai);
        
        while ($currentDate <= $endDate) {
            $dateStr = $currentDate->format('Y-m-d');
            
            $pendapatanHari = $transaksi->filter(function($trx) use ($dateStr) {
                return Carbon::parse($trx->created_at)->format('Y-m-d') === $dateStr;
            })->sum('total');
            
            // Simplified HPP calculation for trend
            $hppHari = $pendapatanHari * ($totalPendapatan > 0 ? ($totalHPP / $totalPendapatan) : 0);
            
            $trendHarian[] = [
                'tanggal' => $dateStr,
                'hari' => $currentDate->locale('id')->isoFormat('dddd'),
                'pendapatan' => $pendapatanHari,
                'hpp' => round($hppHari, 2),
                'laba' => round($pendapatanHari - $hppHari, 2)
            ];
            
            $currentDate->addDay();
        }
        
        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil laporan keuntungan',
            'data' => [
                'periode' => [
                    'mulai' => $tanggalMulai,
                    'selesai' => $tanggalSelesai
                ],
                'ringkasan' => [
                    'total_transaksi' => $totalTransaksi,
                    'total_pendapatan' => $totalPendapatan,
                    'total_hpp' => round($totalHPP, 2),
                    'laba_kotor' => round($labaKotor, 2),
                    'margin_kotor_persen' => round($marginKotor, 2),
                    'biaya_pembelian_stok' => $biayaPembelian
                ],
                'per_menu' => $detailPerMenu,
                'trend_harian' => $trendHarian
            ]
        ]);
    }
}
