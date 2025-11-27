import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Package, ShoppingCart, UtensilsCrossed, TrendingUp, TrendingDown, AlertCircle, ArrowUp, ArrowDown, Sparkles, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { BahanBaku, Menu, Transaksi, DetailTransaksi } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import Lottie from "lottie-react";
import cookingAnimation from "@/components/loader/cooking-animation.json";

// Warna untuk pie chart
const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

// Format currency
const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `Rp ${(value / 1000).toFixed(0)}K`;
  }
  return `Rp ${value}`;
};

const formatCurrencyFull = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// Get greeting based on time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "Selamat Pagi";
  if (hour >= 11 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};

interface DashboardStats {
  totalMenu: number;
  totalBahanBaku: number;
  transaksiHariIni: number;
  pendapatanHariIni: number;
  pendapatanKemarin: number;
  bahanStokMenipis: BahanBaku[];
  menuTerlaris: Array<{ nama: string; terjual: number; pendapatan: number }>;
  penjualanPerKategori: Array<{ kategori: string; total: number }>;
  grafikPendapatan: Array<{ tanggal: string; hari: string; pendapatan: number }>;
}

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
      const bahanStokMenipis = bahanBaku.filter((b) => Number(b.stok_tersedia || 0) < 10);

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
        {/* Welcome Section with Animation */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Lottie Animation */}
              <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                <Lottie animationData={cookingAnimation} loop={true} className="w-full h-full" />
              </div>

              {/* Welcome Text */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  <span>{getGreeting()}</span>
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                  Selamat Datang, <span className="text-primary">{user?.name?.split(" ")[0] || "Admin"}</span>! 👋
                </h1>
                <p className="text-muted-foreground text-base md:text-lg max-w-2xl">Kelola bisnis kuliner Anda dengan mudah. Pantau stok bahan baku, kelola menu, dan lihat laporan penjualan dalam satu dashboard yang lengkap.</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Menu" value={stats.totalMenu.toString()} icon={<UtensilsCrossed className="h-5 w-5" />} />
          <StatsCard title="Bahan Baku" value={stats.totalBahanBaku.toString()} icon={<Package className="h-5 w-5" />} subtitle={stats.bahanStokMenipis.length > 0 ? `${stats.bahanStokMenipis.length} stok menipis` : undefined} />
          <StatsCard title="Transaksi Hari Ini" value={stats.transaksiHariIni.toString()} icon={<ShoppingCart className="h-5 w-5" />} />
          <StatsCard
            title="Pendapatan Hari Ini"
            value={formatCurrencyFull(stats.pendapatanHariIni)}
            icon={trend?.isUp ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            trend={trend ? { percentage: trend.percentage, isUp: trend.isUp } : undefined}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Area Chart - Pendapatan 7 Hari */}
          <Card className="border-border bg-card" style={{ boxShadow: "var(--shadow-md)", borderRadius: "var(--radius)" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Pendapatan 7 Hari Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.grafikPendapatan} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hari" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} width={70} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrencyFull(value), "Pendapatan"]}
                      labelFormatter={(label) => `Hari: ${label}`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area type="monotone" dataKey="pendapatan" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorPendapatan)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart - Penjualan per Kategori */}
          <Card className="border-border bg-card" style={{ boxShadow: "var(--shadow-md)", borderRadius: "var(--radius)" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Penjualan per Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                {stats.penjualanPerKategori.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.penjualanPerKategori}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="total"
                        nameKey="kategori"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {stats.penjualanPerKategori.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [formatCurrencyFull(value), "Total"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">Belum ada data penjualan</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Menu Terlaris */}
          <Card className="border-border bg-card" style={{ boxShadow: "var(--shadow-md)", borderRadius: "var(--radius)" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Top 5 Menu Terlaris
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                {stats.menuTerlaris.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.menuTerlaris} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
                      <YAxis type="category" dataKey="nama" width={100} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
                      <Tooltip
                        formatter={(value: number, name: string) => {
                          if (name === "terjual") return [`${value} pcs`, "Terjual"];
                          return [formatCurrencyFull(value), "Pendapatan"];
                        }}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="terjual" fill="#3b82f6" radius={[0, 4, 4, 0]} name="terjual" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">Belum ada data menu terlaris</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alert Stok Menipis */}
          <Card className={stats.bahanStokMenipis.length > 0 ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"} style={{ boxShadow: "var(--shadow-md)", borderRadius: "var(--radius)" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: stats.bahanStokMenipis.length > 0 ? "hsl(var(--destructive))" : "hsl(var(--foreground))" }}>
                <AlertCircle className="h-5 w-5" />
                Peringatan Stok Menipis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] overflow-y-auto">
                {stats.bahanStokMenipis.length > 0 ? (
                  <div className="space-y-3">
                    {stats.bahanStokMenipis.map((bahan) => (
                      <div key={bahan.id} className="flex justify-between items-center p-3 bg-background border border-border rounded-lg hover:shadow-sm transition-all">
                        <div>
                          <p className="font-medium text-foreground text-sm">{bahan.nama}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Threshold: 10 {bahan.satuan_dasar}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-destructive">{Number(bahan.stok_tersedia || 0).toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">{bahan.satuan_dasar}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Package className="h-12 w-12 mb-3 text-green-500" />
                    <p className="text-sm font-medium text-green-600">Semua stok aman</p>
                    <p className="text-xs mt-1">Tidak ada bahan baku yang menipis</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: { percentage: string; isUp: boolean };
}

function StatsCard({ title, value, icon, subtitle, trend }: StatsCardProps) {
  return (
    <Card className="group relative overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-500">
      {/* Background decoration using theme colors */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:scale-150" />
      <div className="absolute -right-3 -bottom-3 h-16 w-16 rounded-full bg-primary/5 blur-xl opacity-60" />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">{title}</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
            {trend && (
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${trend.isUp ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                {trend.isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                <span>{trend.percentage}%</span>
              </div>
            )}
            {subtitle && !trend && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{subtitle}</span>
              </div>
            )}
          </div>
          <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3">{icon}</div>
        </div>
      </CardContent>

      {/* Bottom gradient line using theme primary */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
