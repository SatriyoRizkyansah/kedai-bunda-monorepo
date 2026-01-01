import { useState, useEffect } from "react";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/LoadingScreen";
import { notify } from "@/lib/notify";
import { Plus, UtensilsCrossed } from "lucide-react";
import type { Menu } from "@/lib/types";
import { MenuFilters } from "./menu/MenuFilters";
import { MenuCard } from "./menu/MenuCard";
import { MenuDialog } from "./menu/MenuDialog";
import { StokMenuDialog } from "./menu/StokMenuDialog";
import { HistoriStokDialog } from "./menu/HistoriStokDialog";
import { DeleteConfirmDialog } from "./menu/DeleteConfirmDialog";
import { INITIAL_FORM_DATA, INITIAL_STOK_FORM } from "./menu/utils";
import type { MenuFormData, StokFormData, StokLog } from "./menu/types";

export function MenuPage() {
  // Menu and filter states
  const [menu, setMenu] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string>("semua");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Menu | null>(null);
  const [formData, setFormData] = useState<MenuFormData>(INITIAL_FORM_DATA);
  const [formLoading, setFormLoading] = useState(false);

  // Stok dialog states
  const [stokDialogOpen, setStokDialogOpen] = useState(false);
  const [stokItem, setStokItem] = useState<Menu | null>(null);
  const [stokFormData, setStokFormData] = useState<StokFormData>(INITIAL_STOK_FORM);
  const [stokLoading, setStokLoading] = useState(false);

  // History dialog states
  const [historiDialogOpen, setHistoriDialogOpen] = useState(false);
  const [historiItem, setHistoriItem] = useState<Menu | null>(null);
  const [stokLogs, setStokLogs] = useState<StokLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Delete confirm states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await api.get("/menu");
      setMenu(response.data.data || []);
    } catch (error) {
      console.error("Error fetching menu:", error);
      notify.error("Gagal memuat data menu");
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

  // Menu dialog handlers
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
        gambar: null, // Jangan set file di edit, hanya preview
        gambar_preview: item.gambar || "",
      });
    } else {
      setEditingItem(null);
      setFormData(INITIAL_FORM_DATA);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("nama", formData.nama);
    formDataToSend.append("kategori", formData.kategori);
    formDataToSend.append("harga_jual", parseFloat(formData.harga).toString());
    formDataToSend.append("deskripsi", formData.deskripsi);
    formDataToSend.append("tersedia", formData.tersedia.toString());
    formDataToSend.append("stok", parseFloat(formData.stok).toString());
    formDataToSend.append("kelola_stok_mandiri", formData.kelola_stok_mandiri.toString());

    // HANYA append gambar jika ada File object (bukan preview string dan bukan null)
    if (formData.gambar instanceof File) {
      formDataToSend.append("gambar", formData.gambar);
    }

    try {
      if (editingItem) {
        await api.post(`/menu/${editingItem.id}?_method=PUT`, formDataToSend);
      } else {
        await api.post("/menu", formDataToSend);
      }
      notify.success(editingItem ? "Menu berhasil diupdate" : "Menu berhasil ditambahkan");
      handleCloseDialog();
      fetchMenu();
    } catch (error: any) {
      console.error("Error saving:", error);
      const errorMsg = error?.response?.data?.errors || error?.response?.data?.pesan || "Gagal menyimpan menu";
      console.error("Detail error:", errorMsg);
      if (errorMsg.gambar) {
        console.error("Gambar errors:", errorMsg.gambar);
      }
      notify.error(typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg);
    } finally {
      setFormLoading(false);
    }
  };

  // Stok dialog handlers
  const handleOpenStokDialog = (item: Menu) => {
    if (!item.kelola_stok_mandiri) {
      return;
    }
    setStokItem(item);
    setStokFormData(INITIAL_STOK_FORM);
    setStokDialogOpen(true);
  };

  const handleTambahStok = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stokItem) return;

    setStokLoading(true);
    try {
      const payload: any = {
        jumlah: parseFloat(stokFormData.jumlah),
        keterangan: stokFormData.keterangan || `Penambahan stok ${stokItem.nama}`,
      };

      if (stokFormData.harga_beli) {
        payload.harga_beli = parseFloat(stokFormData.harga_beli);
      }

      await api.post(`/menu/${stokItem.id}/tambah-stok`, payload);
      setStokDialogOpen(false);
      setStokItem(null);
      setStokFormData(INITIAL_STOK_FORM);
      fetchMenu();
      notify.success("Stok berhasil ditambahkan");
    } catch (error: any) {
      console.error("Error tambah stok:", error);
      notify.error(error?.response?.data?.pesan || "Gagal menambah stok");
    } finally {
      setStokLoading(false);
    }
  };

  // History dialog handlers
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
      notify.error("Gagal memuat riwayat stok");
    } finally {
      setLoadingLogs(false);
    }
  };

  // Delete handlers
  const handleDelete = (id: number) => {
    setConfirmTargetId(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!confirmTargetId) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/menu/${confirmTargetId}`);
      setConfirmOpen(false);
      setConfirmTargetId(null);
      fetchMenu();
      notify.success("Menu berhasil dihapus");
    } catch (error: any) {
      console.error("Error deleting:", error);
      notify.error(error?.response?.data?.pesan || "Gagal menghapus menu");
    } finally {
      setDeleteLoading(false);
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
        <MenuFilters searchTerm={searchTerm} selectedKategori={selectedKategori} kategoris={kategoris} onSearchChange={setSearchTerm} onKategoriChange={setSelectedKategori} />

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
              <MenuCard key={item.id} item={item} onAddStok={handleOpenStokDialog} onViewHistory={handleOpenHistori} onEdit={handleOpenDialog} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Dialogs */}
        <MenuDialog open={dialogOpen} editingItem={editingItem} formData={formData} onFormDataChange={setFormData} onSubmit={handleSubmit} onOpenChange={handleCloseDialog} isLoading={formLoading} />

        <StokMenuDialog open={stokDialogOpen} stokItem={stokItem} formData={stokFormData} onFormDataChange={setStokFormData} onSubmit={handleTambahStok} onOpenChange={() => setStokDialogOpen(false)} isLoading={stokLoading} />

        <HistoriStokDialog open={historiDialogOpen} historiItem={historiItem} stokLogs={stokLogs} loading={loadingLogs} onOpenChange={() => setHistoriDialogOpen(false)} />

        <DeleteConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={performDelete} isLoading={deleteLoading} />
      </div>
    </DashboardLayout>
  );
}
