import { Package, ShoppingCart, UtensilsCrossed, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrencyFull } from "./utils";
import type { DashboardStats } from "./types";
import { StatsCard } from "./StatsCard";

interface DashboardStatsGridProps {
  stats: DashboardStats;
  trend: { percentage: string; isUp: boolean } | null;
  userRole?: string;
}

export function DashboardStatsGrid({ stats, trend, userRole }: DashboardStatsGridProps) {
  const showInventoryStats = userRole === "admin" || userRole === "super_admin";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {showInventoryStats && (
        <>
          <StatsCard title="Total Menu" value={stats.totalMenu.toString()} icon={<UtensilsCrossed className="h-5 w-5" />} />
          <StatsCard title="Bahan Baku" value={stats.totalBahanBaku.toString()} icon={<Package className="h-5 w-5" />} subtitle={stats.bahanStokMenipis.length > 0 ? `${stats.bahanStokMenipis.length} stok menipis` : undefined} />
        </>
      )}
      <StatsCard title="Transaksi Hari Ini" value={stats.transaksiHariIni.toString()} icon={<ShoppingCart className="h-5 w-5" />} />
      <StatsCard title="Pendapatan Hari Ini" value={formatCurrencyFull(stats.pendapatanHariIni)} icon={trend?.isUp ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />} trend={trend || undefined} />
    </div>
  );
}
