import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Transaksi, Menu } from "@/lib/types";
import { Plus, Minus, Search, Eye, XCircle, ShoppingCart, Calendar, DollarSign, Trash2, Banknote, Smartphone, UtensilsCrossed, Coffee, History, Receipt, Delete } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CartItem {
  menu_id: number;
  menu: Menu;
  jumlah: number; 
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function TransaksiPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string>("semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bayar, setBayar] = useState("");
  const [metodePembayaran, setMetodePembayaran] = useState<"tunai" | "qris">("tunai");
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [activeTab, setActiveTab] = useState("pos");
  const [riwayatSearch, setRiwayatSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("semua");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);
  const [showMobileCart, setShowMobileCart] = useState(false);

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
      const normalizedMenu = menuData.map((menu: Menu) => ({
        ...menu,
        harga: menu.harga_jual || menu.harga || 0,
      }));
      setMenuList(normalizedMenu);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  const getImageUrl = (gambar: string | null | undefined) => {
    if (!gambar) return null;
    if (gambar.startsWith("http")) return gambar;
    return API_URL + "/storage/" + gambar;
  };

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

  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.menu?.harga || item.menu?.harga_jual || 0) * item.jumlah, 0);
  const calculateKembalian = () => (parseFloat(bayar) || 0) - calculateTotal();

  const handleNumpadPress = (num: string) => {
    if (num === "C") {
      setBayar("");
    } else if (num === "DEL") {
      setBayar(bayar.slice(0, -1));
    } else if (num === "000") {
      setBayar(bayar + "000");
    } else {
      setBayar(bayar + num);
    }
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    const total = calculateTotal();
    const bayarNum = parseFloat(bayar);
    if (metodePembayaran === "tunai" && (!bayarNum || bayarNum < total)) return alert("Pembayaran kurang!");

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
      alert("Transaksi berhasil!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { pesan?: string } } };
      alert(err.response?.data?.pesan || "Gagal menyimpan transaksi");
    }
  };

  const handleBatal = async (id: number) => {
    if (!confirm("Yakin ingin membatalkan transaksi ini?")) return;
    try {
      await api.post("/transaksi/" + id + "/batal");
      fetchTransaksi();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { pesan?: string } } };
      alert(err.response?.data?.pesan || "Gagal membatalkan transaksi");
    }
  };

  const filteredMenu = menuList.filter((menu) => {
    const matchSearch = menu.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori = selectedKategori === "semua" || menu.kategori === selectedKategori;
    return matchSearch && matchKategori;
  });

  const filteredTransaksi = transaksi.filter((item) => {
    const matchSearch = item.kode_transaksi?.toLowerCase().includes(riwayatSearch.toLowerCase()) || item.nama_pelanggan?.toLowerCase().includes(riwayatSearch.toLowerCase());
    const matchStatus = selectedStatus === "semua" || item.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status: string) => {
    if (status === "selesai") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (status === "batal") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    return "bg-gray-100 text-gray-700";
  };

  const today = new Date().toISOString().split("T")[0];
  const transaksiHariIni = transaksi.filter((t) => t.tanggal?.startsWith(today));
  const totalHariIni = transaksiHariIni.filter((t) => t.status === "selesai").reduce((sum, t) => sum + Number(t.total), 0);

  if (loading)
    return (
      <DashboardLayout>
        <LoadingScreen message="Memuat data..." size="lg" />
      </DashboardLayout>
    );

  const cartItemCount = cart.reduce((s, i) => s + i.jumlah, 0);

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
            <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-4 gap-4 h-full">
              {/* Menu Grid - Takes more space */}
              <div className="lg:col-span-3 xl:col-span-3 flex flex-col h-full overflow-hidden">
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-shrink-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-10 text-sm" />
                  </div>
                  <div className="flex gap-2">
                    {[
                      { k: "semua", l: "Semua" },
                      { k: "makanan", l: "Makanan", i: UtensilsCrossed },
                      { k: "minuman", l: "Minuman", i: Coffee },
                    ].map(({ k, l, i: Icon }) => (
                      <Button key={k} variant={selectedKategori === k ? "default" : "outline"} size="sm" onClick={() => setSelectedKategori(k)} className="h-10 text-xs sm:text-sm px-3 sm:px-4">
                        {Icon && <Icon className="h-4 w-4 mr-1.5" />}
                        <span className="hidden xs:inline">{l}</span>
                        {!Icon && <span className="xs:hidden">{l}</span>}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto pb-20 lg:pb-0 scrollbar-thin">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                    {filteredMenu.map((menu) => {
                      const imageUrl = getImageUrl(menu.gambar);
                      const cartItem = cart.find((c) => c.menu_id === menu.id);
                      return (
                        <div
                          key={menu.id}
                          className={`relative rounded-xl border-2 bg-card overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${cartItem ? "border-primary ring-2 ring-primary/20" : "border-transparent"}`}
                          onClick={() => addToCart(menu)}
                        >
                          <div className="aspect-square bg-muted relative">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={menu.nama}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                {menu.kategori === "makanan" ? <UtensilsCrossed className="h-10 w-10 text-primary/30" /> : <Coffee className="h-10 w-10 text-primary/30" />}
                              </div>
                            )}
                            {cartItem && <div className="absolute top-2 right-2 bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">{cartItem.jumlah}</div>}
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-medium truncate mb-1">{menu.nama}</p>
                            <p className="text-sm text-primary font-bold">Rp {(menu.harga || 0).toLocaleString("id-ID")}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {filteredMenu.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <UtensilsCrossed className="h-12 w-12 mb-3" />
                      <p className="text-base">Menu tidak ditemukan</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cart Panel - Desktop */}
              <div className="hidden lg:flex lg:col-span-2 xl:col-span-1 flex-col h-full overflow-hidden">
                <Card className="flex flex-col h-full overflow-hidden shadow-lg">
                  <CardHeader className="py-3 px-4 border-b flex-shrink-0 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Keranjang
                        {cart.length > 0 && (
                          <Badge variant="secondary" className="text-xs h-6 px-2">
                            {cartItemCount}
                          </Badge>
                        )}
                      </CardTitle>
                      {cart.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive h-8 w-8 p-0 hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <div className="flex-1 overflow-y-auto min-h-0">
                    <CardContent className="p-3">
                      {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                          <ShoppingCart className="h-12 w-12 mb-3 opacity-40" />
                          <p className="text-sm">Keranjang kosong</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">Pilih menu untuk memulai</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cart.map((item) => (
                            <div key={item.menu_id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                {getImageUrl(item.menu?.gambar) ? (
                                  <img src={getImageUrl(item.menu?.gambar)!} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.menu?.nama}</p>
                                <p className="text-xs text-muted-foreground">Rp {(item.menu?.harga || 0).toLocaleString("id-ID")}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    item.jumlah === 1 ? removeFromCart(item.menu_id) : updateQuantity(item.menu_id, -1);
                                  }}
                                >
                                  {item.jumlah === 1 ? <Trash2 className="h-3.5 w-3.5 text-destructive" /> : <Minus className="h-3.5 w-3.5" />}
                                </Button>
                                <span className="w-8 text-center text-sm font-semibold">{item.jumlah}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.menu_id, 1);
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </div>

                  {cart.length > 0 && (
                    <div className="border-t p-4 space-y-3 bg-background flex-shrink-0">
                      <Input placeholder="Nama pelanggan (opsional)" value={namaPelanggan} onChange={(e) => setNamaPelanggan(e.target.value)} className="h-10" />

                      <div className="grid grid-cols-2 gap-2">
                        <Button type="button" variant={metodePembayaran === "tunai" ? "default" : "outline"} size="sm" onClick={() => setMetodePembayaran("tunai")} className="h-10 gap-2">
                          <Banknote className="h-4 w-4" />
                          Tunai
                        </Button>
                        <Button
                          type="button"
                          variant={metodePembayaran === "qris" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setMetodePembayaran("qris");
                            setBayar(calculateTotal().toString());
                          }}
                          className="h-10 gap-2"
                        >
                          <Smartphone className="h-4 w-4" />
                          QRIS
                        </Button>
                      </div>

                      {metodePembayaran === "tunai" && (
                        <>
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Jumlah Bayar</p>
                            <p className="text-2xl font-bold text-right tabular-nums">Rp {bayar ? parseInt(bayar).toLocaleString("id-ID") : "0"}</p>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {["1", "2", "3", "C", "4", "5", "6", "DEL", "7", "8", "9", "000"].map((key) => (
                              <Button key={key} type="button" variant={key === "C" ? "destructive" : key === "DEL" ? "secondary" : "outline"} className="h-10 text-sm font-semibold" onClick={() => handleNumpadPress(key)}>
                                {key === "DEL" ? <Delete className="h-4 w-4" /> : key}
                              </Button>
                            ))}
                            <Button type="button" variant="outline" className="h-10 text-sm col-span-2" onClick={() => handleNumpadPress("0")}>
                              0
                            </Button>
                            <Button type="button" variant="secondary" className="h-10 text-xs col-span-2" onClick={() => setBayar(calculateTotal().toString())}>
                              Uang Pas
                            </Button>
                          </div>
                        </>
                      )}

                      <div className="space-y-2 pt-3 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>Rp {calculateTotal().toLocaleString("id-ID")}</span>
                        </div>
                        {metodePembayaran === "tunai" && parseFloat(bayar) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Kembalian</span>
                            <span className={calculateKembalian() >= 0 ? "text-green-600 font-semibold" : "text-destructive"}>Rp {calculateKembalian() >= 0 ? calculateKembalian().toLocaleString("id-ID") : "0"}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2">
                          <span>Total</span>
                          <span className="text-primary">Rp {calculateTotal().toLocaleString("id-ID")}</span>
                        </div>
                      </div>

                      <Button onClick={handleSubmit} className="w-full h-12 text-base gap-2" disabled={metodePembayaran === "tunai" && parseFloat(bayar) < calculateTotal()}>
                        <Receipt className="h-5 w-5" />
                        Proses Transaksi
                      </Button>
                    </div>
                  )}
                </Card>
              </div>

              {/* Mobile Cart FAB */}
              {cart.length > 0 && (
                <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
                  <Button onClick={() => setShowMobileCart(true)} className="w-full h-14 text-base shadow-xl gap-3">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Lihat Keranjang</span>
                    <Badge variant="secondary" className="ml-auto">
                      {cartItemCount} item • Rp {calculateTotal().toLocaleString("id-ID")}
                    </Badge>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

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

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari kode transaksi atau nama pelanggan..." value={riwayatSearch} onChange={(e) => setRiwayatSearch(e.target.value)} className="pl-10 h-10" />
              </div>
              <div className="flex gap-2">
                {["semua", "selesai", "batal"].map((status) => (
                  <Button key={status} variant={selectedStatus === status ? "default" : "outline"} size="sm" onClick={() => setSelectedStatus(status)} className="h-10 capitalize px-4">
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Transaction List */}
            <Card className="flex-1 overflow-hidden">
              <CardContent className="p-0 h-full overflow-y-auto">
                {filteredTransaksi.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Receipt className="h-12 w-12 mb-3" />
                    <p className="text-base">{riwayatSearch ? "Tidak ada hasil pencarian" : "Belum ada transaksi"}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-sm font-semibold">Kode</TableHead>
                        <TableHead className="text-sm font-semibold">Pelanggan</TableHead>
                        <TableHead className="text-sm font-semibold">Waktu</TableHead>
                        <TableHead className="text-sm font-semibold text-right">Total</TableHead>
                        <TableHead className="text-sm font-semibold text-center">Status</TableHead>
                        <TableHead className="text-sm font-semibold text-center w-24">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransaksi.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium py-3">{item.kode_transaksi}</TableCell>
                          <TableCell className="text-muted-foreground py-3">{item.nama_pelanggan || "-"}</TableCell>
                          <TableCell className="text-muted-foreground py-3">
                            {new Date(item.tanggal).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell className="text-right font-semibold py-3">Rp {Number(item.total).toLocaleString("id-ID")}</TableCell>
                          <TableCell className="text-center py-3">
                            <Badge className={`${getStatusColor(item.status)} text-xs px-2.5 py-0.5`}>{item.status}</Badge>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                                onClick={() => {
                                  setSelectedTransaksi(item);
                                  setDetailDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {item.status === "selesai" && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleBatal(item.id)}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mobile Cart Dialog */}
        <Dialog open={showMobileCart} onOpenChange={setShowMobileCart}>
          <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Keranjang ({cartItemCount} item)
                </DialogTitle>
                <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Hapus Semua
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.menu_id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {getImageUrl(item.menu?.gambar) ? (
                      <img src={getImageUrl(item.menu?.gambar)!} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.menu?.nama}</p>
                    <p className="text-sm text-muted-foreground">Rp {(item.menu?.harga || 0).toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => (item.jumlah === 1 ? removeFromCart(item.menu_id) : updateQuantity(item.menu_id, -1))}>
                      {item.jumlah === 1 ? <Trash2 className="h-4 w-4 text-destructive" /> : <Minus className="h-4 w-4" />}
                    </Button>
                    <span className="w-8 text-center font-semibold">{item.jumlah}</span>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => updateQuantity(item.menu_id, 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4 space-y-4 flex-shrink-0 bg-background">
              <Input placeholder="Nama pelanggan (opsional)" value={namaPelanggan} onChange={(e) => setNamaPelanggan(e.target.value)} className="h-11" />

              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={metodePembayaran === "tunai" ? "default" : "outline"} onClick={() => setMetodePembayaran("tunai")} className="h-11 gap-2">
                  <Banknote className="h-4 w-4" />
                  Tunai
                </Button>
                <Button
                  type="button"
                  variant={metodePembayaran === "qris" ? "default" : "outline"}
                  onClick={() => {
                    setMetodePembayaran("qris");
                    setBayar(calculateTotal().toString());
                  }}
                  className="h-11 gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  QRIS
                </Button>
              </div>

              {metodePembayaran === "tunai" && (
                <>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Jumlah Bayar</p>
                    <p className="text-2xl font-bold text-right tabular-nums">Rp {bayar ? parseInt(bayar).toLocaleString("id-ID") : "0"}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {["1", "2", "3", "C", "4", "5", "6", "DEL", "7", "8", "9", "000"].map((key) => (
                      <Button key={key} type="button" variant={key === "C" ? "destructive" : key === "DEL" ? "secondary" : "outline"} className="h-12 text-base font-semibold" onClick={() => handleNumpadPress(key)}>
                        {key === "DEL" ? <Delete className="h-5 w-5" /> : key}
                      </Button>
                    ))}
                    <Button type="button" variant="outline" className="h-12 text-base col-span-2" onClick={() => handleNumpadPress("0")}>
                      0
                    </Button>
                    <Button type="button" variant="secondary" className="h-12 text-sm col-span-2" onClick={() => setBayar(calculateTotal().toString())}>
                      Uang Pas
                    </Button>
                  </div>
                </>
              )}

              <div className="space-y-2 pt-3 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rp {calculateTotal().toLocaleString("id-ID")}</span>
                </div>
                {metodePembayaran === "tunai" && parseFloat(bayar) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kembalian</span>
                    <span className={calculateKembalian() >= 0 ? "text-green-600 font-semibold" : "text-destructive"}>Rp {calculateKembalian() >= 0 ? calculateKembalian().toLocaleString("id-ID") : "0"}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span className="text-primary">Rp {calculateTotal().toLocaleString("id-ID")}</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  handleSubmit();
                  setShowMobileCart(false);
                }}
                className="w-full h-12 text-base gap-2"
                disabled={metodePembayaran === "tunai" && parseFloat(bayar) < calculateTotal()}
              >
                <Receipt className="h-5 w-5" />
                Proses Transaksi
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Detail Transaction Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Detail Transaksi
              </DialogTitle>
            </DialogHeader>
            {selectedTransaksi && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs">Kode Transaksi</span>
                    <p className="font-medium">{selectedTransaksi.kode_transaksi}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs">Waktu</span>
                    <p>{new Date(selectedTransaksi.tanggal).toLocaleString("id-ID")}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs">Pelanggan</span>
                    <p>{selectedTransaksi.nama_pelanggan || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs">Metode Pembayaran</span>
                    <p className="capitalize">{selectedTransaksi.metode_pembayaran}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-muted-foreground text-xs">Status</span>
                    <div>
                      <Badge className={`${getStatusColor(selectedTransaksi.status)} text-xs`}>{selectedTransaksi.status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-semibold mb-3">Daftar Item</p>
                  <div className="space-y-2">
                    {selectedTransaksi.detail?.map((d, i) => (
                      <div key={i} className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg">
                        <div>
                          <span className="font-medium">{d.menu?.nama || "Menu #" + d.menu_id}</span>
                          <span className="text-muted-foreground ml-2">x{d.jumlah}</span>
                        </div>
                        <span className="font-semibold">Rp {Number(d.subtotal).toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">Rp {Number(selectedTransaksi.total).toLocaleString("id-ID")}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
