import { useState, useEffect } from "react";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Package, BarChart3 } from "lucide-react";
import { PeriodFilterCard } from "./laporan/PeriodFilterCard";
import { PenjualanTab } from "./laporan/PenjualanTab";
import { StokLogTab } from "./laporan/StokLogTab";
import { KeuntunganTab } from "./laporan/KeuntunganTab";
import { getPeriodDates } from "./laporan/utils";
import type { PeriodPreset, LaporanPenjualan, LaporanStokLog, LaporanKeuntungan } from "./laporan/types";

export function LaporanPage() {
  const [activeTab, setActiveTab] = useState("penjualan");
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("bulan_ini");
  const [customPeriod, setCustomPeriod] = useState(() => getPeriodDates("bulan_ini"));
  const [loading, setLoading] = useState(false);

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
        <PeriodFilterCard periodPreset={periodPreset} customPeriod={customPeriod} onPeriodPresetChange={setPeriodPreset} onCustomPeriodChange={setCustomPeriod} />

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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default LaporanPage;
