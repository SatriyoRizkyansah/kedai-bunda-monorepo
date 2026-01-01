import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, AlertCircle, ArrowRightLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LoadingScreen } from "@/components/LoadingScreen";
import api from "@/lib/api";
import type { KonversiBahan, BahanBaku, Satuan } from "@/lib/types";

export function KonversiBahanTab() {
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      const res = await api.get("/konversi-bahan");
      setKonversi(res.data.data || []);
    } catch (err) {
      console.error("Error fetching konversi", err);
    } finally {
      setLoading(false);
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
      await api.delete(`/konversi-bahan/${id}`);
      setConfirmOpen(false);
      setConfirmTargetId(null);
      fetchKonversi();
    } catch (error) {
      console.error("Error deleting konversi:", error);
      setConfirmOpen(false);
      setConfirmTargetId(null);
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
    setErrorMessage(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setErrorMessage(null);
    setFormData({ bahan_baku_id: "", satuan_id: "", jumlah_konversi: "", keterangan: "" });
  };

  const handleBahanBakuChange = (bahanId: string) => {
    setFormData({ ...formData, bahan_baku_id: bahanId });

    // Auto-populate satuan dari bahan baku yang dipilih
    if (bahanId) {
      const selectedBahan = bahanBakuList.find((b) => b.id === parseInt(bahanId));
      if (selectedBahan && selectedBahan.satuan_id && !formData.satuan_id) {
        setFormData((prev) => ({
          ...prev,
          bahan_baku_id: bahanId,
          satuan_id: selectedBahan.satuan_id?.toString() || "",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      if (editingItem) {
        await api.put(`/konversi-bahan/${editingItem.id}`, {
          satuan_id: parseInt(formData.satuan_id, 10),
          jumlah_konversi: parseFloat(formData.jumlah_konversi),
          keterangan: formData.keterangan,
        });
      } else {
        await api.post(`/konversi-bahan`, {
          bahan_baku_id: parseInt(formData.bahan_baku_id, 10),
          satuan_id: parseInt(formData.satuan_id, 10),
          jumlah_konversi: parseFloat(formData.jumlah_konversi),
          keterangan: formData.keterangan,
        });
      }
      handleCloseDialog();
      fetchKonversi();
    } catch (err: any) {
      console.error("Error saving konversi:", err);
      const errorMsg = err?.response?.data?.pesan || err?.response?.data?.message || err?.message || "Gagal menyimpan konversi";
      setErrorMessage(errorMsg);
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
      <Card className="bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📋</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Template Konversi Satuan Bahan Baku</h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                Panduan referensi untuk membantu input stok manual. Contoh: <strong>1 ekor ayam ≈ 8 potong</strong>
              </p>
              <div className="mt-3 space-y-1 text-xs text-blue-600 dark:text-blue-400">
                <p>
                  ✓ Sistem <strong>tidak</strong> otomatis menghitung stok berdasarkan template
                </p>
                <p>✓ Template memberikan saran saat menambah stok secara manual</p>
                <p>✓ Nilai konversi bisa berbeda tiap pembelian (fleksibel sesuai kondisi nyata)</p>
              </div>
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
              <p className="text-muted-foreground mb-2">Belum ada template konversi</p>
              <p className="text-xs text-muted-foreground">Mulai dengan klik tombol "Tambah Konversi" di atas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {konversi.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                >
                  {/* Header */}
                  <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-sm text-foreground">{item.bahan_baku?.nama || "-"}</h3>
                    {item.keterangan && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.keterangan}</p>}
                  </div>

                  {/* Conversion Display */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/10 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">1</span>
                      <span className="text-xs font-medium text-muted-foreground">{item.bahan_baku?.satuan?.nama || item.bahan_baku?.satuan_dasar || "-"}</span>
                    </div>

                    <ArrowRightLeft className="h-4 w-4 text-primary/60" />

                    <div className="flex items-center gap-1 text-right">
                      <span className="text-2xl font-bold text-primary">{Math.floor(Number(item.jumlah_konversi))}</span>
                      <span className="text-xs font-medium text-muted-foreground">{item.satuan?.nama || "-"}</span>
                    </div>
                  </div>

                  {/* Decimal Value (if exists) */}
                  {Number(item.jumlah_konversi) % 1 !== 0 && <p className="text-xs text-muted-foreground text-center mb-3">(Persis: {Number(item.jumlah_konversi).toFixed(2)})</p>}

                  {/* Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button onClick={() => handleOpenDialog(item)} variant="outline" size="sm" className="flex-1 text-xs h-8">
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(item.id!)} variant="outline" size="sm" className="flex-1 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/5">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              {editingItem ? "Edit Template Konversi" : "Tambah Template Konversi Baru"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-2">Definisikan berapa banyak unit konversi dari 1 unit bahan baku</p>
          </DialogHeader>
          {errorMessage && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-md flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">{errorMessage}</div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Bahan Baku */}
              <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <label className="text-sm font-medium text-foreground">
                  Bahan Baku <span className="text-destructive">*</span>
                </label>
                <select value={formData.bahan_baku_id} onChange={(e) => handleBahanBakuChange(e.target.value)} required disabled={!!editingItem} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                  <option value="">Pilih Bahan Baku</option>
                  {bahanBakuList.map((bahan) => (
                    <option key={bahan.id} value={bahan.id}>
                      {bahan.nama} ({bahan.satuan_dasar})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">ℹ️ Satuan konversi akan otomatis mengikuti satuan stok dari bahan baku</p>
              </div>

              {/* Conversion Formula */}
              <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
                <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-3">📏 Rumus Konversi</div>

                {/* From Unit - Full Width */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-2">Dari</label>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm font-semibold">
                    1{" "}
                    {formData.bahan_baku_id ? bahanBakuList.find((b) => b.id === parseInt(formData.bahan_baku_id))?.base_satuan?.nama || bahanBakuList.find((b) => b.id === parseInt(formData.bahan_baku_id))?.satuan_dasar || "unit" : "unit"}
                  </div>
                </div>

                {/* Equals Symbol */}
                <div className="flex justify-center">
                  <div className="text-3xl text-blue-600 dark:text-blue-400">=</div>
                </div>

                {/* To Unit - Full Width */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-2">Menjadi</label>
                  <div className="flex items-center gap-2">
                    <Input type="number" step="0.01" value={formData.jumlah_konversi} onChange={(e) => setFormData({ ...formData, jumlah_konversi: e.target.value })} placeholder="8" required className="text-base font-semibold flex-1" />
                    <select value={formData.satuan_id} onChange={(e) => setFormData({ ...formData, satuan_id: e.target.value })} required className="px-3 py-2 rounded-md border border-input bg-background text-sm font-medium">
                      <option value="">unit</option>
                      {satuanList.map((satuan) => (
                        <option key={satuan.id} value={satuan.id}>
                          {satuan.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Keterangan */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Catatan <span className="text-xs text-muted-foreground">(opsional)</span>
                </label>
                <Input value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} placeholder="contoh: 1 ekor = 8 potong ayam goreng" className="text-sm" />
                <p className="text-xs text-muted-foreground">Deskripsi singkat untuk membantu mengingat template ini</p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Batal
              </Button>
              <Button type="submit">{editingItem ? "Perbarui" : "Simpan Template"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <span className="text-2xl">⚠️</span>
              Hapus Template Konversi
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin menghapus template konversi ini? Tindakan ini tidak bisa dibatalkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => confirmTargetId && performDelete(confirmTargetId)} variant="destructive">
              Ya, Hapus Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
