import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { BahanBaku } from "@/lib/types";
import { Plus, Pencil, Trash2, Search, AlertCircle } from "lucide-react";

export function BahanBakuPage() {
    const [bahanBaku, setBahanBaku] = useState<BahanBaku[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchBahanBaku();
    }, []);

    const fetchBahanBaku = async () => {
        try {
            const response = await api.get("/bahan-baku");
            setBahanBaku(response.data.data || []);
        } catch (error) {
            console.error("Error fetching bahan baku:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBahanBaku = bahanBaku.filter((item) =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus bahan baku ini?")) return;

        try {
            await api.delete(`/bahan-baku/${id}`);
            fetchBahanBaku();
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Gagal menghapus bahan baku");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold">Bahan Baku</h2>
                        <p className="text-muted-foreground mt-1">
                            Kelola stok bahan baku untuk menu
                        </p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Bahan Baku
                    </Button>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari bahan baku..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Bahan Baku</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-center py-8 text-muted-foreground">
                                Memuat data...
                            </p>
                        ) : filteredBahanBaku.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground">
                                Tidak ada data bahan baku
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-4 font-semibold">
                                                Nama Bahan
                                            </th>
                                            <th className="text-left p-4 font-semibold">
                                                Satuan
                                            </th>
                                            <th className="text-right p-4 font-semibold">
                                                Stok
                                            </th>
                                            <th className="text-right p-4 font-semibold">
                                                Stok Min
                                            </th>
                                            <th className="text-right p-4 font-semibold">
                                                Harga/Satuan
                                            </th>
                                            <th className="text-center p-4 font-semibold">
                                                Status
                                            </th>
                                            <th className="text-center p-4 font-semibold">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBahanBaku.map((item) => {
                                            const isLowStock =
                                                item.stok <= item.stok_minimum;
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="border-b hover:bg-gray-50"
                                                >
                                                    <td className="p-4">
                                                        <p className="font-medium">
                                                            {item.nama}
                                                        </p>
                                                    </td>
                                                    <td className="p-4 text-muted-foreground">
                                                        {item.satuan}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span
                                                            className={`font-semibold ${
                                                                isLowStock
                                                                    ? "text-red-600"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {item.stok}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right text-muted-foreground">
                                                        {item.stok_minimum}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        Rp{" "}
                                                        {item.harga_satuan.toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {isLowStock ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Menipis
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                Aman
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item.id
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
