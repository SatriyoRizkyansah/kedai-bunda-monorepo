import { useState, useEffect } from "react";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingScreen } from "@/components/LoadingScreen";
import { TrendingUp, DollarSign, Package, ArrowUpCircle, ArrowDownCircle, Calendar, BarChart3, FileSpreadsheet, ChevronRight } from "lucide-react";
import * as XLSX from "xlsx";

// Types
interface RingkasanPenjualan {
  total_transaksi: number;
  total_pendapatan: number;
  total_bayar: number;
  total_kembalian: number;
  rata_rata_per_transaksi: number;
}

interface PenjualanPerKategori {
  kategori: string;
  jumlah_transaksi: number;
  total_item: number;
  total_pendapatan: number;
}

interface LaporanPenjualan {
  periode: { mulai: string; selesai: string };
  ringkasan: RingkasanPenjualan;
  per_kategori: PenjualanPerKategori[];
  detail_menu: DetailMenuPenjualan[];
  transaksi: unknown[];
}

interface DetailMenuPenjualan {
  menu_id: number;
  nama: string;
  kategori: string;
  harga_jual: number;
  total_terjual: number;
  total_pendapatan: number;
  jumlah_transaksi: number;
}

interface RingkasanStokLog {
  total_transaksi: number;
  stok_masuk: { jumlah_transaksi: number; total_unit: number; nilai: number };
  stok_keluar: { jumlah_transaksi: number; total_unit: number; nilai: number };
}

interface PerBahanBaku {
  bahan_baku_id: number;
  nama: string;
  satuan_dasar: string;
  stok_masuk: number;
  stok_keluar: number;
  selisih: number;
  nilai_masuk: number;
  nilai_keluar: number;
}

interface StokLogItem {
  id: number;
  bahan_baku_id: number;
  jumlah: number;
  tipe: "masuk" | "keluar";
  keterangan: string;
  created_at: string;
  bahan_baku: { nama: string; satuan_dasar: string };
  user?: { name: string };
}

interface LaporanStokLog {
  periode: { mulai: string; selesai: string };
  ringkasan: RingkasanStokLog;
  per_bahan_baku: PerBahanBaku[];
  logs: StokLogItem[];
}

interface RingkasanKeuntungan {
  total_transaksi: number;
  total_pendapatan: number;
  total_hpp: number;
  laba_kotor: number;
  margin_kotor_persen: number;
  biaya_pembelian_stok: number;
}

interface DetailPerMenu {
  menu_id: number;
  nama_menu: string;
  kategori: string;
  harga_jual: number;
  hpp_per_unit: number;
  margin_per_unit: number;
  jumlah_terjual: number;
  total_pendapatan: number;
  total_hpp: number;
  total_laba: number;
}

interface TrendHarian {
  tanggal: string;
  hari: string;
  pendapatan: number;
  hpp: number;
  laba: number;
}

interface LaporanKeuntungan {
  periode: { mulai: string; selesai: string };
  ringkasan: RingkasanKeuntungan;
  per_menu: DetailPerMenu[];
  trend_harian: TrendHarian[];
}

// Helper functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("id-ID").format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Period presets
type PeriodPreset = "hari_ini" | "minggu_ini" | "bulan_ini" | "tahun_ini" | "custom";

const getPeriodDates = (preset: PeriodPreset): { mulai: string; selesai: string } => {
  const today = new Date();
  const formatYMD = (date: Date) => date.toISOString().split("T")[0];

  switch (preset) {
    case "hari_ini":
      return { mulai: formatYMD(today), selesai: formatYMD(today) };
    case "minggu_ini": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      return { mulai: formatYMD(startOfWeek), selesai: formatYMD(today) };
    }
    case "bulan_ini": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { mulai: formatYMD(startOfMonth), selesai: formatYMD(today) };
    }
    case "tahun_ini": {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return { mulai: formatYMD(startOfYear), selesai: formatYMD(today) };
    }
    default:
      return { mulai: formatYMD(today), selesai: formatYMD(today) };
  }
};

