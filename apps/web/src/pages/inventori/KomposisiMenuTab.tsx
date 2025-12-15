import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, AlertCircle, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { LoadingScreen } from "@/components/LoadingScreen";
import api from "@/lib/api";
import type { KomposisiMenu, Menu, BahanBaku, Satuan } from "@/lib/types";

export function KomposisiMenuTab() {
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
  const [addingToMenuId, setAddingToMenuId] = useState<number | null>(null);
  const [inlineFormData, setInlineFormData] = useState({ bahan_baku_id: "", jumlah: "", satuan_id: "" });
  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [bahanBakuList, setBahanBakuList] = useState<BahanBaku[]>([]);
  const [satuanList, setSatuanList] = useState<Satuan[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchKomposisi();
    fetchMenus();
    fetchBahanBaku();
    fetchSatuan();
  }, []);

  useEffect(() => {
    filterKomposisi();
  }, [searchQuery, groupedKomposisi]);

  useEffect(() => {
    if (menuList.length > 0) {
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

    data.forEach((item) => {
      if (!item.menu_id) return;
      if (!grouped[item.menu_id]) {
        grouped[item.menu_id] = { menu: item.menu!, komposisi: [] };
      }
      grouped[item.menu_id].komposisi.push(item);
    });

    menuList.forEach((menu) => {
      if (!grouped[menu.id] && !menu.kelola_stok_mandiri) {
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
    setErrorMessage(null);
    setFormData({ menu_id: "", bahan_baku_id: "", jumlah: "", satuan_id: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
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
    } catch (err: any) {
      console.error("Error saving komposisi:", err);
      const errorMsg = err?.response?.data?.pesan || err?.response?.data?.message || err?.message || "Gagal menyimpan komposisi";
      setErrorMessage(errorMsg);
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

    setErrorMessage(null);
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
    } catch (err: any) {
      console.error("Error saving inline komposisi:", err);
      const errorMsg = err?.response?.data?.pesan || err?.response?.data?.message || err?.message || "Gagal menambahkan komposisi";
      setErrorMessage(errorMsg);
    }
  };

  const getBahanNama = (item: KomposisiMenu) => item.bahan_baku?.nama || "-";
  const getSatuanNama = (item: KomposisiMenu) => item.satuan?.nama || item.bahan_baku?.satuan?.nama || item.bahan_baku?.satuan_dasar || "-";

  const selectedBahan = formData.bahan_baku_id ? bahanBakuList.find((bahan) => bahan.id.toString() === formData.bahan_baku_id) : undefined;
  const selectedSatuan = formData.satuan_id ? satuanList.find((satuan) => satuan.id.toString() === formData.satuan_id) : selectedBahan?.satuan;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

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

                    {addingToMenuId === group.menu.id ? (
                      <TableRow className="bg-blue-50/50 dark:bg-blue-900/10">
                        <TableCell colSpan={3} className="py-4">
                          <div className="space-y-3">
                            {errorMessage && (
                              <div className="bg-destructive/10 border border-destructive/30 text-destructive p-2 rounded-md flex gap-2 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <div>{errorMessage}</div>
                              </div>
                            )}
                            <div className="grid grid-cols-3 gap-3">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Komposisi" : "Tambah Komposisi"}</DialogTitle>
            <DialogDescription>Tentukan bahan baku dan jumlah yang dibutuhkan untuk menu ini</DialogDescription>
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
