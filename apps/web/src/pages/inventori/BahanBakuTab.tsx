import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, AlertCircle, Package, PackagePlus, PackageMinus, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { LoadingScreen } from "@/components/LoadingScreen";
import api from "@/lib/api";
import type { BahanBaku, KonversiBahan, Satuan } from "@/lib/types";

export function BahanBakuTab() {
  const [bahanBaku, setBahanBaku] = useState<BahanBaku[]>([]);
  const [satuanList, setSatuanList] = useState<Satuan[]>([]);
  const [_konversiList, setKonversiList] = useState<KonversiBahan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BahanBaku | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const isAdmin = userRole === "admin" || userRole === "super_admin";
  const [formData, setFormData] = useState({
    nama: "",
    satuan_id: "",
    base_satuan_id: "",
    stok_tersedia: "",
    harga_per_satuan: "",
    keterangan: "",
    aktif: true,
  });

  const [stokDialogOpen, setStokDialogOpen] = useState(false);
  const [stokDialogType, setStokDialogType] = useState<"tambah" | "kurang">("tambah");
  const [stokItem, setStokItem] = useState<BahanBaku | null>(null);
  const [stokFormData, setStokFormData] = useState({
    jumlah: "",
    keterangan: "",
    base_jumlah: "",
    base_satuan_id: "",
    harga_beli: "",
  });

  const [historiDialogOpen, setHistoriDialogOpen] = useState(false);
  const [historiItem, setHistoriItem] = useState<BahanBaku | null>(null);
  const [stokLogs, setStokLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [batchEstimates, setBatchEstimates] = useState<{ [key: number]: any }>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);
  const [konversiSuggestions, setKonversiSuggestions] = useState<any[]>([]);
  const [activeKonversi, setActiveKonversi] = useState<any>(null); // Template konversi yang dipilih untuk stok input

  useEffect(() => {
    fetchBahanBaku();
    fetchSatuan();
    fetchKonversi();
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user?.role || "");
  }, []);

  const fetchBahanBaku = async () => {
    setLoading(true);
    try {
      const response = await api.get("/bahan-baku");
      const data = response.data.data || [];
      setBahanBaku(data);

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

  const loadKonversiSuggestions = async (bahanId: number) => {
    try {
      const response = await api.get(`/konversi-bahan/bahan-baku/${bahanId}`);
      setKonversiSuggestions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching konversi suggestions:", error);
      setKonversiSuggestions([]);
    }
  };

  // Cari konversi template berdasarkan nama bahan (untuk tambah baru)
  const loadKonversiSuggestionsByName = (bahanName: string) => {
    if (!bahanName.trim() || !_konversiList.length) {
      setKonversiSuggestions([]);
      return;
    }

    const suggestions = _konversiList.filter((k) => {
      const matchingBahan = bahanBaku.find((b) => b.id === k.bahan_baku_id);
      if (!matchingBahan) return false;
      // Fuzzy match: cek apakah nama bahan yang diinput terdapat di nama existing
      return matchingBahan.nama.toLowerCase().includes(bahanName.toLowerCase()) || bahanName.toLowerCase().includes(matchingBahan.nama.toLowerCase());
    });

    setKonversiSuggestions(suggestions);
  };

  const handleOpenDialog = (item?: BahanBaku) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nama: item.nama,
        satuan_id: item.satuan_id?.toString() || "",
        base_satuan_id: item.base_satuan_id?.toString() || "",
        stok_tersedia: item.stok_tersedia.toString(),
        harga_per_satuan: item.harga_per_satuan?.toString() || "",
        keterangan: item.keterangan || "",
        aktif: item.aktif,
      });
      // Load konversi suggestions untuk bahan yang sedang diedit
      loadKonversiSuggestions(item.id);
    } else {
      setEditingItem(null);
      setFormData({
        nama: "",
        satuan_id: "",
        base_satuan_id: "",
        stok_tersedia: "0",
        harga_per_satuan: "",
        keterangan: "",
        aktif: true,
      });
      setKonversiSuggestions([]);
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
      keterangan: formData.keterangan,
      aktif: formData.aktif,
    };

    // Harga per satuan sekarang opsional (hanya referensi)
    if (formData.harga_per_satuan) {
      payload.harga_per_satuan = parseFloat(formData.harga_per_satuan);
    } else {
      payload.harga_per_satuan = 0;
    }

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

  const handleOpenStokDialog = (item: BahanBaku, type: "tambah" | "kurang") => {
    setStokItem(item);
    setStokDialogType(type);
    setStokFormData({
      jumlah: "",
      keterangan: "",
      base_jumlah: "",
      base_satuan_id: item.base_satuan_id?.toString() || "",
      harga_beli: "",
    });

    // Load konversi template untuk bahan ini jika ada base_satuan
    if (item.id && item.base_satuan_id) {
      const konversi = _konversiList.find((k) => k.bahan_baku_id === item.id);
      setActiveKonversi(konversi || null);
    } else {
      setActiveKonversi(null);
    }

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

    if (stokFormData.base_jumlah && stokFormData.base_satuan_id) {
      payload.base_jumlah = parseFloat(stokFormData.base_jumlah);
      payload.base_satuan_id = parseInt(stokFormData.base_satuan_id);
    }

    if (stokFormData.harga_beli) {
      payload.harga_beli = parseFloat(stokFormData.harga_beli);
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari bahan baku..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2" style={!isAdmin ? { display: "none" } : {}}>
          <Plus className="h-4 w-4" />
          Tambah Bahan Baku
        </Button>
      </div>
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
                  <TableHead className="text-center">Stok</TableHead>
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
                      <TableCell className="text-center">
                        <div className={`font-semibold ${lowStock ? "text-destructive" : "text-foreground"}`}>
                          {Math.floor(Number(item.stok_tersedia || 0))} {item.satuan?.nama || item.satuan_dasar}
                        </div>
                        {item.base_satuan_id && item.base_satuan && (
                          <p className="text-xs text-muted-foreground mt-1">
                            (dari {batchEstimates[item.id]?.estimated_base_remaining || "?"} {item.base_satuan.nama})
                          </p>
                        )}
                      </TableCell>
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
                          {isAdmin && (
                            <>
                              <Button onClick={() => handleOpenStokDialog(item, "tambah")} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-500/10 hover:text-green-600" title="Tambah Stok">
                                <PackagePlus className="h-4 w-4" />
                              </Button>
                              <Button onClick={() => handleOpenStokDialog(item, "kurang")} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-orange-500/10 hover:text-orange-600" title="Kurangi Stok">
                                <PackageMinus className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button onClick={() => handleOpenHistori(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600" title="Riwayat Stok">
                            <History className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button onClick={() => handleOpenDialog(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" title="Hapus" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Bahan Baku" : "Tambah Bahan Baku"}</DialogTitle>
            <DialogDescription>Atur satuan stok dan satuan pembelian. Harga akan di-track saat Anda menambah stok</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Nama Bahan <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formData.nama}
                  onChange={(e) => {
                    setFormData({ ...formData, nama: e.target.value });
                    // Jika tambah baru (bukan edit), cari suggestion berdasarkan nama
                    if (!editingItem) {
                      loadKonversiSuggestionsByName(e.target.value);
                    }
                  }}
                  placeholder="Contoh: Ayam"
                  required
                />
              </div>

              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>💡 Sistem Harga Dinamis:</strong>
                    <br />
                    Harga bahan baku akan di-track otomatis saat Anda menambah stok. Setiap batch bisa memiliki harga yang berbeda. Harga di sini hanya referensi.
                  </p>
                </CardContent>
              </Card>

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
                    Harga Ref/Satuan <span className="text-muted-foreground text-xs">(opsional)</span>
                  </label>
                  <Input type="number" step="0.01" min="0" value={formData.harga_per_satuan} onChange={(e) => setFormData({ ...formData, harga_per_satuan: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Harga referensi saja (harga sebenarnya dari batch saat input)</p>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Keterangan</label>
                <Input value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} placeholder="Keterangan tambahan (opsional)" />
              </div>

              {/* Konversi Suggestions - Saat edit atau tambah baru */}
              {konversiSuggestions.length > 0 && (
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3">📋 Template Konversi {editingItem ? "untuk Bahan Ini" : `untuk "${formData.nama}"`}</p>
                    <div className="space-y-2">
                      {konversiSuggestions.map((suggestion: any) => (
                        <div key={suggestion.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md border border-green-200 dark:border-green-700">
                          <div>
                            <p className="text-sm font-medium">
                              {suggestion.jumlah_konversi} {suggestion.satuan?.nama}
                            </p>
                            {suggestion.keterangan && <p className="text-xs text-muted-foreground">{suggestion.keterangan}</p>}
                          </div>
                          <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                            Template
                          </Badge>
                        </div>
                      ))}
                      ```{" "}
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">Template ini bisa digunakan saat konversi satuan di tab Konversi</p>
                  </CardContent>
                </Card>
              )}
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

      <Dialog open={stokDialogOpen} onOpenChange={setStokDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{stokDialogType === "tambah" ? "Tambah Stok" : "Kurangi Stok"}</DialogTitle>
            <DialogDescription>
              {stokItem?.nama} - Stok saat ini: {Number(stokItem?.stok_tersedia || 0).toFixed(2)} {stokItem?.satuan?.nama || stokItem?.satuan_dasar}
              <br />
              <span className="text-xs text-amber-600 dark:text-amber-400 block mt-1">💰 Input harga di sini untuk tracking HPP yang akurat</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStokSubmit}>
            <div className="grid gap-4 py-4">
              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>📌 Tracking Harga Dinamis:</strong> Harga bahan baku sekarang di-input saat Anda menambah stok, bukan statis di data bahan. Ini memungkinkan tracking HPP yang lebih akurat.
                  </p>
                </CardContent>
              </Card>

              {stokDialogType === "tambah" && stokItem?.base_satuan_id && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">📦 Tracking Bahan Mentah (Opsional)</p>
                  {activeKonversi && (
                    <div className="bg-white dark:bg-gray-800 p-2 rounded mb-2 border border-blue-100 dark:border-blue-900">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        💡 Template: 1 {stokItem.base_satuan?.nama || stokItem.base_satuan?.singkatan} = {activeKonversi.jumlah_konversi} {activeKonversi.satuan?.nama}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium">Jumlah Bahan Mentah</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={stokFormData.base_jumlah}
                        onChange={(e) => {
                          const baseJumlah = parseFloat(e.target.value) || 0;
                          setStokFormData({ ...stokFormData, base_jumlah: e.target.value });

                          // Auto-calculate jumlah simpan berdasarkan template konversi
                          if (activeKonversi && baseJumlah > 0) {
                            const calculatedJumlah = baseJumlah * activeKonversi.jumlah_konversi;
                            setStokFormData((prev) => ({ ...prev, jumlah: calculatedJumlah.toString() }));
                          } else {
                            setStokFormData((prev) => ({ ...prev, jumlah: "" }));
                          }
                        }}
                        placeholder="contoh: 2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Satuan Bahan Mentah</label>
                      <Input value={stokItem.base_satuan?.nama || stokItem.base_satuan?.singkatan || ""} disabled />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Opsional: isi jika ingin catat batch mentah (misal: 2 ekor) agar estimasi sisa batch otomatis.</p>
                </div>
              )}

              <div className="grid gap-2">
                <label className="text-sm font-medium">Jumlah {activeKonversi && stokFormData.base_jumlah && <span className="text-xs text-muted-foreground">(auto dari template)</span>}</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={stokFormData.jumlah}
                  onChange={(e) => setStokFormData({ ...stokFormData, jumlah: e.target.value })}
                  required
                  className={activeKonversi && stokFormData.base_jumlah ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Harga Beli Total</label>
                <Input
                  type="text"
                  min="0"
                  value={stokFormData.harga_beli ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(parseFloat(stokFormData.harga_beli) || 0) : ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    setStokFormData({ ...stokFormData, harga_beli: value });
                  }}
                  placeholder="Rp 0"
                />
                <p className="text-xs text-muted-foreground">Total harga pembelian batch ini. Gunakan ini untuk tracking HPP akurat di laporan keuntungan</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Keterangan</label>
                <Input value={stokFormData.keterangan} onChange={(e) => setStokFormData({ ...stokFormData, keterangan: e.target.value })} placeholder="Alasan penambahan/pengurangan" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStokDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={historiDialogOpen} onOpenChange={setHistoriDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Riwayat Stok: {historiItem?.nama}</DialogTitle>
            <DialogDescription>Histori keluar/masuk stok bahan baku</DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {loadingLogs ? (
              <div className="py-6">
                <LoadingScreen message="Memuat histori..." size="sm" />
              </div>
            ) : stokLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Belum ada histori</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stokLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.created_at).toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <Badge variant={log.tipe === "masuk" ? "success" : log.tipe === "penyesuaian" ? "warning" : "destructive"}>{log.tipe}</Badge>
                      </TableCell>
                      <TableCell>{Number(log.jumlah).toFixed(2)}</TableCell>
                      <TableCell>{log.keterangan}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setHistoriDialogOpen(false)} variant="outline">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Hapus Bahan Baku</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus bahan baku ini?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button onClick={performDelete} variant="destructive">
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
