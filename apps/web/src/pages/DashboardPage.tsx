import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { BahanBaku, DetailTransaksi, Menu, Transaksi } from "@/lib/types";
import { DashboardWelcomeCard } from "./dashboard/DashboardWelcomeCard";
import { DashboardStatsGrid } from "./dashboard/DashboardStatsGrid";
import { RevenueTrendCard } from "./dashboard/RevenueTrendCard";
import { CategorySalesCard } from "./dashboard/CategorySalesCard";
import { TopMenuCard } from "./dashboard/TopMenuCard";
import { LowStockAlertCard } from "./dashboard/LowStockAlertCard";
import { isLowStock } from "./dashboard/utils";
import type { DashboardStats } from "./dashboard/types";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetchDashboardData();
    // Get user from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bahanRes, menuRes, transaksiRes] = await Promise.all([api.get("/bahan-baku"), api.get("/menu"), api.get("/transaksi")]);

      const bahanBaku: BahanBaku[] = bahanRes.data.data || [];
      const menu: Menu[] = menuRes.data.data || [];
      const transaksi: Transaksi[] = transaksiRes.data.data || [];

      // Hitung transaksi hari ini
      const today = new Date().toISOString().split("T")[0];
      const transaksiHariIni = transaksi.filter((t) => t.tanggal && t.tanggal.startsWith(today));
      const pendapatanHariIni = transaksiHariIni.filter((t) => t.status === "selesai").reduce((sum, t) => sum + Number(t.total || 0), 0);

      // Hitung pendapatan kemarin
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const transaksiKemarin = transaksi.filter((t) => t.tanggal && t.tanggal.startsWith(yesterdayStr));
      const pendapatanKemarin = transaksiKemarin.filter((t) => t.status === "selesai").reduce((sum, t) => sum + Number(t.total || 0), 0);

      // Bahan stok menipis
      const bahanStokMenipis = bahanBaku.filter(isLowStock);

      // Hitung penjualan per kategori dari transaksi selesai
      const kategoriMap = new Map<string, number>();
      transaksi
        .filter((t) => t.status === "selesai")
        .forEach((t) => {
          t.detail?.forEach((d: DetailTransaksi) => {
            const kategori = d.menu?.kategori || "Lainnya";
            const subtotal = Number(d.subtotal || 0);
            kategoriMap.set(kategori, (kategoriMap.get(kategori) || 0) + subtotal);
          });
        });

      const penjualanPerKategori = Array.from(kategoriMap.entries())
        .map(([kategori, total]) => ({ kategori, total }))
        .sort((a, b) => b.total - a.total);

      // Hitung menu terlaris
      const menuSalesMap = new Map<string, { terjual: number; pendapatan: number }>();
      transaksi
        .filter((t) => t.status === "selesai")
        .forEach((t) => {
          t.detail?.forEach((d: DetailTransaksi) => {
            const nama = d.menu?.nama || "Unknown";
            const existing = menuSalesMap.get(nama) || { terjual: 0, pendapatan: 0 };
            menuSalesMap.set(nama, {
              terjual: existing.terjual + Number(d.jumlah || 0),
              pendapatan: existing.pendapatan + Number(d.subtotal || 0),
            });
          });
        });

      const menuTerlaris = Array.from(menuSalesMap.entries())
        .map(([nama, data]) => ({ nama, ...data }))
        .sort((a, b) => b.terjual - a.terjual)
        .slice(0, 5);

      // Grafik pendapatan 7 hari terakhir
      const hariNama = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      const grafikPendapatan: Array<{ tanggal: string; hari: string; pendapatan: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const hari = hariNama[date.getDay()];
        const pendapatan = transaksi.filter((t) => t.tanggal?.startsWith(dateStr) && t.status === "selesai").reduce((sum, t) => sum + Number(t.total || 0), 0);
        grafikPendapatan.push({ tanggal: dateStr, hari, pendapatan });
      }

      setStats({
        totalMenu: menu.length,
        totalBahanBaku: bahanBaku.length,
        transaksiHariIni: transaksiHariIni.length,
        pendapatanHariIni,
        pendapatanKemarin,
        bahanStokMenipis,
        menuTerlaris,
        penjualanPerKategori,
        grafikPendapatan,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate trend percentage
  const getTrendPercentage = () => {
    if (!stats || stats.pendapatanKemarin === 0) return null;
    const diff = stats.pendapatanHariIni - stats.pendapatanKemarin;
    const percentage = (diff / stats.pendapatanKemarin) * 100;
    return { percentage: Math.abs(percentage).toFixed(1), isUp: diff >= 0 };
  };

  const trend = getTrendPercentage();

  if (loading || !stats) {
    return (
      <DashboardLayout>
        <LoadingScreen message="Loading..." size="lg" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardWelcomeCard userName={user?.name} />
        <DashboardStatsGrid stats={stats} trend={trend} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueTrendCard data={stats.grafikPendapatan} />
          <CategorySalesCard data={stats.penjualanPerKategori} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopMenuCard data={stats.menuTerlaris} />
          <LowStockAlertCard data={stats.bahanStokMenipis} />
        </div>
      </div>
    </DashboardLayout>
  );
}
