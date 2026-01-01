import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Transaksi, Menu } from "@/lib/types";
import { ShoppingCart, Calendar, DollarSign, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notify } from "@/lib/notify";
import { POSTab } from "@/pages/transaksi/POSTab";
import { RiwayatTab } from "@/pages/transaksi/RiwayatTab";
import { MobileCartDialog } from "@/pages/transaksi/MobileCartDialog";
import { TransaksiDetailDialog } from "@/pages/transaksi/TransaksiDetailDialog";
import type { CartItem, MetodePembayaran } from "@/pages/transaksi/types";
import { filterMenu, filterTransaksi, calculateTotal, getCartItemCount } from "@/pages/transaksi/utils";
import { playTransactionSound } from "@/lib/sound";

export function TransaksiPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  // POS State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string>("semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bayar, setBayar] = useState("");
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran>("tunai");
  const [namaPelanggan, setNamaPelanggan] = useState("");

  // Riwayat State
  const [riwayatSearch, setRiwayatSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("semua");

  // Dialog State
  const [activeTab, setActiveTab] = useState("pos");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchTransaksi();
    fetchMenu();
  }, []);

  const fetchTransaksi = async () => {
    try {
      const response = await api.get("/transaksi");
      setTransaksi(response.data.data || []);
    } catch (error) {
      console.error("Error fetching transaksi:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await api.get("/menu?tersedia=1");
      const menuData = response.data.data || [];
      setMenuList(menuData);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  // Cart management
  const addToCart = (menu: Menu) => {
    const existingItem = cart.find((item) => item.menu_id === menu.id);
    if (existingItem) {
      setCart(cart.map((item) => (item.menu_id === menu.id ? { ...item, jumlah: item.jumlah + 1 } : item)));
    } else {
      setCart([...cart, { menu_id: menu.id, menu, jumlah: 1 }]);
    }
  };

  const updateQuantity = (menuId: number, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.menu_id === menuId) {
            const newJumlah = item.jumlah + delta;
            return newJumlah > 0 ? { ...item, jumlah: newJumlah } : item;
          }
          return item;
        })
        .filter((item) => item.jumlah > 0)
    );
  };

  const removeFromCart = (menuId: number) => {
    setCart(cart.filter((item) => item.menu_id !== menuId));
  };

  const clearCart = () => {
    setCart([]);
    setBayar("");
    setNamaPelanggan("");
    setMetodePembayaran("tunai");
  };

  // Handle submit
  const handleSubmit = async () => {
    if (cart.length === 0) {
      notify.warning("Keranjang masih kosong!");
      return;
    }

    const total = calculateTotal(cart);
    const bayarNum = parseFloat(bayar);

    if (metodePembayaran === "tunai" && (!bayarNum || bayarNum < total)) {
      notify.warning("Pembayaran kurang!");
      return;
    }

    setSubmitting(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      await api.post("/transaksi", {
        user_id: user?.id || 1,
        bayar: metodePembayaran === "tunai" ? bayarNum : total,
        metode_pembayaran: metodePembayaran,
        nama_pelanggan: namaPelanggan || null,
        items: cart.map((item) => ({ menu_id: item.menu_id, jumlah: item.jumlah })),
      });

      clearCart();
      fetchTransaksi();
      notify.success("Transaksi berhasil!");
      // Play success sound
      await playTransactionSound();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { pesan?: string } } };
      notify.error(err.response?.data?.pesan || "Gagal menyimpan transaksi");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle batal
  const handleBatal = async (id: number) => {
    if (!confirm("Yakin ingin membatalkan transaksi ini?")) return;

    setCancelingId(id);
    try {
      await api.post(`/transaksi/${id}/batal`);
      fetchTransaksi();
      notify.success("Transaksi dibatalkan");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { pesan?: string } } };
      notify.error(err.response?.data?.pesan || "Gagal membatalkan transaksi");
    } finally {
      setCancelingId(null);
    }
  };

  // Computed values
  const filteredMenu = filterMenu(menuList, searchTerm, selectedKategori);
  const filteredTransaksi = filterTransaksi(transaksi, riwayatSearch, selectedStatus);
  const kategoris = [...new Set(menuList.map((m) => m.kategori))].sort();

  const today = new Date().toISOString().split("T")[0];
  const transaksiHariIni = transaksi.filter((t) => t.tanggal?.startsWith(today));
  const totalHariIni = transaksiHariIni.filter((t) => t.status === "selesai").reduce((sum, t) => sum + Number(t.total), 0);

  const cartItemCount = getCartItemCount(cart);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingScreen message="Memuat data..." size="lg" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-180px)] flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Transaksi</h2>
            <TabsList className="grid grid-cols-2 w-[180px] md:w-[220px]">
              <TabsTrigger value="pos" className="gap-1.5 text-xs md:text-sm">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Kasir</span>
              </TabsTrigger>
              <TabsTrigger value="riwayat" className="gap-1.5 text-xs md:text-sm">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Riwayat</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* POS Tab */}
          <TabsContent value="pos" className="flex-1 mt-0 overflow-hidden data-[state=inactive]:hidden">
            <div className="h-full overflow-hidden">
              <POSTab
                filteredMenu={filteredMenu}
                cart={cart}
                searchTerm={searchTerm}
                selectedKategori={selectedKategori}
                kategoris={kategoris}
                bayar={bayar}
                metodePembayaran={metodePembayaran}
                namaPelanggan={namaPelanggan}
                onSearchChange={setSearchTerm}
                onKategoriChange={setSelectedKategori}
                onAddToCart={addToCart}
                onUpdateQuantity={updateQuantity}
                onRemoveFromCart={removeFromCart}
                onClearCart={clearCart}
                onBayarChange={setBayar}
                onMetodeChange={setMetodePembayaran}
                onNamaChange={setNamaPelanggan}
                onSubmit={handleSubmit}
                isLoading={submitting}
              />
            </div>
          </TabsContent>

          {/* Riwayat Tab */}
          <TabsContent value="riwayat" className="flex-1 mt-0 flex flex-col overflow-hidden data-[state=inactive]:hidden">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-4 flex-shrink-0">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Transaksi Hari Ini</p>
                    <p className="text-xl font-bold">{transaksiHariIni.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-green-500/10 p-3 rounded-xl">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pendapatan</p>
                    <p className="text-xl font-bold">Rp {(totalHariIni / 1000).toFixed(0)}K</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-blue-500/10 p-3 rounded-xl">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Semua</p>
                    <p className="text-xl font-bold">{transaksi.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Riwayat Content */}
            <RiwayatTab
              transaksi={filteredTransaksi}
              loading={loading}
              searchQuery={riwayatSearch}
              selectedStatus={selectedStatus}
              onSearchChange={setRiwayatSearch}
              onStatusChange={setSelectedStatus}
              onViewDetail={(item: Transaksi) => {
                setSelectedTransaksi(item);
                setDetailDialogOpen(true);
              }}
              onBatal={handleBatal}
              isBalCancelLoading={cancelingId !== null}
            />
          </TabsContent>
        </Tabs>

        {/* Mobile Cart FAB */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
            <Button onClick={() => setShowMobileCart(true)} className="w-full h-14 text-base shadow-xl gap-3">
              <ShoppingCart className="h-5 w-5" />
              <span>Lihat Keranjang</span>
              <Badge variant="secondary" className="ml-auto">
                {cartItemCount} item • Rp {calculateTotal(cart).toLocaleString("id-ID")}
              </Badge>
            </Button>
          </div>
        )}

        {/* Mobile Cart Dialog */}
        <MobileCartDialog
          open={showMobileCart}
          cart={cart}
          bayar={bayar}
          metodePembayaran={metodePembayaran}
          namaPelanggan={namaPelanggan}
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          onClearCart={clearCart}
          onBayarChange={setBayar}
          onMetodeChange={setMetodePembayaran}
          onNamaChange={setNamaPelanggan}
          onSubmit={handleSubmit}
          onOpenChange={setShowMobileCart}
          isLoading={submitting}
        />

        {/* Detail Dialog */}
        <TransaksiDetailDialog open={detailDialogOpen} selectedTransaksi={selectedTransaksi} onOpenChange={setDetailDialogOpen} />
      </div>
    </DashboardLayout>
  );
}