export function LaporanPage() {
  const [activeTab, setActiveTab] = useState("penjualan");
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("bulan_ini");
  const [customPeriod, setCustomPeriod] = useState(() => getPeriodDates("bulan_ini"));
  const [loading, setLoading] = useState(false);
  const [expandedKategori, setExpandedKategori] = useState<number | null>(null);

  // Data states
  const [laporanPenjualan, setLaporanPenjualan] = useState<LaporanPenjualan | null>(null);
  const [laporanStokLog, setLaporanStokLog] = useState<LaporanStokLog | null>(null);
  const [laporanKeuntungan, setLaporanKeuntungan] = useState<LaporanKeuntungan | null>(null);

  const currentPeriod = periodPreset === "custom" ? customPeriod : getPeriodDates(periodPreset);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        tanggal_mulai: currentPeriod.mulai,
        tanggal_selesai: currentPeriod.selesai,
      };

      if (activeTab === "penjualan") {
        const res = await api.get("/laporan/penjualan", { params });
        setLaporanPenjualan(res.data.data);
      } else if (activeTab === "stok-log") {
        const res = await api.get("/laporan/stok-log", { params });
        setLaporanStokLog(res.data.data);
      } else if (activeTab === "keuntungan") {
        const res = await api.get("/laporan/keuntungan", { params });
        setLaporanKeuntungan(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, periodPreset, customPeriod.mulai, customPeriod.selesai]);

  // Export functions
  const exportPenjualanToExcel = () => {
    if (!laporanPenjualan) return;

    const wb = XLSX.utils.book_new();

    const ringkasanData = [
      ["Laporan Penjualan"],
      ["Periode", `${formatDate(currentPeriod.mulai)} - ${formatDate(currentPeriod.selesai)}`],
      [],
      ["Total Transaksi", laporanPenjualan.ringkasan.total_transaksi],
      ["Total Pendapatan", laporanPenjualan.ringkasan.total_pendapatan],
      ["Rata-rata per Transaksi", laporanPenjualan.ringkasan.rata_rata_per_transaksi],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(ringkasanData);
    XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan");

    const kategoriHeader = ["Kategori", "Jumlah Transaksi", "Total Item", "Total Pendapatan"];
    const kategoriData = laporanPenjualan.per_kategori.map((k) => [k.kategori, k.jumlah_transaksi, k.total_item, k.total_pendapatan]);
    const ws2 = XLSX.utils.aoa_to_sheet([kategoriHeader, ...kategoriData]);
    XLSX.utils.book_append_sheet(wb, ws2, "Per Kategori");

    const menuHeader = ["Menu", "Kategori", "Harga Jual", "Total Terjual", "Jumlah Transaksi", "Total Pendapatan"];
    const menuData = laporanPenjualan.detail_menu.map((m) => [m.nama, m.kategori, m.harga_jual, m.total_terjual, m.jumlah_transaksi, m.total_pendapatan]);
    const ws3 = XLSX.utils.aoa_to_sheet([menuHeader, ...menuData]);
    XLSX.utils.book_append_sheet(wb, ws3, "Detail Menu");

    XLSX.writeFile(wb, `Laporan_Penjualan_${currentPeriod.mulai}_${currentPeriod.selesai}.xlsx`);
  };

  const exportStokLogToExcel = () => {
    if (!laporanStokLog) return;

    const wb = XLSX.utils.book_new();

    const ringkasanData = [
      ["Laporan Stok Masuk/Keluar"],
      ["Periode", `${formatDate(currentPeriod.mulai)} - ${formatDate(currentPeriod.selesai)}`],
      [],
      ["STOK MASUK"],
      ["Jumlah Transaksi", laporanStokLog.ringkasan.stok_masuk.jumlah_transaksi],
      ["Total Unit", laporanStokLog.ringkasan.stok_masuk.total_unit],
      ["Nilai", laporanStokLog.ringkasan.stok_masuk.nilai],
      [],
      ["STOK KELUAR"],
      ["Jumlah Transaksi", laporanStokLog.ringkasan.stok_keluar.jumlah_transaksi],
      ["Total Unit", laporanStokLog.ringkasan.stok_keluar.total_unit],
      ["Nilai", laporanStokLog.ringkasan.stok_keluar.nilai],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(ringkasanData);
    XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan");

    const bahanHeader = ["Bahan Baku", "Satuan", "Stok Masuk", "Stok Keluar", "Selisih", "Nilai Masuk", "Nilai Keluar"];
    const bahanData = laporanStokLog.per_bahan_baku.map((b) => [b.nama, b.satuan_dasar, b.stok_masuk, b.stok_keluar, b.selisih, b.nilai_masuk, b.nilai_keluar]);
    const ws2 = XLSX.utils.aoa_to_sheet([bahanHeader, ...bahanData]);
    XLSX.utils.book_append_sheet(wb, ws2, "Per Bahan Baku");

    const logHeader = ["Tanggal", "Bahan Baku", "Tipe", "Jumlah", "Keterangan", "User"];
    const logData = laporanStokLog.logs.map((l) => [formatDateTime(l.created_at), l.bahan_baku?.nama ?? "-", l.tipe === "masuk" ? "Masuk" : "Keluar", l.jumlah, l.keterangan, l.user?.name ?? "-"]);
    const ws3 = XLSX.utils.aoa_to_sheet([logHeader, ...logData]);
    XLSX.utils.book_append_sheet(wb, ws3, "Detail Log");

    XLSX.writeFile(wb, `Laporan_Stok_${currentPeriod.mulai}_${currentPeriod.selesai}.xlsx`);
  };

  const exportKeuntunganToExcel = () => {
    if (!laporanKeuntungan) return;

    const wb = XLSX.utils.book_new();

    const ringkasanData = [
      ["Laporan Keuntungan / Laba Rugi"],
      ["Periode", `${formatDate(currentPeriod.mulai)} - ${formatDate(currentPeriod.selesai)}`],
      [],
      ["Total Transaksi", laporanKeuntungan.ringkasan.total_transaksi],
      ["Total Pendapatan", laporanKeuntungan.ringkasan.total_pendapatan],
      ["Total HPP (Harga Pokok Penjualan)", laporanKeuntungan.ringkasan.total_hpp],
      ["Laba Kotor", laporanKeuntungan.ringkasan.laba_kotor],
      ["Margin Kotor (%)", laporanKeuntungan.ringkasan.margin_kotor_persen],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(ringkasanData);
    XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan");

    const menuHeader = ["Menu", "Kategori", "Harga Jual", "HPP/Unit", "Margin/Unit", "Terjual", "Pendapatan", "HPP Total", "Laba"];
    const menuData = laporanKeuntungan.per_menu.map((m) => [m.nama_menu, m.kategori, m.harga_jual, m.hpp_per_unit, m.margin_per_unit, m.jumlah_terjual, m.total_pendapatan, m.total_hpp, m.total_laba]);
    const ws2 = XLSX.utils.aoa_to_sheet([menuHeader, ...menuData]);
    XLSX.utils.book_append_sheet(wb, ws2, "Per Menu");

    const trendHeader = ["Tanggal", "Hari", "Pendapatan", "HPP", "Laba"];
    const trendData = laporanKeuntungan.trend_harian.map((t) => [t.tanggal, t.hari, t.pendapatan, t.hpp, t.laba]);
    const ws3 = XLSX.utils.aoa_to_sheet([trendHeader, ...trendData]);
    XLSX.utils.book_append_sheet(wb, ws3, "Trend Harian");

    XLSX.writeFile(wb, `Laporan_Keuntungan_${currentPeriod.mulai}_${currentPeriod.selesai}.xlsx`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Laporan</h1>
            <p className="text-muted-foreground text-sm">Lihat ringkasan penjualan, stok, dan keuntungan</p>
          </div>
        </div>

        {/* Period Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Periode:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "hari_ini", label: "Hari Ini" },
                  { value: "minggu_ini", label: "Minggu Ini" },
                  { value: "bulan_ini", label: "Bulan Ini" },
                  { value: "tahun_ini", label: "Tahun Ini" },
                  { value: "custom", label: "Custom" },
                ].map((option) => (
                  <Button key={option.value} variant={periodPreset === option.value ? "default" : "outline"} size="sm" onClick={() => setPeriodPreset(option.value as PeriodPreset)}>
                    {option.label}
                  </Button>
                ))}
              </div>
              {periodPreset === "custom" && (
                <div className="flex gap-2 items-center">
                  <Input type="date" value={customPeriod.mulai} onChange={(e) => setCustomPeriod((prev) => ({ ...prev, mulai: e.target.value }))} className="w-auto" />
                  <span className="text-muted-foreground">-</span>
                  <Input type="date" value={customPeriod.selesai} onChange={(e) => setCustomPeriod((prev) => ({ ...prev, selesai: e.target.value }))} className="w-auto" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="penjualan" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Penjualan</span>
            </TabsTrigger>
            <TabsTrigger value="stok-log" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Stok Log</span>
            </TabsTrigger>
            <TabsTrigger value="keuntungan" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Keuntungan</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Penjualan */}
          <TabsContent value="penjualan" className="space-y-6">
            {loading ? (
              <LoadingScreen message="Memuat laporan penjualan..." size="md" />
            ) : laporanPenjualan ? (
              <>
                {/* Export Button */}
                <div className="flex justify-end">
                  <Button onClick={exportPenjualanToExcel} className="bg-green-600 hover:bg-green-700">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Transaksi</p>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(laporanPenjualan.ringkasan.total_transaksi)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(laporanPenjualan.ringkasan.total_pendapatan)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Bayar</p>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(laporanPenjualan.ringkasan.total_bayar)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Rata-rata/Transaksi</p>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(laporanPenjualan.ringkasan.rata_rata_per_transaksi)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Per Kategori dengan Detail Menu */}
                <Card>
                  <CardHeader>
                    <CardTitle>Penjualan per Kategori</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {laporanPenjualan.per_kategori.length > 0 ? (
                      <div className="space-y-2">
                        {laporanPenjualan.per_kategori.map((kat, idx) => {
                          // Filter menu untuk kategori ini
                          const menuKategori = laporanPenjualan.detail_menu.filter((m) => m.kategori === kat.kategori);
                          const isOpen = expandedKategori === idx;

                          return (
                            <div key={idx} className="border rounded-lg overflow-hidden">
                              {/* Header Kategori - Collapsible */}
                              <button onClick={() => setExpandedKategori(isOpen ? null : idx)} className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted/70 transition-colors text-left">
                                <div className="flex-1">
                                  <p className="font-medium capitalize text-base">{kat.kategori}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatNumber(kat.jumlah_transaksi)} transaksi • {formatNumber(kat.total_item)} item
                                  </p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <p className="font-semibold text-green-600">{formatCurrency(kat.total_pendapatan)}</p>
                                  <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                                </div>
                              </button>

                              {/* Detail Menu - Collapsible Content */}
                              {isOpen && (
                                <div className="p-4 bg-white dark:bg-slate-950 border-t space-y-2">
                                  {menuKategori.length > 0 ? (
                                    <div className="space-y-2">
                                      <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Menu dalam kategori ini:</p>
                                      {menuKategori.map((menu) => (
                                        <div key={menu.menu_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{menu.nama}</p>
                                            <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                              <span>📦 {formatNumber(menu.total_terjual)} pcs</span>
                                              <span>•</span>
                                              <span>🛒 {formatNumber(menu.jumlah_transaksi)}x</span>
                                            </div>
                                          </div>
                                          <div className="text-right ml-4 flex-shrink-0">
                                            <p className="text-xs text-muted-foreground">@{formatCurrency(menu.harga_jual)}</p>
                                            <p className="font-semibold text-green-600 text-sm">{formatCurrency(menu.total_pendapatan)}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-center text-muted-foreground text-sm py-4">Tidak ada menu dalam kategori ini</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Tidak ada data penjualan di periode ini</p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">Tidak ada data</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Stok Log */}
          <TabsContent value="stok-log" className="space-y-6">
            {loading ? (
              <LoadingScreen message="Memuat laporan stok..." size="md" />
            ) : laporanStokLog ? (
              <>
                {/* Export Button */}
                <div className="flex justify-end">
                  <Button onClick={exportStokLogToExcel} className="bg-green-600 hover:bg-green-700">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Stok Masuk */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <ArrowDownCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Stok Masuk</p>
                          <p className="text-xl font-bold text-green-600">+{formatNumber(laporanStokLog.ringkasan.stok_masuk.total_unit)} unit</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Transaksi</p>
                          <p className="font-medium">{laporanStokLog.ringkasan.stok_masuk.jumlah_transaksi}x</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Nilai</p>
                          <p className="font-medium text-green-600">{formatCurrency(laporanStokLog.ringkasan.stok_masuk.nilai)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stok Keluar */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <ArrowUpCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Stok Keluar</p>
                          <p className="text-xl font-bold text-red-600">-{formatNumber(laporanStokLog.ringkasan.stok_keluar.total_unit)} unit</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Transaksi</p>
                          <p className="font-medium">{laporanStokLog.ringkasan.stok_keluar.jumlah_transaksi}x</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Nilai</p>
                          <p className="font-medium text-red-600">{formatCurrency(laporanStokLog.ringkasan.stok_keluar.nilai)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Per Bahan Baku Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ringkasan per Bahan Baku</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bahan Baku</TableHead>
                          <TableHead className="text-center text-green-600">Masuk</TableHead>
                          <TableHead className="text-center text-red-600">Keluar</TableHead>
                          <TableHead className="text-center">Selisih</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {laporanStokLog.per_bahan_baku.length > 0 ? (
                          laporanStokLog.per_bahan_baku.map((b, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <p className="font-medium">{b.nama}</p>
                                <p className="text-xs text-muted-foreground">{b.satuan_dasar}</p>
                              </TableCell>
                              <TableCell className="text-center text-green-600">+{formatNumber(b.stok_masuk)}</TableCell>
                              <TableCell className="text-center text-red-600">-{formatNumber(b.stok_keluar)}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant={b.selisih >= 0 ? "default" : "destructive"}>
                                  {b.selisih >= 0 ? "+" : ""}
                                  {formatNumber(b.selisih)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              Tidak ada data
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Recent Logs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Riwayat Terbaru</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-y-auto">
                      {laporanStokLog.logs.length > 0 ? (
                        <div className="divide-y">
                          {laporanStokLog.logs.slice(0, 50).map((log) => (
                            <div key={log.id} className="p-4 flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${log.tipe === "masuk" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                                {log.tipe === "masuk" ? <ArrowDownCircle className="h-4 w-4 text-green-600" /> : <ArrowUpCircle className="h-4 w-4 text-red-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{log.bahan_baku?.nama ?? "-"}</p>
                                <p className="text-xs text-muted-foreground">{log.keterangan}</p>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${log.tipe === "masuk" ? "text-green-600" : "text-red-600"}`}>
                                  {log.tipe === "masuk" ? "+" : "-"}
                                  {formatNumber(log.jumlah)} {log.bahan_baku?.satuan_dasar}
                                </p>
                                <p className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">Tidak ada riwayat di periode ini</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">Tidak ada data</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Keuntungan */}
          <TabsContent value="keuntungan" className="space-y-6">
            {loading ? (
              <LoadingScreen message="Memuat laporan keuntungan..." size="md" />
            ) : laporanKeuntungan ? (
              <>
                {/* Export Button */}
                <div className="flex justify-end">
                  <Button onClick={exportKeuntunganToExcel} className="bg-green-600 hover:bg-green-700">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                      <p className="text-xl font-bold text-foreground">{formatCurrency(laporanKeuntungan.ringkasan.total_pendapatan)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total HPP</p>
                      <p className="text-xl font-bold text-red-600">{formatCurrency(laporanKeuntungan.ringkasan.total_hpp)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Laba Kotor</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(laporanKeuntungan.ringkasan.laba_kotor)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">{laporanKeuntungan.ringkasan.margin_kotor_persen.toFixed(1)}% margin</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Biaya Stok Masuk</p>
                      <p className="text-xl font-bold text-orange-600">{formatCurrency(laporanKeuntungan.ringkasan.biaya_pembelian_stok)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Profit per Menu */}
                <Card>
                  <CardHeader>
                    <CardTitle>Keuntungan per Menu</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Menu</TableHead>
                          <TableHead className="text-center">Terjual</TableHead>
                          <TableHead className="text-right">Pendapatan</TableHead>
                          <TableHead className="text-right">HPP</TableHead>
                          <TableHead className="text-right">Laba</TableHead>
                          <TableHead className="text-right">Margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {laporanKeuntungan.per_menu.length > 0 ? (
                          laporanKeuntungan.per_menu.map((m, idx) => {
                            const margin = m.total_pendapatan > 0 ? ((m.total_laba / m.total_pendapatan) * 100).toFixed(1) : "0";
                            return (
                              <TableRow key={idx}>
                                <TableCell>
                                  <p className="font-medium">{m.nama_menu}</p>
                                  <p className="text-xs text-muted-foreground capitalize">{m.kategori}</p>
                                </TableCell>
                                <TableCell className="text-center">{formatNumber(m.jumlah_terjual)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(m.total_pendapatan)}</TableCell>
                                <TableCell className="text-right text-red-600">{formatCurrency(m.total_hpp)}</TableCell>
                                <TableCell className="text-right text-green-600 font-medium">{formatCurrency(m.total_laba)}</TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant={parseFloat(margin) >= 30 ? "default" : parseFloat(margin) >= 15 ? "secondary" : "destructive"}
                                    className={
                                      parseFloat(margin) >= 30
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : parseFloat(margin) >= 15
                                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                          : ""
                                    }
                                  >
                                    {margin}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Tidak ada data
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Daily Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trend Harian</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {laporanKeuntungan.trend_harian.length > 0 ? (
                      <div className="space-y-2">
                        {laporanKeuntungan.trend_harian.map((t, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-2 rounded hover:bg-muted/50">
                            <div className="w-24 flex-shrink-0">
                              <p className="text-sm font-medium">{t.hari}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(t.tanggal)}</p>
                            </div>
                            <div className="flex-1">
                              <div className="flex gap-2 mb-1">
                                <div
                                  className="h-2 bg-primary rounded"
                                  style={{
                                    width: `${(t.pendapatan / Math.max(...laporanKeuntungan.trend_harian.map((x) => x.pendapatan), 1)) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Pendapatan: {formatCurrency(t.pendapatan)}</span>
                                <span className="text-green-600 font-medium">Laba: {formatCurrency(t.laba)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Tidak ada data di periode ini</p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">Tidak ada data</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default LaporanPage;
