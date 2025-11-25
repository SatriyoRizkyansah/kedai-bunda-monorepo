import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Search, Layers, Pencil, Trash2, Plus } from "lucide-react";
import api from "../lib/api";
import type { KomposisiMenu, Menu } from "../lib/types";

interface GroupedKomposisi {
  menu: Menu;
  komposisi: KomposisiMenu[];
}

export const KomposisiMenuPage = () => {
  const [groupedKomposisi, setGroupedKomposisi] = useState<GroupedKomposisi[]>([]);
  const [filteredKomposisi, setFilteredKomposisi] = useState<GroupedKomposisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchKomposisi();
  }, []);

  useEffect(() => {
    filterKomposisi();
  }, [searchQuery, groupedKomposisi]);

  const fetchKomposisi = async () => {
    setLoading(true);
    try {
      const response = await api.get("/komposisi-menu");
      const data = response.data.data || [];
      groupByMenu(data);
    } catch (error) {
      console.error("Error fetching komposisi menu:", error);
      alert("Gagal memuat data komposisi menu");
    } finally {
      setLoading(false);
    }
  };

  const groupByMenu = (data: KomposisiMenu[]) => {
    const grouped: { [key: number]: GroupedKomposisi } = {};

    data.forEach((item) => {
      if (!item.menu_id) return;

      if (!grouped[item.menu_id]) {
        grouped[item.menu_id] = {
          menu: item.menu!,
          komposisi: [],
        };
      }
      grouped[item.menu_id].komposisi.push(item);
    });

    const groupedArray = Object.values(grouped);
    setGroupedKomposisi(groupedArray);
  };

  const filterKomposisi = () => {
    if (!searchQuery) {
      setFilteredKomposisi(groupedKomposisi);
      return;
    }

    const filtered = groupedKomposisi.filter((group) => group.menu.nama.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredKomposisi(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus komposisi ini?")) {
      return;
    }

    try {
      await api.delete(`/komposisi-menu/${id}`);
      alert("Komposisi berhasil dihapus");
      fetchKomposisi();
    } catch (error) {
      console.error("Error deleting komposisi:", error);
      alert("Gagal menghapus komposisi");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-sans)" }}>
              Komposisi Menu
            </h1>
            <p className="text-muted-foreground">Kelola bahan baku yang dibutuhkan untuk setiap menu</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Komposisi
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mb-6" style={{ backgroundColor: "rgb(var(--primary) / 0.05)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" style={{ color: "rgb(var(--primary))" }} />
              Tentang Komposisi Menu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Komposisi menu mendefinisikan bahan baku apa saja yang diperlukan untuk membuat setiap menu. Setiap menu dapat memiliki beberapa bahan dengan jumlah tertentu.</p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Contoh:</strong> Menu "Nasi Goreng" membutuhkan:
              <br />
              • Nasi - 200 gram
              <br />
              • Telur - 1 butir
              <br />• Bawang Merah - 50 gram
            </p>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cari Menu</CardTitle>
            <CardDescription>Temukan komposisi menu dengan mudah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari berdasarkan nama menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {/* Komposisi Groups */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "rgb(var(--primary))" }} />
          </div>
        ) : filteredKomposisi.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{searchQuery ? "Tidak ada menu ditemukan" : "Belum ada komposisi menu"}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredKomposisi.map((group) => (
              <Card key={group.menu.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        {group.menu.nama}
                        <Badge variant="outline">{group.menu.kategori}</Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">{group.komposisi.length} bahan baku diperlukan</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Harga Menu</p>
                      <p className="text-lg font-bold" style={{ color: "rgb(var(--primary))" }}>
                        Rp {Number(group.menu.harga).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bahan Baku</TableHead>
                        <TableHead>Satuan Bahan</TableHead>
                        <TableHead>Jumlah Diperlukan</TableHead>
                        <TableHead>Satuan Komposisi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.komposisi.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.bahan_baku?.nama || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.bahan_baku?.satuan || "-"}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono font-semibold" style={{ color: "rgb(var(--primary))" }}>
                              {Number(item.jumlah).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.satuan}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(item.id!)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
