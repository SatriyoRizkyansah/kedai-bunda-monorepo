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
import { Plus, Pencil, Trash2, Search, AlertCircle, Package, PackagePlus, PackageMinus, History, ArrowRightLeft, Layers, TrendingDown } from "lucide-react";

// ===================== BAHAN BAKU TAB =====================
function BahanBakuTab() {
  const [bahanBaku, setBahanBaku] = useState<BahanBaku[]>([]);
  const [satuanList, setSatuanList] = useState<Satuan[]>([]);
  const [konversiList, setKonversiList] = useState<KonversiBahan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BahanBaku | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    satuan_id: "",
    base_satuan_id: "",
    stok_tersedia: "",
    harga_per_satuan: "",
    keterangan: "",
    aktif: true,
  });

  // State untuk stok dialog
  const [stokDialogOpen, setStokDialogOpen] = useState(false);
  const [stokDialogType, setStokDialogType] = useState<"tambah" | "kurang">("tambah");
  const [stokItem, setStokItem] = useState<BahanBaku | null>(null);
  const [stokFormData, setStokFormData] = useState({
    jumlah: "",
    keterangan: "",
    base_jumlah: "",
    base_satuan_id: "",
  });

  // State untuk histori stok
  const [historiDialogOpen, setHistoriDialogOpen] = useState(false);
  const [historiItem, setHistoriItem] = useState<BahanBaku | null>(null);
  const [stokLogs, setStokLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // State untuk tracking batch estimates
  const [batchEstimates, setBatchEstimates] = useState<{ [key: number]: any }>({});

  // State untuk confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);

  useEffect(() => {
    fetchBahanBaku();
    fetchSatuan();
    fetchKonversi(); // Still fetch for template suggestions
  }, []);

  const fetchBahanBaku = async () => {
    setLoading(true);
    try {
      const response = await api.get("/bahan-baku");
      const data = response.data.data || [];
      setBahanBaku(data);

      // Fetch batch estimates untuk setiap bahan dengan tracking
      const estimates: { [key: number]: any } = {};
      for (const bahan of data) {
        if (bahan.base_satuan_id) {
          try {
            const batchRes = await api.get(`/bahan-baku/${bahan.id}/batch-tracking`);
            estimates[bahan.id] = batchRes.data.data?.summary || null;
          } catch (err) {
            console.error(`Error fetching batch for ${bahan.id}:`, err);
          }
        }
      }
      setBatchEstimates(estimates);
    } catch (error) {
      console.error("Error fetching bahan baku:", error);
    } finally {
      setLoading(false);
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

  const fetchKonversi = async () => {
    try {
      const response = await api.get("/konversi-bahan");
      setKonversiList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching konversi:", error);
    }
  };

  const filteredBahanBaku = bahanBaku.filter((item) => item.nama.toLowerCase().includes(searchTerm.toLowerCase()));

  const isLowStock = (item: BahanBaku) => Number(item.stok_tersedia || 0) < 10;

  const handleOpenDialog = (item?: BahanBaku) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nama: item.nama,
        satuan_id: item.satuan_id?.toString() || "",
        base_satuan_id: item.base_satuan_id?.toString() || "",
        stok_tersedia: item.stok_tersedia.toString(),
        harga_per_satuan: item.harga_per_satuan.toString(),
        keterangan: item.keterangan || "",
        aktif: item.aktif,
      });
    } else {
      setEditingItem(null);
      setFormData({
        nama: "",
        satuan_id: "",
        base_satuan_id: "",
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
    const payload: any = {
      nama: formData.nama,
      satuan_id: parseInt(formData.satuan_id),
      stok_tersedia: parseFloat(formData.stok_tersedia),
      harga_per_satuan: parseFloat(formData.harga_per_satuan),
      keterangan: formData.keterangan,
      aktif: formData.aktif,
    };

    // Add base_satuan_id if selected (for tracking)
    if (formData.base_satuan_id) {
      payload.base_satuan_id = parseInt(formData.base_satuan_id);
    }

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
    setStokFormData({
      jumlah: "",
      keterangan: "",
      base_jumlah: "",
      base_satuan_id: item.base_satuan_id?.toString() || "",
    });
    setStokDialogOpen(true);
  };

  const handleStokSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stokItem) return;

    const endpoint = stokDialogType === "tambah" ? `/bahan-baku/${stokItem.id}/tambah-stok` : `/bahan-baku/${stokItem.id}/kurangi-stok`;

    const payload: any = {
      jumlah: parseFloat(stokFormData.jumlah),
      keterangan: stokFormData.keterangan || `${stokDialogType === "tambah" ? "Penambahan" : "Pengurangan"} stok ${stokItem.nama}`,
    };

    // Add optional raw material tracking
    if (stokFormData.base_jumlah && stokFormData.base_satuan_id) {
      payload.base_jumlah = parseFloat(stokFormData.base_jumlah);
      payload.base_satuan_id = parseInt(stokFormData.base_satuan_id);
    }

    try {
      await api.post(endpoint, payload);
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
                      <TableCell>
                        <div className={`font-semibold ${lowStock ? "text-destructive" : "text-foreground"}`}>
                          {Math.floor(Number(item.stok_tersedia || 0))} {item.satuan?.nama || item.satuan_dasar}
                        </div>
                        {item.base_satuan_id && item.base_satuan && (
                          <p className="text-xs text-muted-foreground mt-1">
                            (dari {batchEstimates[item.id]?.estimated_base_remaining || "?"} {item.base_satuan.nama})
                          </p>
                        )}
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Bahan Baku" : "Tambah Bahan Baku"}</DialogTitle>
            <DialogDescription>Atur satuan stok dan satuan pembelian untuk tracking yang lebih baik</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Nama Bahan */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Nama Bahan <span className="text-destructive">*</span>
                </label>
                <Input value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: Ayam" required />
              </div>

              {/* Info Box */}
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>💡 Cara Kerja Satuan:</strong>
                    <br />• <strong>Satuan Stok</strong> = Unit penyimpanan (contoh: Potong, Porsi, Gram)
                    <br />• <strong>Satuan Beli</strong> = Unit pembelian mentah (contoh: Ekor, Kg, Liter) - Opsional
                    <br />• Contoh: Stok Ayam dalam <strong>Potong</strong>, tapi beli dalam <strong>Ekor</strong>
                  </p>
                </CardContent>
              </Card>

              {/* Satuan Stok */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  1. Satuan Stok (Unit Penyimpanan) <span className="text-destructive">*</span>
                </label>
                <select value={formData.satuan_id} onChange={(e) => setFormData({ ...formData, satuan_id: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background" required>
                  <option value="">-- Pilih satuan stok --</option>
                  {satuanList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.singkatan})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Unit untuk menyimpan stok. Contoh: Ayam = <strong>Potong</strong>, Nasi = <strong>Porsi</strong>, Bumbu = <strong>Gram</strong>
                </p>
              </div>

              {/* Satuan Beli (Base) - Optional */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">2. Satuan Beli / Bahan Mentah (Opsional untuk Tracking)</label>
                <select value={formData.base_satuan_id} onChange={(e) => setFormData({ ...formData, base_satuan_id: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background">
                  <option value="">-- Tidak perlu tracking bahan mentah --</option>
                  {satuanList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.singkatan})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Jika beda dengan satuan stok, pilih di sini. Contoh: Ayam stok <strong>Potong</strong> tapi beli <strong>Ekor</strong>
                </p>
                {formData.base_satuan_id && formData.satuan_id && formData.base_satuan_id !== formData.satuan_id && (
                  <div className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-2 rounded-md border border-green-200 dark:border-green-800">
                    ✓ Tracking aktif: Beli dalam {satuanList.find((s) => s.id === parseInt(formData.base_satuan_id))?.nama}, simpan dalam {satuanList.find((s) => s.id === parseInt(formData.satuan_id))?.nama}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Stok Awal <span className="text-destructive">*</span>
                  </label>
                  <Input type="number" step="0.01" min="0" value={formData.stok_tersedia} onChange={(e) => setFormData({ ...formData, stok_tersedia: e.target.value })} required />
                  <p className="text-xs text-muted-foreground">Dalam satuan: {satuanList.find((s) => s.id === parseInt(formData.satuan_id))?.nama || "stok"}</p>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Harga/Satuan <span className="text-destructive">*</span>
                  </label>
                  <Input type="number" step="0.01" min="0" value={formData.harga_per_satuan} onChange={(e) => setFormData({ ...formData, harga_per_satuan: e.target.value })} required />
                  <p className="text-xs text-muted-foreground">Per {satuanList.find((s) => s.id === parseInt(formData.satuan_id))?.nama || "satuan"}</p>
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
      {/* Dialog Tambah/Kurangi Stok */} {/* Dialog Tambah/Kurangi Stok */}
      <Dialog open={stokDialogOpen} onOpenChange={setStokDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{stokDialogType === "tambah" ? "Tambah Stok" : "Kurangi Stok"}</DialogTitle>
            <DialogDescription>
              {stokItem?.nama} - Stok saat ini: {Number(stokItem?.stok_tersedia || 0).toFixed(2)} {stokItem?.satuan?.nama || stokItem?.satuan_dasar}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStokSubmit}>
            <div className="grid gap-4 py-4">
              {/* Optional: Raw material tracking (e.g., bought 2 ekor) */}
              {stokDialogType === "tambah" && stokItem?.base_satuan_id && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">📦 Tracking Bahan Mentah (Opsional)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={stokFormData.base_jumlah}
                        onChange={(e) => {
                          setStokFormData({ ...stokFormData, base_jumlah: e.target.value });
                          // Auto-suggest conversion if template exists
                          const template = konversiList.find((k) => k.bahan_baku_id === stokItem.id);
                          if (template && e.target.value) {
                            const suggested = parseFloat(e.target.value) * Number(template.jumlah_konversi);
                            if (!stokFormData.jumlah) {
                              setStokFormData((prev) => ({ ...prev, jumlah: suggested.toFixed(2), base_jumlah: e.target.value }));
                            }
                          }
                        }}
                        placeholder={`Jumlah ${satuanList.find((s) => s.id === stokItem.base_satuan_id)?.nama || "bahan"}`}
                        className="h-9"
                      />
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {satuanList.find((s) => s.id === stokItem.base_satuan_id)?.nama || "satuan"}
                      {konversiList.find((k) => k.bahan_baku_id === stokItem.id) && (
                        <span className="ml-1 text-blue-600 dark:text-blue-400">
                          (≈ {konversiList.find((k) => k.bahan_baku_id === stokItem.id)?.jumlah_konversi} {stokItem.satuan?.nama})
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Contoh: Beli 2 ekor, jadi berapa potong?</p>
                </div>
              )}

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
                  placeholder={`Jumlah dalam ${stokItem?.satuan?.nama || stokItem?.satuan_dasar || "satuan"}`}
                  required
                />
                <p className="text-xs text-muted-foreground">Jumlah final yang akan ditambahkan ke stok</p>
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
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {log.tipe === "masuk" ? "+" : "-"}
                            {Number(log.jumlah).toFixed(2)}
                          </div>
                          {/* Show raw material tracking if available */}
                          {log.base_jumlah && log.base_satuan && (
                            <div className="text-xs text-muted-foreground">
                              📦 {Number(log.base_jumlah).toFixed(2)} {log.base_satuan.nama} → {Number(log.jumlah).toFixed(2)} {historiItem?.satuan?.nama || historiItem?.satuan_dasar}
                            </div>
                          )}
                        </div>
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
  const [formData, setFormData] = useState({ menu_id: "", bahan_baku_id: "", jumlah: "", satuan_id: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);

  // State untuk inline add form di setiap menu card
  const [addingToMenuId, setAddingToMenuId] = useState<number | null>(null);
  const [inlineFormData, setInlineFormData] = useState({ bahan_baku_id: "", jumlah: "", satuan_id: "" });
  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [bahanBakuList, setBahanBakuList] = useState<BahanBaku[]>([]);
  const [satuanList, setSatuanList] = useState<Satuan[]>([]);

  useEffect(() => {
    fetchKomposisi();
    fetchMenus();
    fetchBahanBaku();
    fetchSatuan();
  }, []);

  useEffect(() => {
    filterKomposisi();
  }, [searchQuery, groupedKomposisi]);

  // Re-group when menuList changes to include empty menus
  useEffect(() => {
    if (menuList.length > 0) {
      // Re-trigger grouping with current komposisi data
      fetchKomposisi();
    }
  }, [menuList.length]);

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

    // First, add all menus with their existing compositions
    data.forEach((item) => {
      if (!item.menu_id) return;
      if (!grouped[item.menu_id]) {
        grouped[item.menu_id] = { menu: item.menu!, komposisi: [] };
      }
      grouped[item.menu_id].komposisi.push(item);
    });

    // Then, add menus without any composition yet
    menuList.forEach((menu) => {
      if (!grouped[menu.id]) {
        grouped[menu.id] = { menu: menu, komposisi: [] };
      }
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

  const fetchBahanBaku = async () => {
    try {
      const res = await api.get("/bahan-baku");
      setBahanBakuList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching bahan baku", err);
    }
  };

  const fetchSatuan = async () => {
    try {
      const res = await api.get("/satuan");
      setSatuanList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching satuan", err);
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
        bahan_baku_id: item.bahan_baku_id.toString(),
        jumlah: item.jumlah.toString(),
        satuan_id: item.satuan_id ? item.satuan_id.toString() : "",
      });
    } else {
      setEditingItem(null);
      setFormData({ menu_id: "", bahan_baku_id: "", jumlah: "", satuan_id: "" });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({ menu_id: "", bahan_baku_id: "", jumlah: "", satuan_id: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: {
        menu_id: number;
        bahan_baku_id: number;
        jumlah: number;
        satuan_id?: number;
      } = {
        menu_id: parseInt(formData.menu_id, 10),
        bahan_baku_id: parseInt(formData.bahan_baku_id, 10),
        jumlah: parseFloat(formData.jumlah),
      };

      if (formData.satuan_id) {
        payload.satuan_id = parseInt(formData.satuan_id, 10);
      }

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

  const handleBahanChange = (bahanId: string) => {
    const selected = bahanBakuList.find((bahan) => bahan.id.toString() === bahanId);
    setFormData((prev) => ({
      ...prev,
      bahan_baku_id: bahanId,
      satuan_id: selected?.satuan_id ? selected.satuan_id.toString() : "",
    }));
  };

  // Handler untuk inline form
  const handleStartAddingToMenu = (menuId: number) => {
    setAddingToMenuId(menuId);
    setInlineFormData({ bahan_baku_id: "", jumlah: "", satuan_id: "" });
  };

  const handleCancelInlineAdd = () => {
    setAddingToMenuId(null);
    setInlineFormData({ bahan_baku_id: "", jumlah: "", satuan_id: "" });
  };

  const handleInlineBahanChange = (bahanId: string) => {
    const selected = bahanBakuList.find((bahan) => bahan.id.toString() === bahanId);
    setInlineFormData({
      bahan_baku_id: bahanId,
      jumlah: "",
      satuan_id: selected?.satuan_id ? selected.satuan_id.toString() : "",
    });
  };

  const handleInlineSubmit = async (menuId: number) => {
    if (!inlineFormData.bahan_baku_id || !inlineFormData.jumlah) return;

    try {
      const payload: {
        menu_id: number;
        bahan_baku_id: number;
        jumlah: number;
        satuan_id?: number;
      } = {
        menu_id: menuId,
        bahan_baku_id: parseInt(inlineFormData.bahan_baku_id, 10),
        jumlah: parseFloat(inlineFormData.jumlah),
      };

      if (inlineFormData.satuan_id) {
        payload.satuan_id = parseInt(inlineFormData.satuan_id, 10);
      }

      await api.post(`/komposisi-menu`, payload);
      handleCancelInlineAdd();
      fetchKomposisi();
    } catch (err) {
      console.error("Error saving inline komposisi:", err);
    }
  };

  // Helper: dapatkan nama bahan dari komposisi
  const getBahanNama = (item: KomposisiMenu) => {
    return item.bahan_baku?.nama || "-";
  };

  const getSatuanNama = (item: KomposisiMenu) => {
    return item.satuan?.nama || item.bahan_baku?.satuan?.nama || item.bahan_baku?.satuan_dasar || "-";
  };

  const selectedBahan = formData.bahan_baku_id ? bahanBakuList.find((bahan) => bahan.id.toString() === formData.bahan_baku_id) : undefined;
  const selectedSatuan = formData.satuan_id ? satuanList.find((satuan) => satuan.id.toString() === formData.satuan_id) : selectedBahan?.satuan;

  return (
    <div className="space-y-4">
      {/* Header & Search - NO MORE GLOBAL ADD BUTTON */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Layers className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">Tentang Komposisi Menu</h3>
              <p className="text-xs text-muted-foreground mt-1">Klik tombol "+ Tambah Bahan" di setiap menu untuk menambahkan komposisi. Satuan otomatis mengikuti stok bahan, tetapi bisa diganti jika resep memakai satuan lain.</p>
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
            <p className="text-muted-foreground">{searchQuery ? "Tidak ada menu ditemukan" : "Belum ada menu tersedia"}</p>
            <p className="text-xs text-muted-foreground mt-2">Tambahkan menu terlebih dahulu di halaman Menu</p>
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
                    <CardDescription className="mt-1">
                      {group.komposisi.length === 0 ? <span className="text-muted-foreground italic">Belum ada bahan baku</span> : <span>{group.komposisi.length} bahan baku diperlukan</span>}
                    </CardDescription>
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
                      <TableHead>Kebutuhan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.komposisi.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{getBahanNama(item)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {Number(item.jumlah)} {getSatuanNama(item)}
                          </Badge>
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

                    {/* Inline Add Form Row */}
                    {addingToMenuId === group.menu.id ? (
                      <TableRow className="bg-blue-50/50 dark:bg-blue-900/10">
                        <TableCell colSpan={3} className="py-4">
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              {/* Select Bahan */}
                              <div>
                                <label className="text-xs font-medium mb-1 block">Bahan Baku</label>
                                <select value={inlineFormData.bahan_baku_id} onChange={(e) => handleInlineBahanChange(e.target.value)} className="w-full px-2 py-1.5 text-sm rounded-md border border-input bg-background" required>
                                  <option value="">Pilih bahan...</option>
                                  {bahanBakuList
                                    .filter((b) => !group.komposisi.some((k) => k.bahan_baku_id === b.id))
                                    .map((bahan) => (
                                      <option key={bahan.id} value={bahan.id}>
                                        {bahan.nama}
                                      </option>
                                    ))}
                                </select>
                              </div>

                              {/* Input Jumlah */}
                              <div>
                                <label className="text-xs font-medium mb-1 block">Jumlah</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={inlineFormData.jumlah}
                                  onChange={(e) => setInlineFormData({ ...inlineFormData, jumlah: e.target.value })}
                                  placeholder="0.00"
                                  className="h-8 text-sm"
                                  required
                                />
                              </div>

                              {/* Select Satuan */}
                              <div>
                                <label className="text-xs font-medium mb-1 block">Satuan</label>
                                <select
                                  value={inlineFormData.satuan_id}
                                  onChange={(e) => setInlineFormData({ ...inlineFormData, satuan_id: e.target.value })}
                                  className="w-full px-2 py-1.5 text-sm rounded-md border border-input bg-background"
                                  disabled={!inlineFormData.bahan_baku_id}
                                >
                                  <option value="">Satuan default</option>
                                  {satuanList.map((satuan) => (
                                    <option key={satuan.id} value={satuan.id}>
                                      {satuan.nama}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 justify-end">
                              <Button type="button" variant="outline" size="sm" onClick={handleCancelInlineAdd}>
                                Batal
                              </Button>
                              <Button type="button" size="sm" onClick={() => handleInlineSubmit(group.menu.id)} disabled={!inlineFormData.bahan_baku_id || !inlineFormData.jumlah} className="bg-green-600 hover:bg-green-700">
                                <Plus className="h-3 w-3 mr-1" />
                                Simpan
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-3">
                          <Button variant="outline" size="sm" onClick={() => handleStartAddingToMenu(group.menu.id)} className="gap-2">
                            <Plus className="h-3 w-3" />
                            Tambah Bahan
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog - IMPROVED UX */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Komposisi" : "Tambah Komposisi"}</DialogTitle>
            <DialogDescription>Tentukan bahan baku dan jumlah yang dibutuhkan untuk menu ini</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Step 1: Pilih Menu */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  1. Pilih Menu <span className="text-destructive">*</span>
                </label>
                <select value={formData.menu_id} onChange={(e) => setFormData({ ...formData, menu_id: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background" required disabled={!!editingItem}>
                  <option value="">-- Pilih menu --</option>
                  {menuList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama} ({m.kategori})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Pilih Bahan & Satuan */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    2a. Pilih Bahan Baku <span className="text-destructive">*</span>
                  </label>
                  <select value={formData.bahan_baku_id} onChange={(e) => handleBahanChange(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background" required>
                    <option value="">-- Pilih bahan baku --</option>
                    {bahanBakuList.map((bahan) => (
                      <option key={bahan.id} value={bahan.id}>
                        {bahan.nama} ({bahan.satuan?.nama || bahan.satuan_dasar})
                      </option>
                    ))}
                  </select>
                  {selectedBahan && (
                    <div className="text-xs bg-muted/50 p-2 rounded-md">
                      <span className="font-medium">Satuan stok:</span> {selectedBahan.satuan?.nama || selectedBahan.satuan_dasar}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">2b. Pilih Satuan Pemakaian</label>
                  <select value={formData.satuan_id} onChange={(e) => setFormData({ ...formData, satuan_id: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background" disabled={!selectedBahan}>
                    <option value="">{selectedBahan ? `Gunakan satuan bawaan (${selectedBahan.satuan?.nama || selectedBahan.satuan_dasar || "satuan"})` : "-- Pilih bahan baku terlebih dahulu --"}</option>
                    {satuanList.map((satuan) => (
                      <option key={satuan.id} value={satuan.id}>
                        {satuan.nama} ({satuan.singkatan})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">Biarkan kosong untuk memakai satuan stok bawaan bahan baku.</p>
                </div>
              </div>

              {/* Step 3: Input Jumlah dengan satuan yang jelas */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  3. Jumlah yang Dibutuhkan <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2 items-center">
                  <Input type="number" step="0.01" min="0.01" value={formData.jumlah} onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })} placeholder="1" className="flex-1" required />
                  {(selectedSatuan || selectedBahan) && (
                    <Badge variant="outline" className="px-3 py-2 text-sm whitespace-nowrap">
                      {selectedSatuan?.nama || selectedBahan?.satuan?.nama || selectedBahan?.satuan_dasar || "satuan"}
                    </Badge>
                  )}
                </div>
                {selectedBahan && formData.jumlah && (
                  <div className="text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-md border border-green-200 dark:border-green-800">
                    <span className="font-medium">✓ Hasil:</span> Menu ini butuh{" "}
                    <span className="font-bold">
                      {formData.jumlah} {selectedSatuan?.nama || selectedBahan.satuan?.nama || selectedBahan.satuan_dasar || "satuan"}
                    </span>{" "}
                    {selectedBahan.nama}
                  </div>
                )}
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
              <h3 className="font-medium text-sm">Tentang Template Konversi</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Template konversi adalah panduan/referensi untuk membantu input stok manual. Contoh: 1 ekor ayam ≈ 8 potong. Sistem <strong>tidak</strong> otomatis menghitung stok, tapi template ini akan memberi saran saat menambah stok.
                Nilai konversi bisa berbeda tiap pembelian (misal: hari ini 1 ekor = 6 potong, besok = 8 potong).
              </p>
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
                  <TableHead>Konversi</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {konversi.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.bahan_baku?.nama || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-medium">
                          1 {item.bahan_baku?.satuan?.nama || item.bahan_baku?.satuan_dasar || "-"}
                        </Badge>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-medium">
                          {Math.floor(Number(item.jumlah_konversi))} {item.satuan?.nama || "-"}
                        </Badge>
                      </div>
                      {item.keterangan && <p className="text-xs text-muted-foreground mt-1">{item.keterangan}</p>}
                    </TableCell>
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

// ===================== TRACKING BATCH TAB =====================
function TrackingBatchTab() {
  const [bahanBakuList, setBahanBakuList] = useState<BahanBaku[]>([]);
  const [selectedBahan, setSelectedBahan] = useState<BahanBaku | null>(null);
  const [batchData, setBatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBatch, setLoadingBatch] = useState(false);

  useEffect(() => {
    fetchBahanBaku();
  }, []);

  const fetchBahanBaku = async () => {
    setLoading(true);
    try {
      const response = await api.get("/bahan-baku");
      const list = response.data.data || [];
      // Filter hanya yang punya base_satuan_id (tracking enabled)
      const withTracking = list.filter((b: BahanBaku) => b.base_satuan_id);
      setBahanBakuList(withTracking);

      // Auto-select first item
      if (withTracking.length > 0) {
        handleSelectBahan(withTracking[0]);
      }
    } catch (error) {
      console.error("Error fetching bahan baku:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBahan = async (bahan: BahanBaku) => {
    setSelectedBahan(bahan);
    setLoadingBatch(true);

    try {
      const response = await api.get(`/bahan-baku/${bahan.id}/batch-tracking`);
      setBatchData(response.data.data);
    } catch (error) {
      console.error("Error fetching batch tracking:", error);
      setBatchData(null);
    } finally {
      setLoadingBatch(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Memuat data tracking..." size="md" />;
  }

  if (bahanBakuList.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Belum ada bahan baku dengan tracking bahan mentah</p>
          <p className="text-xs text-muted-foreground mt-2">Aktifkan tracking dengan menambah stok dan isi jumlah bahan mentah (misal: 2 ekor)</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-sm text-blue-700 dark:text-blue-400">Tentang Tracking Batch FIFO</h3>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Sistem melacak setiap pembelian bahan mentah (batch) dan menghitung sisa berdasarkan metode FIFO (First In First Out). Estimasi sisa bahan mentah dihitung proporsional dari stok yang tersisa di setiap batch.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sidebar: Daftar Bahan Baku */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bahan Baku dengan Tracking</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {bahanBakuList.map((bahan) => (
                <button key={bahan.id} onClick={() => handleSelectBahan(bahan)} className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors ${selectedBahan?.id === bahan.id ? "bg-primary/10 border-l-4 border-primary" : ""}`}>
                  <p className="font-medium text-sm">{bahan.nama}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Stok: {Math.floor(Number(bahan.stok_tersedia))} {bahan.satuan?.nama || bahan.satuan_dasar}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content: Batch Detail & Summary */}
        <div className="lg:col-span-2 space-y-4">
          {loadingBatch ? (
            <LoadingScreen message="Memuat detail batch..." size="md" />
          ) : !batchData ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Pilih bahan baku untuk melihat tracking</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Stok Tersedia (Konversi)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {Math.floor(Number(batchData.summary.total_converted_stock))} {batchData.bahan_baku.satuan?.nama || batchData.bahan_baku.satuan_dasar}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Estimasi Sisa Bahan Mentah</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {batchData.summary.estimated_base_remaining} {batchData.summary.base_satuan?.nama || "unit"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {batchData.summary.active_batches} batch aktif dari {batchData.summary.total_batches} total
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Batch History Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Riwayat Batch Pembelian</CardTitle>
                  <CardDescription>Batch diurutkan dari yang terbaru, pengurangan stok menggunakan metode FIFO (batch terlama dikurangi duluan)</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {batchData.batches.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">Belum ada batch tercatat</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Bahan Mentah</TableHead>
                          <TableHead>Hasil Konversi</TableHead>
                          <TableHead className="text-right">Sisa</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batchData.batches.map((batch: any) => {
                          const isActive = batch.jumlah_sisa > 0;
                          const percentRemaining = (batch.jumlah_sisa / batch.jumlah_awal) * 100;
                          const estimatedBaseRemaining = batch.base_jumlah ? (batch.base_jumlah * (batch.jumlah_sisa / batch.jumlah_awal)).toFixed(2) : 0;

                          return (
                            <TableRow key={batch.id} className={!isActive ? "opacity-50" : ""}>
                              <TableCell className="text-sm">
                                {new Date(batch.created_at).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </TableCell>
                              <TableCell>
                                {batch.base_jumlah ? (
                                  <div className="space-y-1">
                                    <Badge variant="outline" className="font-mono">
                                      {Number(batch.base_jumlah).toFixed(2)} {batch.base_satuan?.nama || "unit"}
                                    </Badge>
                                    {isActive && batch.base_jumlah && (
                                      <p className="text-xs text-muted-foreground">
                                        Sisa: ~{estimatedBaseRemaining} {batch.base_satuan?.nama || "unit"}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-medium">
                                    {Number(batch.jumlah_awal).toFixed(2)} {batchData.bahan_baku.satuan?.nama || batchData.bahan_baku.satuan_dasar}
                                  </p>
                                  {batch.base_jumlah && batch.jumlah_awal > 0 && <p className="text-xs text-muted-foreground">Rasio: 1:{(batch.jumlah_awal / batch.base_jumlah).toFixed(2)}</p>}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="space-y-1">
                                  <p className={`font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{Number(batch.jumlah_sisa).toFixed(2)}</p>
                                  {isActive && <p className="text-xs text-muted-foreground">{percentRemaining.toFixed(0)}%</p>}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">{isActive ? <Badge className="bg-green-500 text-white hover:bg-green-600">Aktif</Badge> : <Badge variant="secondary">Habis</Badge>}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
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
          <p className="text-muted-foreground mt-2">Kelola bahan baku, tracking batch FIFO, komposisi menu, dan konversi satuan</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bahan-baku" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="bahan-baku" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Bahan Baku</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Tracking</span>
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

          <TabsContent value="tracking">
            <TrackingBatchTab />
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
