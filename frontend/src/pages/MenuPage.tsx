import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Menu } from "@/lib/types";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

export function MenuPage() {
    const [menu, setMenu] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedKategori, setSelectedKategori] = useState<string>("semua");

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const response = await api.get("/menu");
            setMenu(response.data.data || []);
        } catch (error) {
            console.error("Error fetching menu:", error);
        } finally {
            setLoading(false);
        }
    };

    const kategoris = [
        "semua",
        ...Array.from(new Set(menu.map((m) => m.kategori))),
    ];

    const filteredMenu = menu.filter((item) => {
        const matchSearch = item.nama
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchKategori =
            selectedKategori === "semua" || item.kategori === selectedKategori;
        return matchSearch && matchKategori;
    });

    const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus menu ini?")) return;

        try {
            await api.delete(`/menu/${id}`);
            fetchMenu();
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Gagal menghapus menu");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold">Menu</h2>
                        <p className="text-muted-foreground mt-1">
                            Kelola menu makanan dan minuman
                        </p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Menu
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari menu..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                {kategoris.map((kat) => (
                                    <Button
                                        key={kat}
                                        variant={
                                            selectedKategori === kat
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() => setSelectedKategori(kat)}
                                        className="capitalize"
                                    >
                                        {kat}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Menu Grid */}
                {loading ? (
                    <p className="text-center py-8 text-muted-foreground">
                        Memuat data...
                    </p>
                ) : filteredMenu.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                        Tidak ada menu ditemukan
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMenu.map((item) => (
                            <Card
                                key={item.id}
                                className="hover:shadow-lg transition-shadow"
                            >
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">
                                                {item.nama}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground capitalize mt-1">
                                                {item.kategori}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                item.tersedia
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {item.tersedia
                                                ? "Tersedia"
                                                : "Habis"}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {item.deskripsi && (
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {item.deskripsi}
                                        </p>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <p className="text-2xl font-bold text-primary">
                                            Rp{" "}
                                            {item.harga.toLocaleString("id-ID")}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() =>
                                                    handleDelete(item.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
