import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Menu } from "@/lib/types";
import { Plus, Search, Pencil, Trash2, UtensilsCrossed } from "lucide-react";

export function MenuPage() {
  const [menu, setMenu] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string>("semua");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Menu | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    kategori: "makanan",
    harga: "",
    deskripsi: "",
    tersedia: true,
  });

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

  const kategoris = ["semua", ...Array.from(new Set(menu.map((m) => m.kategori)))];

  const filteredMenu = menu.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori = selectedKategori === "semua" || item.kategori === selectedKategori;
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

  const handleOpenDialog = (item?: Menu) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nama: item.nama,
        kategori: item.kategori,
        harga: (item.harga_jual || item.harga || 0).toString(),
        deskripsi: item.deskripsi || "",
        tersedia: item.tersedia,
      });
    } else {
      setEditingItem(null);
      setFormData({
        nama: "",
        kategori: "makanan",
        harga: "0",
        deskripsi: "",
        tersedia: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nama: formData.nama,
      kategori: formData.kategori,
      harga_jual: parseFloat(formData.harga),
      deskripsi: formData.deskripsi,
      tersedia: formData.tersedia,
    };

    try {
      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, payload);
        alert("Menu berhasil diupdate");
      } else {
        await api.post("/menu", payload);
        alert("Menu berhasil ditambahkan");
      }
      handleCloseDialog();
      fetchMenu();
    } catch (error: any) {
      console.error("Error saving:", error);
      alert(error.response?.data?.pesan || "Gagal menyimpan data");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Menu</h2>
            <p className="text-muted-foreground mt-2">Kelola menu makanan dan minuman</p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="gap-2"
            style={{
              boxShadow: "var(--shadow-md)",
            }}
          >
            <Plus className="h-4 w-4" />
            Tambah Menu
          </Button>
        </div>

        {/* Filters */}
        <Card
          style={{
            boxShadow: "var(--shadow-sm)",
            borderRadius: "var(--radius)",
          }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{
                    borderRadius: "calc(var(--radius) - 2px)",
                  }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {kategoris.map((kat) => (
                  <Button
                    key={kat}
                    variant={selectedKategori === kat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedKategori(kat)}
                    className="capitalize"
                    style={{
                      borderRadius: "calc(var(--radius) - 2px)",
                    }}
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
          <LoadingScreen message="Memuat data menu..." size="md" />
        ) : filteredMenu.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{searchTerm ? "Tidak ada hasil pencarian" : "Belum ada menu tersedia"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-all duration-300 border-border group"
                style={{
                  boxShadow: "var(--shadow-sm)",
                  borderRadius: "var(--radius)",
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">{item.nama}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize mt-1">{item.kategori}</p>
                    </div>
                    <Badge
                      variant={item.tersedia ? "success" : "destructive"}
                      style={{
                        borderRadius: "calc(var(--radius) - 2px)",
                      }}
                    >
                      {item.tersedia ? "Tersedia" : "Habis"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.deskripsi && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.deskripsi}</p>}
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <p className="text-2xl font-bold text-primary">Rp {Number(item.harga_jual || item.harga || 0).toLocaleString("id-ID")}</p>
                    <div className="flex gap-2">
                      <Button onClick={() => handleOpenDialog(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog Form */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Menu" : "Tambah Menu"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="nama" className="text-sm font-medium">
                    Nama Menu <span className="text-destructive">*</span>
                  </label>
                  <Input id="nama" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: Nasi Goreng Spesial" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="kategori" className="text-sm font-medium">
                      Kategori <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="kategori"
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="makanan">Makanan</option>
                      <option value="minuman">Minuman</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="harga" className="text-sm font-medium">
                      Harga <span className="text-destructive">*</span>
                    </label>
                    <Input id="harga" type="number" step="0.01" min="0" value={formData.harga} onChange={(e) => setFormData({ ...formData, harga: e.target.value })} required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="deskripsi" className="text-sm font-medium">
                    Deskripsi
                  </label>
                  <Input id="deskripsi" value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} placeholder="Deskripsi menu (opsional)" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="tersedia" checked={formData.tersedia} onChange={(e) => setFormData({ ...formData, tersedia: e.target.checked })} className="h-4 w-4" />
                  <label htmlFor="tersedia" className="text-sm font-medium">
                    Tersedia
                  </label>
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
      </div>
    </DashboardLayout>
  );
}
