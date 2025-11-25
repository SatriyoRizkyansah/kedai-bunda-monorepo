import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Package, ShoppingCart, UtensilsCrossed, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { BahanBaku, Menu, Transaksi } from "@/lib/types";

export function DashboardPage() {
  const [bahanBaku, setBahanBaku] = useState<BahanBaku[]>([]);
  const [menu, setMenu] = useState<Menu[]>([]);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bahanRes, menuRes, transaksiRes] = await Promise.all([api.get("/bahan-baku"), api.get("/menu"), api.get("/transaksi")]);

      setBahanBaku(bahanRes.data.data || []);
      setMenu(menuRes.data.data || []);
      setTransaksi(transaksiRes.data.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hitung transaksi hari ini
  const today = new Date().toISOString().split("T")[0];
  const transaksiHariIni = transaksi.filter((t) => t.tanggal.startsWith(today));
  const pendapatanHariIni = transaksiHariIni.filter((t) => t.status === "selesai").reduce((sum, t) => sum + Number(t.total), 0);

  // Cek bahan baku yang stoknya menipis (threshold: < 10)
  const bahanStokMenipis = bahanBaku.filter((b) => Number(b.stok_tersedia || 0) < 10);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: "var(--font-sans)" }}>
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-2 text-base" style={{ fontFamily: "var(--font-sans)" }}>
            Ringkasan aktivitas dan stok Kedai Bundaaaa
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Menu" value={loading ? "..." : menu.length.toString()} icon={<UtensilsCrossed className="h-6 w-6" />} />
          <StatsCard title="Bahan Baku" value={loading ? "..." : bahanBaku.length.toString()} icon={<Package className="h-6 w-6" />} subtitle={bahanStokMenipis.length > 0 ? `${bahanStokMenipis.length} stok menipis` : undefined} />
          <StatsCard title="Transaksi Hari Ini" value={loading ? "..." : transaksiHariIni.length.toString()} icon={<ShoppingCart className="h-6 w-6" />} />
          <StatsCard title="Pendapatan Hari Ini" value={loading ? "..." : `Rp ${pendapatanHariIni.toLocaleString("id-ID")}`} icon={<TrendingUp className="h-6 w-6" />} />
        </div>

        {/* Alert Stok Menipis */}
        {bahanStokMenipis.length > 0 && (
          <Card
            className="border-destructive/30 bg-destructive/5"
            style={{
              boxShadow: "var(--shadow-md)",
              borderRadius: "var(--radius)",
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-destructive">
                <div
                  className="bg-destructive text-destructive-foreground p-2 rounded-lg"
                  style={{
                    borderRadius: "calc(var(--radius) - 2px)",
                  }}
                >
                  <AlertCircle className="h-5 w-5" />
                </div>
                <span>Peringatan Stok Menipis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bahanStokMenipis.map((bahan) => (
                  <div
                    key={bahan.id}
                    className="flex justify-between items-center p-4 bg-background border border-border rounded-lg hover:shadow-md transition-all"
                    style={{
                      borderRadius: "var(--radius)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div>
                      <p className="font-semibold text-foreground">{bahan.nama}</p>
                      <p className="text-sm text-muted-foreground mt-1">Stok tersedia rendah (threshold: 10 {bahan.satuan_dasar})</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-destructive">
                        {Number(bahan.stok_tersedia || 0).toFixed(2)} {bahan.satuan_dasar}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Tersisa</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome Card */}
        <Card
          style={{
            boxShadow: "var(--shadow-lg)",
            borderRadius: "var(--radius)",
          }}
          className="border-border bg-card"
        >
          <CardHeader>
            <CardTitle className="text-2xl text-foreground font-bold" style={{ fontFamily: "var(--font-sans)" }}>
              Selamat Datang di Sistem Kedai Bunda! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6 text-base" style={{ fontFamily: "var(--font-sans)" }}>
              Aplikasi ini siap membantu Anda mengelola kasir, menu, bahan baku, dan transaksi dengan mudah.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div
                className="p-5 bg-primary/10 border border-primary/20"
                style={{
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <h4 className="font-bold text-primary mb-3 text-lg" style={{ fontFamily: "var(--font-sans)" }}>
                  ✨ Fitur Utama
                </h4>
                <ul className="text-sm text-foreground space-y-2" style={{ fontFamily: "var(--font-sans)" }}>
                  <li className="flex items-center gap-2">
                    <div
                      className="bg-primary"
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                      }}
                    ></div>
                    Manajemen Menu & Kategori
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className="bg-primary"
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                      }}
                    ></div>
                    Tracking Bahan Baku & Stok
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className="bg-primary"
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                      }}
                    ></div>
                    Transaksi Real-time
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className="bg-primary"
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                      }}
                    ></div>
                    Laporan Penjualan
                  </li>
                </ul>
              </div>
              <div
                className="p-5 bg-secondary/10 border border-secondary/20"
                style={{
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <h4 className="font-bold text-secondary-foreground mb-3 text-lg" style={{ fontFamily: "var(--font-sans)" }}>
                  🚀 Mulai Sekarang
                </h4>
                <ul className="text-sm text-foreground space-y-2" style={{ fontFamily: "var(--font-sans)" }}>
                  <li className="flex items-center gap-2">
                    <div
                      className="bg-secondary"
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                      }}
                    ></div>
                    Cek Menu yang tersedia
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className="bg-secondary"
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                      }}
                    ></div>
                    Pantau Stok Bahan Baku
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className="bg-secondary"
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                      }}
                    ></div>
                    Buat Transaksi baruu
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className="bg-secondary"
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                      }}
                    ></div>
                    Lihat Riwayat Transaksi
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
}

function StatsCard({ title, value, icon, subtitle }: StatsCardProps) {
  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 border-border bg-card"
      style={{
        boxShadow: "var(--shadow-sm)",
        borderRadius: "var(--radius)",
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1" style={{ fontFamily: "var(--font-sans)" }}>
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground mt-2" style={{ fontFamily: "var(--font-sans)" }}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-destructive mt-2 font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                ⚠️ {subtitle}
              </p>
            )}
          </div>
          <div
            className="bg-primary text-primary-foreground p-4 transition-transform hover:scale-110"
            style={{
              borderRadius: "var(--radius)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
