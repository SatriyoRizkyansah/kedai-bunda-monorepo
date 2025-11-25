import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { LoadingScreen } from "../components/LoadingScreen";
import { Search, Layers, Pencil, Trash2, Plus } from "lucide-react";
import api from "../lib/api";
import type { KomposisiMenu, Menu, BahanBaku } from "../lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";

interface GroupedKomposisi {
  menu: Menu;
  komposisi: KomposisiMenu[];
}

export const KomposisiMenuPage = () => {
  const [groupedKomposisi, setGroupedKomposisi] = useState<GroupedKomposisi[]>([]);
  const [filteredKomposisi, setFilteredKomposisi] = useState<GroupedKomposisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog & form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KomposisiMenu | null>(null);
  const [formData, setFormData] = useState({ menu_id: "", bahan_baku_id: "", jumlah: "", satuan: "" });

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);

  // Lists
  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [bahanList, setBahanList] = useState<BahanBaku[]>([]);

  useEffect(() => {
    fetchKomposisi();
    fetchMenus();
    fetchBahanList();
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
      // handled via console; UI will show empty state
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
  const fetchMenus = async () => {
    try {
      const res = await api.get("/menu");
      setMenuList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching menus", err);
    }
  };

  const fetchBahanList = async () => {
    try {
      const res = await api.get("/bahan-baku");
      setBahanList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching bahan baku", err);
    }
  };

  const handleDelete = async (id: number) => {
    setConfirmTargetId(id);
    setConfirmOpen(true);
  };

  const performDelete = async (id: number) => {
    try {
      await api.delete(`/komposisi-menu/${id}`);
      setConfirmOpen(false);
      setConfirmTargetId(null);
      fetchKomposisi();
    } catch (error) {
      console.error("Error deleting komposisi:", error);
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  const handleOpenDialog = (item?: KomposisiMenu) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        menu_id: item.menu_id.toString(),
        bahan_baku_id: item.bahan_baku_id.toString(),
        jumlah: item.jumlah.toString(),
        satuan: item.satuan || "",
      });
    } else {
      setEditingItem(null);
      setFormData({ menu_id: "", bahan_baku_id: "", jumlah: "", satuan: "" });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({ menu_id: "", bahan_baku_id: "", jumlah: "", satuan: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        menu_id: parseInt(formData.menu_id),
        bahan_baku_id: parseInt(formData.bahan_baku_id),
        jumlah: parseFloat(formData.jumlah),
        satuan: formData.satuan,
      };

      if (editingItem) {
        await api.put(`/komposisi-menu/${editingItem.id}`, payload);
      } else {
        await api.post(`/komposisi-menu`, payload);
      }
      handleCloseDialog();
      fetchKomposisi();
    } catch (err) {
      console.error("Error saving komposisi:", err);
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
          <Button onClick={() => handleOpenDialog()} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" style={{ boxShadow: "var(--shadow-md)", borderRadius: "var(--radius)", fontFamily: "var(--font-sans)" }}>
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
          <LoadingScreen message="Memuat komposisi menu..." size="md" />
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
                            <Badge variant="secondary">{item.bahan_baku?.satuan_dasar || "-"}</Badge>
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

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Komposisi" : "Tambah Komposisi"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Menu <span className="text-destructive">*</span>
                  </label>
                  <select value={formData.menu_id} onChange={(e) => setFormData({ ...formData, menu_id: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background">
                    <option value="">Pilih menu</option>
                    {menuList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Bahan Baku <span className="text-destructive">*</span>
                  </label>
                  <select value={formData.bahan_baku_id} onChange={(e) => setFormData({ ...formData, bahan_baku_id: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background">
                    <option value="">Pilih bahan baku</option>
                    {bahanList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nama} ({b.satuan_dasar})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Jumlah <span className="text-destructive">*</span>
                    </label>
                    <Input type="number" step="0.01" value={formData.jumlah} onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Satuan <span className="text-destructive">*</span>
                    </label>
                    <Input value={formData.satuan} onChange={(e) => setFormData({ ...formData, satuan: e.target.value })} required />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Batal
                </Button>
                <Button type="submit">{editingItem ? "Update" : "Simpan"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirm Delete Dialog */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Hapus Komposisi</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin menghapus komposisi ini? Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Batal
              </Button>
              <Button onClick={() => confirmTargetId && performDelete(confirmTargetId)} variant="destructive">
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};
