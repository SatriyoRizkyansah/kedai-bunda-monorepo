import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { BahanBaku, KonversiBahan, KomposisiMenu, Menu, Satuan } from "@/lib/types";
import { Plus, Pencil, Trash2, Search, AlertCircle, Package, PackagePlus, PackageMinus, History, ArrowRightLeft, Layers } from "lucide-react";

// ===================== BAHAN BAKU TAB =====================
function BahanBakuTab() {
  const [bahanBaku, setBahanBaku] = useState<BahanBaku[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BahanBaku | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    satuan_dasar: "",
    stok_tersedia: "",
    harga_per_satuan: "",
    keterangan: "",
    aktif: true,
  });

  // State untuk stok dialog
  const [stokDialogOpen, setStokDialogOpen] = useState(false);
  const [stokDialogType, setStokDialogType] = useState<"tambah" | "kurang">("tambah");
  const [stokItem, setStokItem] = useState<BahanBaku | null>(null);
  const [stokFormData, setStokFormData] = useState({ jumlah: "", keterangan: "" });

  // State untuk histori stok
  const [historiDialogOpen, setHistoriDialogOpen] = useState(false);
  const [historiItem, setHistoriItem] = useState<BahanBaku | null>(null);
  const [stokLogs, setStokLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // State untuk confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);

  useEffect(() => {
    fetchBahanBaku();
  }, []);

  const fetchBahanBaku = async () => {
    setLoading(true);
    try {
      const response = await api.get("/bahan-baku");
      setBahanBaku(response.data.data || []);
    } catch (error) {
      console.error("Error fetching bahan baku:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBahanBaku = bahanBaku.filter((item) => item.nama.toLowerCase().includes(searchTerm.toLowerCase()));

  const isLowStock = (item: BahanBaku) => Number(item.stok_tersedia || 0) < 10;

  const handleOpenDialog = (item?: BahanBaku) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nama: item.nama,
        satuan_dasar: item.satuan_dasar,
        stok_tersedia: item.stok_tersedia.toString(),
        harga_per_satuan: item.harga_per_satuan.toString(),
        keterangan: item.keterangan || "",
        aktif: item.aktif,
      });
    } else {
      setEditingItem(null);
      setFormData({
        nama: "",
        satuan_dasar: "",
        stok_tersedia: "0",
        harga_per_satuan: "0",
        keterangan: "",
        aktif: true,
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
      satuan_dasar: formData.satuan_dasar,
      stok_tersedia: parseFloat(formData.stok_tersedia),
      harga_per_satuan: parseFloat(formData.harga_per_satuan),
      keterangan: formData.keterangan,
      aktif: formData.aktif,
    };

    try {
      if (editingItem) {
        await api.put(`/bahan-baku/${editingItem.id}`, payload);
      } else {
        await api.post("/bahan-baku", payload);
      }
      handleCloseDialog();
      fetchBahanBaku();
    } catch (error: any) {
      console.error("Error saving:", error);
    }
  };

  const handleDelete = (id: number) => {
    setConfirmTargetId(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!confirmTargetId) return;
    try {
      await api.delete(`/bahan-baku/${confirmTargetId}`);
      setConfirmOpen(false);
      setConfirmTargetId(null);
      fetchBahanBaku();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // Handler untuk stok
  const handleOpenStokDialog = (item: BahanBaku, type: "tambah" | "kurang") => {
    setStokItem(item);
    setStokDialogType(type);
    setStokFormData({ jumlah: "", keterangan: "" });
    setStokDialogOpen(true);
  };

  const handleStokSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stokItem) return;

    const endpoint = stokDialogType === "tambah" ? `/bahan-baku/${stokItem.id}/tambah-stok` : `/bahan-baku/${stokItem.id}/kurangi-stok`;

    try {
      await api.post(endpoint, {
        jumlah: parseFloat(stokFormData.jumlah),
        keterangan: stokFormData.keterangan || `${stokDialogType === "tambah" ? "Penambahan" : "Pengurangan"} stok ${stokItem.nama}`,
      });
      setStokDialogOpen(false);
      setStokItem(null);
      fetchBahanBaku();
    } catch (error: any) {
      console.error("Error update stok:", error);
    }
  };

  // Handler untuk histori
  const handleOpenHistori = async (item: BahanBaku) => {
    setHistoriItem(item);
    setLoadingLogs(true);
    setHistoriDialogOpen(true);

    try {
      const response = await api.get(`/bahan-baku/${item.id}/stok-log`);
      setStokLogs(response.data.data?.data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setStokLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari bahan baku..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Bahan Baku
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingScreen message="Memuat data bahan baku..." size="md" />
          ) : filteredBahanBaku.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{searchTerm ? "Tidak ada hasil pencarian" : "Belum ada data bahan baku"}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Bahan</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Harga/Satuan</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBahanBaku.map((item) => {
                  const lowStock = isLowStock(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell className="text-muted-foreground">{item.satuan_dasar}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${lowStock ? "text-destructive" : ""}`}>{Number(item.stok_tersedia || 0).toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-right font-medium">Rp {Number(item.harga_per_satuan || 0).toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-center">
                        {lowStock ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Menipis
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white hover:bg-green-600">Aman</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button onClick={() => handleOpenStokDialog(item, "tambah")} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-500/10 hover:text-green-600" title="Tambah Stok">
                            <PackagePlus className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleOpenStokDialog(item, "kurang")} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-orange-500/10 hover:text-orange-600" title="Kurangi Stok">
                            <PackageMinus className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleOpenHistori(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600" title="Riwayat Stok">
                            <History className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleOpenDialog(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" title="Hapus" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Form Bahan Baku */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Bahan Baku" : "Tambah Bahan Baku"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Nama Bahan <span className="text-destructive">*</span>
                </label>
                <Input value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: Ayam Potong" required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Satuan Dasar <span className="text-destructive">*</span>
                </label>
                <Input value={formData.satuan_dasar} onChange={(e) => setFormData({ ...formData, satuan_dasar: e.target.value })} placeholder="Contoh: ekor, kg, liter" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Stok Tersedia <span className="text-destructive">*</span>
                  </label>
                  <Input type="number" step="0.01" min="0" value={formData.stok_tersedia} onChange={(e) => setFormData({ ...formData, stok_tersedia: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Harga/Satuan <span className="text-destructive">*</span>
                  </label>
                  <Input type="number" step="0.01" min="0" value={formData.harga_per_satuan} onChange={(e) => setFormData({ ...formData, harga_per_satuan: e.target.value })} required />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Keterangan</label>
                <Input value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} placeholder="Keterangan tambahan (opsional)" />
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

      {/* Dialog Tambah/Kurangi Stok */}
      <Dialog open={stokDialogOpen} onOpenChange={setStokDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{stokDialogType === "tambah" ? "Tambah Stok" : "Kurangi Stok"}</DialogTitle>
            <DialogDescription>
              {stokItem?.nama} - Stok saat ini: {Number(stokItem?.stok_tersedia || 0).toFixed(2)} {stokItem?.satuan_dasar}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStokSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Jumlah {stokDialogType === "tambah" ? "Tambah" : "Kurang"} <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={stokDialogType === "kurang" ? Number(stokItem?.stok_tersedia || 0) : undefined}
                  value={stokFormData.jumlah}
                  onChange={(e) => setStokFormData({ ...stokFormData, jumlah: e.target.value })}
                  placeholder={`Jumlah dalam ${stokItem?.satuan_dasar || "satuan"}`}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Keterangan</label>
                <Input
                  value={stokFormData.keterangan}
                  onChange={(e) => setStokFormData({ ...stokFormData, keterangan: e.target.value })}
                  placeholder={stokDialogType === "tambah" ? "Contoh: Pembelian dari supplier" : "Contoh: Bahan rusak/expired"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStokDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className={stokDialogType === "tambah" ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}>
                {stokDialogType === "tambah" ? (
                  <>
                    <PackagePlus className="h-4 w-4 mr-2" />
                    Tambah Stok
                  </>
                ) : (
                  <>
                    <PackageMinus className="h-4 w-4 mr-2" />
                    Kurangi Stok
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Histori Stok */}
      <Dialog open={historiDialogOpen} onOpenChange={setHistoriDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Riwayat Stok - {historiItem?.nama}</DialogTitle>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Stok Akhir</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stokLogs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.tipe === "masuk" ? "default" : "destructive"} className={log.tipe === "masuk" ? "bg-green-500" : ""}>
                          {log.tipe === "masuk" ? "+" : "-"} {log.tipe}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {log.tipe === "masuk" ? "+" : "-"}
                        {Number(log.jumlah).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">{Number(log.stok_sesudah).toFixed(2)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.keterangan || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
            <DialogDescription>Apakah Anda yakin ingin menghapus bahan baku ini? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
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
  );
}

// ===================== KOMPOSISI MENU TAB =====================
function KomposisiMenuTab() {
  interface GroupedKomposisi {
    menu: Menu;
    komposisi: KomposisiMenu[];
  }

  const [groupedKomposisi, setGroupedKomposisi] = useState<GroupedKomposisi[]>([]);
  const [filteredKomposisi, setFilteredKomposisi] = useState<GroupedKomposisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KomposisiMenu | null>(null);
  const [formData, setFormData] = useState({ menu_id: "", konversi_bahan_id: "", jumlah: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);
  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [konversiList, setKonversiList] = useState<KonversiBahan[]>([]);

  useEffect(() => {
    fetchKomposisi();
    fetchMenus();
    fetchKonversi();
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
    } finally {
      setLoading(false);
    }
  };

  const groupByMenu = (data: KomposisiMenu[]) => {
    const grouped: { [key: number]: GroupedKomposisi } = {};

    data.forEach((item) => {
      if (!item.menu_id) return;
      if (!grouped[item.menu_id]) {
        grouped[item.menu_id] = { menu: item.menu!, komposisi: [] };
      }
      grouped[item.menu_id].komposisi.push(item);
    });

    setGroupedKomposisi(Object.values(grouped));
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

  const fetchKonversi = async () => {
    try {
      const res = await api.get("/konversi-bahan");
      setKonversiList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching konversi", err);
    }
  };

  const handleDelete = (id: number) => {
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
        konversi_bahan_id: item.konversi_bahan_id?.toString() || "",
        jumlah: item.jumlah.toString(),
      });
    } else {
      setEditingItem(null);
      setFormData({ menu_id: "", konversi_bahan_id: "", jumlah: "" });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({ menu_id: "", konversi_bahan_id: "", jumlah: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        menu_id: parseInt(formData.menu_id),
        konversi_bahan_id: parseInt(formData.konversi_bahan_id),
        jumlah: parseFloat(formData.jumlah),
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

  // Helper: dapatkan nama bahan dari konversi
  const getBahanNama = (item: KomposisiMenu) => {
    return item.konversi_bahan?.bahan_baku?.nama || item.bahan_baku?.nama || "-";
  };

  const getSatuanNama = (item: KomposisiMenu) => {
    return item.konversi_bahan?.satuan?.nama || item.satuan?.nama || "-";
  };

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Komposisi
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Layers className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">Tentang Komposisi Menu</h3>
              <p className="text-xs text-muted-foreground mt-1">Pilih bahan baku beserta satuannya dari daftar konversi yang sudah ada. Contoh: "Nasi Goreng" butuh 1 porsi Nasi, 1 potong Ayam.</p>
            </div>
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
        <div className="space-y-4">
          {filteredKomposisi.map((group) => (
            <Card key={group.menu.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {group.menu.nama}
                      <Badge variant="outline">{group.menu.kategori}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">{group.komposisi.length} bahan baku diperlukan</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Harga</p>
                    <p className="font-semibold text-primary">Rp {Number(group.menu.harga || group.menu.harga_jual).toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bahan Baku</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Satuan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.komposisi.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{getBahanNama(item)}</TableCell>
                        <TableCell>
                          <span className="font-mono font-semibold text-primary">{Number(item.jumlah).toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getSatuanNama(item)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(item)} className="h-8 w-8 p-0">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id!)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
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

      {/* Add/Edit Dialog - SIMPLIFIED! */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Komposisi" : "Tambah Komposisi"}</DialogTitle>
            <DialogDescription>Pilih menu, lalu pilih bahan (sudah include satuan dari konversi)</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Menu <span className="text-destructive">*</span>
                </label>
                <select value={formData.menu_id} onChange={(e) => setFormData({ ...formData, menu_id: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background" required disabled={!!editingItem}>
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
                  Bahan & Satuan <span className="text-destructive">*</span>
                </label>
                <select value={formData.konversi_bahan_id} onChange={(e) => setFormData({ ...formData, konversi_bahan_id: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background" required>
                  <option value="">Pilih bahan & satuan</option>
                  {konversiList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.bahan_baku?.nama} - {k.satuan?.nama} ({k.keterangan || `1 ${k.bahan_baku?.satuan_dasar} = ${k.jumlah_konversi} ${k.satuan?.singkatan}`})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Tidak ada satuan yang cocok? Tambahkan konversi baru di tab "Konversi"</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Jumlah <span className="text-destructive">*</span>
                </label>
                <Input type="number" step="0.01" min="0.01" value={formData.jumlah} onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })} placeholder="Contoh: 1, 2, 0.5" required />
                <p className="text-xs text-muted-foreground">Jumlah dalam satuan yang dipilih di atas</p>
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
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Hapus Komposisi</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus komposisi ini?</DialogDescription>
          </DialogHeader>
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
  );
}

// ===================== KONVERSI BAHAN TAB =====================
function KonversiBahanTab() {
  const [konversi, setKonversi] = useState<KonversiBahan[]>([]);
  const [bahanBakuList, setBahanBakuList] = useState<BahanBaku[]>([]);
  const [satuanList, setSatuanList] = useState<Satuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KonversiBahan | null>(null);
  const [formData, setFormData] = useState({
    bahan_baku_id: "",
    satuan_id: "",
    jumlah_konversi: "",
    keterangan: "",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);

  useEffect(() => {
    fetchKonversi();
    fetchBahanBaku();
    fetchSatuan();
  }, []);

  const fetchKonversi = async () => {
    setLoading(true);
    try {
      const response = await api.get("/konversi-bahan");
      setKonversi(response.data.data || []);
    } catch (error) {
      console.error("Error fetching konversi:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBahanBaku = async () => {
    try {
      const response = await api.get("/bahan-baku");
      setBahanBakuList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching bahan baku:", error);
    }
  };

  const fetchSatuan = async () => {
    try {
      const response = await api.get("/satuan");
      setSatuanList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching satuan:", error);
    }
  };

  const handleOpenDialog = (item?: KonversiBahan) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        bahan_baku_id: item.bahan_baku_id.toString(),
        satuan_id: item.satuan_id?.toString() || "",
        jumlah_konversi: item.jumlah_konversi.toString(),
        keterangan: item.keterangan || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        bahan_baku_id: "",
        satuan_id: "",
        jumlah_konversi: "",
        keterangan: "",
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
    try {
      if (editingItem) {
        await api.put(`/konversi-bahan/${editingItem.id}`, {
          satuan_id: parseInt(formData.satuan_id),
          jumlah_konversi: parseFloat(formData.jumlah_konversi),
          keterangan: formData.keterangan,
        });
      } else {
        await api.post("/konversi-bahan", {
          bahan_baku_id: parseInt(formData.bahan_baku_id),
          satuan_id: parseInt(formData.satuan_id),
          jumlah_konversi: parseFloat(formData.jumlah_konversi),
          keterangan: formData.keterangan,
        });
      }
      handleCloseDialog();
      fetchKonversi();
    } catch (error: any) {
      console.error("Error saving:", error);
    }
  };

  const handleDelete = (id: number) => {
    setConfirmTargetId(id);
    setConfirmOpen(true);
  };

  const performDelete = async (id: number) => {
    try {
      await api.delete(`/konversi-bahan/${id}`);
      setConfirmOpen(false);
      setConfirmTargetId(null);
      fetchKonversi();
    } catch (error: any) {
      console.error("Error deleting:", error);
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Konversi
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ArrowRightLeft className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">Tentang Konversi Bahan</h3>
              <p className="text-xs text-muted-foreground mt-1">Konversi bahan digunakan untuk mengonversi satuan bahan baku ke satuan yang lebih kecil. Contoh: 1 ekor ayam = 8 potong, 1 kg nasi = 12 porsi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingScreen message="Memuat data konversi..." size="md" />
          ) : konversi.length === 0 ? (
            <div className="text-center py-12">
              <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada konversi bahan</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bahan Baku</TableHead>
                  <TableHead>Satuan Asal</TableHead>
                  <TableHead>Satuan Tujuan</TableHead>
                  <TableHead className="text-right">Nilai Konversi</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {konversi.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.bahan_baku?.nama || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{item.bahan_baku?.satuan_dasar || "-"}</TableCell>
                    <TableCell>{item.satuan?.nama || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-mono">
                        {item.jumlah_konversi}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{item.keterangan || "-"}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button onClick={() => handleOpenDialog(item)} variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Konversi" : "Tambah Konversi"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Bahan Baku <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.bahan_baku_id}
                  onChange={(e) => setFormData({ ...formData, bahan_baku_id: e.target.value })}
                  required
                  disabled={!!editingItem}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="">Pilih Bahan Baku</option>
                  {bahanBakuList.map((bahan) => (
                    <option key={bahan.id} value={bahan.id}>
                      {bahan.nama} ({bahan.satuan_dasar})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Satuan Konversi <span className="text-destructive">*</span>
                </label>
                <select value={formData.satuan_id} onChange={(e) => setFormData({ ...formData, satuan_id: e.target.value })} required className="w-full px-3 py-2 rounded-md border border-input bg-background">
                  <option value="">Pilih Satuan</option>
                  {satuanList.map((satuan) => (
                    <option key={satuan.id} value={satuan.id}>
                      {satuan.nama} ({satuan.singkatan})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Jumlah Konversi <span className="text-destructive">*</span>
                </label>
                <Input type="number" step="0.01" value={formData.jumlah_konversi} onChange={(e) => setFormData({ ...formData, jumlah_konversi: e.target.value })} placeholder="contoh: 8, 12, 1000" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Keterangan</label>
                <Input value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} placeholder="contoh: 1 ekor = 8 potong" />
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
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Hapus Konversi</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus konversi ini?</DialogDescription>
          </DialogHeader>
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
  );
}

// ===================== MAIN PAGE =====================
export function InventoriPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Inventori</h2>
          <p className="text-muted-foreground mt-2">Kelola bahan baku, komposisi menu, dan konversi satuan</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bahan-baku" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="bahan-baku" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Bahan Baku</span>
            </TabsTrigger>
            <TabsTrigger value="komposisi" className="gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Komposisi</span>
            </TabsTrigger>
            <TabsTrigger value="konversi" className="gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Konversi</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bahan-baku">
            <BahanBakuTab />
          </TabsContent>

          <TabsContent value="komposisi">
            <KomposisiMenuTab />
          </TabsContent>

          <TabsContent value="konversi">
            <KonversiBahanTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
