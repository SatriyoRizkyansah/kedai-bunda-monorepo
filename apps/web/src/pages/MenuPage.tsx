import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Menu } from "@/lib/types";
import { Plus, Search, Pencil, Trash2, UtensilsCrossed, PackagePlus, History, Link2, Unlink } from "lucide-react";
import { notify } from "@/lib/notify";

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
    stok: "0",
    kelola_stok_mandiri: true,
  });

  // State untuk tambah stok menu
  const [stokDialogOpen, setStokDialogOpen] = useState(false);
  const [stokItem, setStokItem] = useState<Menu | null>(null);
  const [stokFormData, setStokFormData] = useState({
    jumlah: "",
    keterangan: "",
  });

  // State untuk histori stok menu
  const [historiDialogOpen, setHistoriDialogOpen] = useState(false);
  const [historiItem, setHistoriItem] = useState<Menu | null>(null);
  const [stokLogs, setStokLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // State untuk confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);

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
    setConfirmTargetId(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!confirmTargetId) return;
    try {
      await api.delete(`/menu/${confirmTargetId}`);
      setConfirmOpen(false);
      setConfirmTargetId(null);
      fetchMenu();
    } catch (error) {
      console.error("Error deleting:", error);
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
        stok: (item.stok || 0).toString(),
        kelola_stok_mandiri: item.kelola_stok_mandiri ?? true,
      });
    } else {
      setEditingItem(null);
      setFormData({
        nama: "",
        kategori: "makanan",
        harga: "0",
        deskripsi: "",
        tersedia: true,
        stok: "0",
        kelola_stok_mandiri: true,
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
      stok: parseFloat(formData.stok),
      kelola_stok_mandiri: formData.kelola_stok_mandiri,
    };

    try {
      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, payload);
        notify.success("Menu berhasil diupdate");
      } else {
        await api.post("/menu", payload);
        notify.success("Menu berhasil ditambahkan");
      }
      handleCloseDialog();
      fetchMenu();
    } catch (error: any) {
      console.error("Error saving:", error);
      notify.error(error?.response?.data?.pesan || "Gagal menyimpan menu");
    }
  };

  // Handler untuk tambah stok menu
  const handleOpenStokDialog = (item: Menu) => {
    if (!item.kelola_stok_mandiri) {
      return; // Tidak bisa tambah stok jika terhubung ke bahan baku
    }
    setStokItem(item);
    setStokFormData({ jumlah: "", keterangan: "" });
    setStokDialogOpen(true);
  };

  const handleTambahStok = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stokItem) return;

    try {
      await api.post(`/menu/${stokItem.id}/tambah-stok`, {
        jumlah: parseFloat(stokFormData.jumlah),
        keterangan: stokFormData.keterangan || `Penambahan stok ${stokItem.nama}`,
      });
      setStokDialogOpen(false);
      setStokItem(null);
      fetchMenu();
    } catch (error: any) {
      console.error("Error tambah stok:", error);
    }
  };

  // Handler untuk histori stok menu
  const handleOpenHistori = async (item: Menu) => {
    setHistoriItem(item);
    setLoadingLogs(true);
    setHistoriDialogOpen(true);

    try {
      const response = await api.get(`/menu/${item.id}/stok-log`);
      setStokLogs(response.data.data?.data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setStokLogs([]);
    } finally {
      setLoadingLogs(false);
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
                    <div className="flex flex-col gap-1 items-end">
                      <Badge
                        variant={item.tersedia ? "success" : "destructive"}
                        style={{
                          borderRadius: "calc(var(--radius) - 2px)",
                        }}
                      >
                        {item.tersedia ? "Tersedia" : "Habis"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs gap-1"
                        style={{
                          borderRadius: "calc(var(--radius) - 2px)",
                        }}
                      >
                        {item.kelola_stok_mandiri ? (
                          <>
                            <Unlink className="h-3 w-3" />
                            Manual
                          </>
                        ) : (
                          <>
                            <Link2 className="h-3 w-3" />
                            Bahan Baku
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.deskripsi && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.deskripsi}</p>}

                  {/* Info Stok */}
                  <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md mb-4">
                    <span className="text-sm text-muted-foreground">Stok:</span>
                    <span className="font-semibold text-foreground">{Number(item.stok_efektif ?? item.stok ?? 0).toFixed(0)} porsi</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <p className="text-2xl font-bold text-primary">Rp {Number(item.harga_jual || item.harga || 0).toLocaleString("id-ID")}</p>
                    <div className="flex gap-1">
                      {item.kelola_stok_mandiri && (
                        <Button onClick={() => handleOpenStokDialog(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-500/10 hover:text-green-600" title="Tambah Stok">
                          <PackagePlus className="h-4 w-4" />
                        </Button>
                      )}
                      <Button onClick={() => handleOpenHistori(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600" title="Riwayat Stok">
                        <History className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleOpenDialog(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)} title="Hapus">
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

                {/* Mode Stok */}
                <div className="grid gap-3 p-4 border border-border rounded-lg bg-muted/30">
                  <label className="text-sm font-medium">Mode Pengelolaan Stok</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="kelola_stok" checked={formData.kelola_stok_mandiri} onChange={() => setFormData({ ...formData, kelola_stok_mandiri: true })} className="h-4 w-4" />
                      <span className="text-sm flex items-center gap-1">
                        <Unlink className="h-3 w-3" />
                        Stok Manual
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="kelola_stok" checked={!formData.kelola_stok_mandiri} onChange={() => setFormData({ ...formData, kelola_stok_mandiri: false })} className="h-4 w-4" />
                      <span className="text-sm flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        Terhubung Bahan Baku
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">{formData.kelola_stok_mandiri ? "Stok dikelola manual, tidak terhubung dengan bahan baku." : "Stok dihitung otomatis dari ketersediaan bahan baku."}</p>
                </div>

                {/* Stok Awal (hanya jika manual) */}
                {formData.kelola_stok_mandiri && (
                  <div className="grid gap-2">
                    <label htmlFor="stok" className="text-sm font-medium">
                      Stok Awal
                    </label>
                    <Input id="stok" type="number" step="1" min="0" value={formData.stok} onChange={(e) => setFormData({ ...formData, stok: e.target.value })} placeholder="Jumlah stok awal" />
                  </div>
                )}

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

        {/* Dialog Tambah Stok Menu */}
        <Dialog open={stokDialogOpen} onOpenChange={setStokDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Tambah Stok Menu</DialogTitle>
              <DialogDescription>
                {stokItem?.nama} - Stok saat ini: {Number(stokItem?.stok || 0)} porsi
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleTambahStok}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="jumlah_stok_menu" className="text-sm font-medium">
                    Jumlah Tambah <span className="text-destructive">*</span>
                  </label>
                  <Input id="jumlah_stok_menu" type="number" step="1" min="1" value={stokFormData.jumlah} onChange={(e) => setStokFormData({ ...stokFormData, jumlah: e.target.value })} placeholder="Jumlah porsi" required />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="keterangan_stok_menu" className="text-sm font-medium">
                    Keterangan
                  </label>
                  <Input id="keterangan_stok_menu" value={stokFormData.keterangan} onChange={(e) => setStokFormData({ ...stokFormData, keterangan: e.target.value })} placeholder="Contoh: Produksi pagi" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStokDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <PackagePlus className="h-4 w-4 mr-2" />
                  Tambah Stok
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Histori Stok Menu */}
        <Dialog open={historiDialogOpen} onOpenChange={setHistoriDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Riwayat Stok - {historiItem?.nama}</DialogTitle>
              <DialogDescription>Mode: {historiItem?.kelola_stok_mandiri ? "Stok Manual" : "Terhubung Bahan Baku"}</DialogDescription>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto">
              {loadingLogs ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Memuat riwayat...</p>
                </div>
              ) : stokLogs.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Belum ada riwayat perubahan stok</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Tanggal</th>
                      <th className="text-left py-2">Tipe</th>
                      <th className="text-right py-2">Jumlah</th>
                      <th className="text-right py-2">Stok Akhir</th>
                      <th className="text-left py-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stokLogs.map((log: any) => (
                      <tr key={log.id} className="border-b">
                        <td className="py-2">
                          {new Date(log.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2">
                          <Badge variant={log.tipe === "masuk" ? "success" : "destructive"} className={log.tipe === "masuk" ? "bg-green-500" : ""}>
                            {log.tipe === "masuk" ? "+" : "-"} {log.tipe}
                          </Badge>
                        </td>
                        <td className="text-right py-2 font-medium">
                          {log.tipe === "masuk" ? "+" : "-"}
                          {Number(log.jumlah).toFixed(0)}
                        </td>
                        <td className="text-right py-2">{Number(log.stok_sesudah).toFixed(0)}</td>
                        <td className="py-2 text-muted-foreground">{log.keterangan || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setHistoriDialogOpen(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Konfirmasi Hapus */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
              <DialogDescription>Apakah Anda yakin ingin menghapus menu ini? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={performDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
