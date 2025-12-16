import { ArrowUpCircle, ArrowDownCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StokStats } from "./types";

interface StokStatsCardProps {
  stats: StokStats;
}

export function StokStatsCard({ stats }: StokStatsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Stok Masuk</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{ color: "rgb(var(--primary))" }}>
            {stats.total_masuk.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total bahan yang masuk</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Stok Keluar</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{ color: "rgb(var(--primary))" }}>
            {stats.total_keluar.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total bahan yang keluar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Penyesuaian Stok</CardTitle>
          <AlertCircle className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{ color: "rgb(var(--primary))" }}>
            {stats.total_penyesuaian}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Jumlah penyesuaian stok</p>
        </CardContent>
      </Card>
    </div>
  );
}
