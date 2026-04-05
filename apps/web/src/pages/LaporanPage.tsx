import { useState, useEffect } from "react";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, BarChart3, LayoutList, FileSpreadsheet, FileText } from "lucide-react";
import { PeriodFilterCard } from "./laporan/PeriodFilterCard";
import { PenjualanTab } from "./laporan/PenjualanTab";
import { StokLogTab } from "./laporan/StokLogTab";
import { KeuntunganTab } from "./laporan/KeuntunganTab";
import { exportLaporanLengkapToExcel, exportLaporanLengkapToPdf } from "./laporan/exportService";
import { getPeriodDates } from "./laporan/utils";
import type { PeriodPreset, LaporanPenjualan, LaporanStokLog, LaporanKeuntungan } from "./laporan/types";

export function LaporanPage() {
  const [activeTab, setActiveTab] = useState("penjualan");
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("bulan_ini");
  const [customPeriod, setCustomPeriod] = useState(() => getPeriodDates("bulan_ini"));
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<null | "excel" | "pdf">(null);

  // Data states
  const [laporanPenjualan, setLaporanPenjualan] = useState<LaporanPenjualan | null>(null);
  const [laporanStokLog, setLaporanStokLog] = useState<LaporanStokLog | null>(null);
  const [laporanKeuntungan, setLaporanKeuntungan] = useState<LaporanKeuntungan | null>(null);

  const currentPeriod = periodPreset === "custom" ? customPeriod : getPeriodDates(periodPreset);

  const canExportLengkap = Boolean(laporanPenjualan && laporanStokLog && laporanKeuntungan) && !loading;

  const handleExportLengkapExcel = () => {
    if (!laporanPenjualan || !laporanStokLog || !laporanKeuntungan) return;
    setExporting("excel");
    try {
      exportLaporanLengkapToExcel(
        {
          penjualan: laporanPenjualan,
          stokLog: laporanStokLog,
          keuntungan: laporanKeuntungan,
        },
        currentPeriod,
      );
    } finally {
      setExporting(null);
    }
  };

  const handleExportLengkapPdf = () => {
    if (!laporanPenjualan || !laporanStokLog || !laporanKeuntungan) return;
    setExporting("pdf");
    try {
      exportLaporanLengkapToPdf(
        {
          penjualan: laporanPenjualan,
          stokLog: laporanStokLog,
          keuntungan: laporanKeuntungan,
        },
        currentPeriod,
      );
    } finally {
      setExporting(null);
    }
  };

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
      } else if (activeTab === "lengkap") {
        const [penjualanRes, stokLogRes, keuntunganRes] = await Promise.all([api.get("/laporan/penjualan", { params }), api.get("/laporan/stok-log", { params }), api.get("/laporan/keuntungan", { params })]);
        setLaporanPenjualan(penjualanRes.data.data);
        setLaporanStokLog(stokLogRes.data.data);
        setLaporanKeuntungan(keuntunganRes.data.data);
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

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Laporan</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Lihat ringkasan penjualan, stok, dan keuntungan</p>
          </div>
        </div>

        {/* Period Filter */}
        <PeriodFilterCard periodPreset={periodPreset} customPeriod={customPeriod} onPeriodPresetChange={setPeriodPreset} onCustomPeriodChange={setCustomPeriod} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 mb-6 h-auto p-1">
            <TabsTrigger value="penjualan" className="flex flex-col gap-1 py-2 text-xs leading-tight sm:flex-row sm:gap-2 sm:text-sm sm:py-1.5">
              <DollarSign className="h-4 w-4" />
              <span>Penjualan</span>
            </TabsTrigger>
            <TabsTrigger value="stok-log" className="flex flex-col gap-1 py-2 text-xs leading-tight sm:flex-row sm:gap-2 sm:text-sm sm:py-1.5">
              <Package className="h-4 w-4" />
              <span>Stok Log</span>
            </TabsTrigger>
            <TabsTrigger value="keuntungan" className="flex flex-col gap-1 py-2 text-xs leading-tight sm:flex-row sm:gap-2 sm:text-sm sm:py-1.5">
              <BarChart3 className="h-4 w-4" />
              <span>Keuntungan</span>
            </TabsTrigger>
            <TabsTrigger value="lengkap" className="flex flex-col gap-1 py-2 text-xs leading-tight sm:flex-row sm:gap-2 sm:text-sm sm:py-1.5">
              <LayoutList className="h-4 w-4" />
              <span>Lengkap</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Penjualan */}
          <TabsContent value="penjualan" className="space-y-6">
            <PenjualanTab loading={loading} laporan={laporanPenjualan} period={currentPeriod} />
          </TabsContent>

          {/* Tab: Stok Log */}
          <TabsContent value="stok-log" className="space-y-6">
            <StokLogTab loading={loading} laporan={laporanStokLog} period={currentPeriod} />
          </TabsContent>

          {/* Tab: Keuntungan */}
          <TabsContent value="keuntungan" className="space-y-6">
            <KeuntunganTab loading={loading} laporan={laporanKeuntungan} period={currentPeriod} />
          </TabsContent>

          {/* Tab: Laporan Lengkap */}
          <TabsContent value="lengkap" className="space-y-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Export Laporan Lengkap</CardTitle>
                <p className="text-sm text-muted-foreground">Export ini mencakup Penjualan, Keuntungan, dan Stok Log sesuai periode yang dipilih.</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                  <Button onClick={handleExportLengkapExcel} disabled={!canExportLengkap || exporting !== null} className="w-full sm:w-auto">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    {exporting === "excel" ? "Exporting..." : "Export Excel Lengkap"}
                  </Button>
                  <Button onClick={handleExportLengkapPdf} disabled={!canExportLengkap || exporting !== null} variant="outline" className="w-full sm:w-auto">
                    <FileText className="h-4 w-4 mr-2" />
                    {exporting === "pdf" ? "Exporting..." : "Export PDF Lengkap"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Penjualan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <PenjualanTab loading={loading} laporan={laporanPenjualan} period={currentPeriod} showExport={false} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Keuntungan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <KeuntunganTab loading={loading} laporan={laporanKeuntungan} period={currentPeriod} showExport={false} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Package className="h-5 w-5 text-primary" />
                  Stok Log
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <StokLogTab loading={loading} laporan={laporanStokLog} period={currentPeriod} showExport={false} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default LaporanPage;
