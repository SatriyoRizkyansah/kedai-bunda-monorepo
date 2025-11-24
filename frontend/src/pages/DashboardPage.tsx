import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    Package,
    ShoppingCart,
    UtensilsCrossed,
    TrendingUp,
    AlertCircle,
} from "lucide-react";
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
            const [bahanRes, menuRes, transaksiRes] = await Promise.all([
                api.get("/bahan-baku"),
                api.get("/menu"),
                api.get("/transaksi"),
            ]);

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
    const transaksiHariIni = transaksi.filter((t) =>
        t.tanggal.startsWith(today)
    );
    const pendapatanHariIni = transaksiHariIni
        .filter((t) => t.status === "selesai")
        .reduce((sum, t) => sum + Number(t.total), 0);

    // Cek bahan baku yang stoknya menipis
    const bahanStokMenipis = bahanBaku.filter((b) => b.stok <= b.stok_minimum);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Dashboard
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Ringkasan aktivitas dan stok Kedai Bunda
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Menu"
                        value={loading ? "..." : menu.length.toString()}
                        icon={<UtensilsCrossed className="h-6 w-6" />}
                        bgColor="bg-blue-500"
                    />
                    <StatsCard
                        title="Bahan Baku"
                        value={loading ? "..." : bahanBaku.length.toString()}
                        icon={<Package className="h-6 w-6" />}
                        bgColor="bg-green-500"
                        subtitle={
                            bahanStokMenipis.length > 0
                                ? `${bahanStokMenipis.length} stok menipis`
                                : undefined
                        }
                    />
                    <StatsCard
                        title="Transaksi Hari Ini"
                        value={
                            loading ? "..." : transaksiHariIni.length.toString()
                        }
                        icon={<ShoppingCart className="h-6 w-6" />}
                        bgColor="bg-purple-500"
                    />
                    <StatsCard
                        title="Pendapatan Hari Ini"
                        value={
                            loading
                                ? "..."
                                : `Rp ${pendapatanHariIni.toLocaleString(
                                      "id-ID"
                                  )}`
                        }
                        icon={<TrendingUp className="h-6 w-6" />}
                        bgColor="bg-primary"
                    />
                </div>

                {/* Alert Stok Menipis */}
                {bahanStokMenipis.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-900">
                                <AlertCircle className="h-5 w-5" />
                                Peringatan Stok Menipis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {bahanStokMenipis.map((bahan) => (
                                    <div
                                        key={bahan.id}
                                        className="flex justify-between items-center p-3 bg-white rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {bahan.nama}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Stok minimum:{" "}
                                                {bahan.stok_minimum}{" "}
                                                {bahan.satuan}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-orange-600">
                                                {bahan.stok} {bahan.satuan}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Tersisa
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Welcome Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Selamat Datang di Sistem Kedai Bunda! 🎉
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">
                            Aplikasi ini siap membantu Anda mengelola kasir,
                            menu, bahan baku, dan transaksi dengan mudah.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <h4 className="font-semibold text-blue-900 mb-2">
                                    ✨ Fitur Utama
                                </h4>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Manajemen Menu & Kategori</li>
                                    <li>• Tracking Bahan Baku & Stok</li>
                                    <li>• Transaksi Real-time</li>
                                    <li>• Laporan Penjualan</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                <h4 className="font-semibold text-green-900 mb-2">
                                    🚀 Mulai Sekarang
                                </h4>
                                <ul className="text-sm text-green-700 space-y-1">
                                    <li>• Cek Menu yang tersedia</li>
                                    <li>• Pantau Stok Bahan Baku</li>
                                    <li>• Buat Transaksi baru</li>
                                    <li>• Lihat Riwayat Transaksi</li>
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
    bgColor: string;
    subtitle?: string;
}

function StatsCard({ title, value, icon, bgColor, subtitle }: StatsCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">
                            {title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-xs text-orange-600 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div className={`${bgColor} text-white p-3 rounded-lg`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
