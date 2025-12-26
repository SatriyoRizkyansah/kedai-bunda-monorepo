import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, AlertCircle, ArrowRightLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id!)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Konversi" : "Tambah Konversi"}</DialogTitle>
          </DialogHeader>
          {errorMessage && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-md flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">{errorMessage}</div>
            </div>
          )}
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Hapus Konversi</DialogTitle>
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
