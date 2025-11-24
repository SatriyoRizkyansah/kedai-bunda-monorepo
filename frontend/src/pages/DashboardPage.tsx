import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    Package,
    ShoppingCart,
    UtensilsCrossed,
    TrendingUp,
} from "lucide-react";

export function DashboardPage() {
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
                        value="8"
                        icon={<UtensilsCrossed className="h-6 w-6" />}
                        bgColor="bg-blue-500"
                    />
                    <StatsCard
                        title="Bahan Baku"
                        value="8"
                        icon={<Package className="h-6 w-6" />}
                        bgColor="bg-green-500"
                    />
                    <StatsCard
                        title="Transaksi Hari Ini"
                        value="0"
                        icon={<ShoppingCart className="h-6 w-6" />}
                        bgColor="bg-purple-500"
                    />
                    <StatsCard
                        title="Pendapatan Hari Ini"
                        value="Rp 0"
                        icon={<TrendingUp className="h-6 w-6" />}
                        bgColor="bg-primary"
                    />
                </div>

                {/* Welcome Card */}
                <div className="bg-white rounded-xl shadow-sm p-8 border">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Selamat Datang di Sistem Kedai Bunda! 🎉
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        Aplikasi ini siap membantu Anda mengelola kasir, menu,
                        bahan baku, dan transaksi dengan mudah.
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
                </div>
            </div>
        </DashboardLayout>
    );
}

interface StatsCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    bgColor: string;
}

function StatsCard({ title, value, icon, bgColor }: StatsCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`${bgColor} text-white p-3 rounded-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
