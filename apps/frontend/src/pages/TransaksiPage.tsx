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
import { Plus, Search, Eye, XCircle, ShoppingCart, Calendar, DollarSign, Trash2 } from "lucide-react";

interface CartItem {
  menu_id: number;
  menu: Menu;
  jumlah: number;
}

export function TransaksiPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("semua");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bayar, setBayar] = useState("");
  const [catatan, setCatatan] = useState("");
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [jumlahItem, setJumlahItem] = useState("1");

  useEffect(() => {
    fetchTransaksi();
    fetchMenu();
  }, []);

  const fetchTransaksi = async () => {
    setLoading(true);
    try {
      const response = await api.get("/transaksi");
      console.log("Transaksi Response:", response.data);
      setTransaksi(response.data.data || []);
    } catch (error) {
      console.error("Error fetching transaksi:", error);
      alert("Gagal memuat data transaksi");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await api.get("/menu?tersedia=1");
      const menuData = response.data.data || [];

      // Normalize menu data - add harga alias for harga_jual
      const normalizedMenu = menuData.map((menu: any) => ({
        ...menu,
        harga: menu.harga_jual || menu.harga || 0,
      }));

      setMenuList(normalizedMenu);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  const handleOpenDialog = () => {
    setCart([]);
    setBayar("");
    setCatatan("");
    setSelectedMenuId("");
    setJumlahItem("1");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleAddToCart = () => {
    if (!selectedMenuId || !jumlahItem) return;

    const menu = menuList.find((m) => m.id === parseInt(selectedMenuId));
    if (!menu) return;

    // Ensure harga field exists (already normalized in fetchMenu)
    const normalizedMenu = {
      ...menu,
      harga: menu.harga || menu.harga_jual || 0,
    };

    const existingItem = cart.find((item) => item.menu_id === normalizedMenu.id);
    if (existingItem) {
      setCart(cart.map((item) => (item.menu_id === normalizedMenu.id ? { ...item, jumlah: item.jumlah + parseInt(jumlahItem) } : item)));
    } else {
      setCart([...cart, { menu_id: normalizedMenu.id, menu: normalizedMenu, jumlah: parseInt(jumlahItem) }]);
    }

    setSelectedMenuId("");
    setJumlahItem("1");
  };

  const handleRemoveFromCart = (menuId: number) => {
    setCart(cart.filter((item) => item.menu_id !== menuId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.menu?.harga || 0) * item.jumlah, 0);
  };

  const calculateKembalian = () => {
    const total = calculateTotal();
    const bayarNum = parseFloat(bayar) || 0;
    return bayarNum - total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    const total = calculateTotal();
    const bayarNum = parseFloat(bayar);

    if (!bayarNum || bayarNum < total) {
      alert("Pembayaran kurang!");
      return;
    }

    try {
      // Get current user ID from localStorage
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      await api.post("/transaksi", {
        user_id: user?.id || 1,
        bayar: bayarNum,
        catatan: catatan,
        items: cart.map((item) => ({
          menu_id: item.menu_id,
          jumlah: item.jumlah,
        })),
      });

      handleCloseDialog();
      fetchTransaksi();
      alert("Transaksi berhasil!");
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.response?.data?.pesan || "Gagal menyimpan transaksi");
    }
  };

  const statusOptions = ["semua", "selesai", "batal"];

  const filteredTransaksi = transaksi.filter((item) => {
    const matchSearch = item.kode_transaksi?.toLowerCase().includes(searchTerm.toLowerCase()) || item.nama_pelanggan?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === "semua" || item.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleBatal = async (id: number) => {
    if (!confirm("Yakin ingin membatalkan transaksi ini?")) return;

    try {
      await api.post(`/transaksi/${id}/batal`);
      fetchTransaksi();
    } catch (error: any) {
      console.error("Error canceling transaksi:", error);
      alert(error.response?.data?.pesan || "Gagal membatalkan transaksi");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "selesai":
        return "success";
      case "batal":
        return "destructive";
      default:
        return "default";
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const transaksiHariIni = filteredTransaksi.filter((t) => t.tanggal.startsWith(today));
  const totalHariIni = transaksiHariIni.filter((t) => t.status === "selesai").reduce((sum, t) => sum + Number(t.total), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: "var(--font-sans)" }}>
              Transaksi
            </h2>
            <p className="text-muted-foreground mt-2" style={{ fontFamily: "var(--font-sans)" }}>
              Kelola transaksi penjualan
            </p>
          </div>
          <Button
            onClick={handleOpenDialog}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            style={{
              boxShadow: "var(--shadow-md)",
              borderRadius: "var(--radius)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <Plus className="h-4 w-4" />
            Transaksi Baru
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="bg-card border-border"
            style={{
              boxShadow: "var(--shadow-sm)",
              borderRadius: "var(--radius)",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3" style={{ borderRadius: "var(--radius)" }}>
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaksi Hari Ini</p>
                  <p className="text-2xl font-bold text-foreground">{transaksiHariIni.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-card border-border"
            style={{
              boxShadow: "var(--shadow-sm)",
              borderRadius: "var(--radius)",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/10 p-3" style={{ borderRadius: "var(--radius)" }}>
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendapatan Hari Ini</p>
                  <p className="text-2xl font-bold text-foreground">Rp {totalHariIni.toLocaleString("id-ID")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-card border-border"
            style={{
              boxShadow: "var(--shadow-sm)",
              borderRadius: "var(--radius)",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-secondary/10 p-3" style={{ borderRadius: "var(--radius)" }}>
                  <Calendar className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Transaksi</p>
                  <p className="text-2xl font-bold text-foreground">{transaksi.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card
          className="bg-card border-border"
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
                  placeholder="Cari transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-input text-foreground"
                  style={{
                    borderRadius: "calc(var(--radius) - 2px)",
                    fontFamily: "var(--font-sans)",
                  }}
                />
              </div>
              <div className="flex gap-2">
                {statusOptions.map((status) => (
                  <Button key={status} variant={selectedStatus === status ? "default" : "outline"} size="sm" onClick={() => setSelectedStatus(status)} className="capitalize">
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card
          className="bg-card border-border"
          style={{
            boxShadow: "var(--shadow-md)",
            borderRadius: "var(--radius)",
          }}
        >
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
              Daftar Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <LoadingScreen message="Memuat data transaksi..." size="md" />
            ) : filteredTransaksi.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                  {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada transaksi"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransaksi.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-foreground">{item.kode_transaksi}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-foreground">{item.nama_pelanggan || "-"}</TableCell>
                      <TableCell className="text-right font-semibold text-foreground">Rp {Number(item.total).toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={getStatusColor(item.status)}
                          style={{
                            borderRadius: "calc(var(--radius) - 2px)",
                            fontFamily: "var(--font-sans)",
                            boxShadow: "var(--shadow-sm)",
                          }}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                            style={{
                              borderRadius: "calc(var(--radius) - 4px)",
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {item.status === "selesai" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              style={{
                                borderRadius: "calc(var(--radius) - 4px)",
                              }}
                              onClick={() => handleBatal(item.id)}
                            >
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

        {/* Dialog Transaksi Baru */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Transaksi Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 py-4">
                {/* Pilih Menu */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold">Tambah Item</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium">Menu</label>
                      <select value={selectedMenuId} onChange={(e) => setSelectedMenuId(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background">
                        <option value="">Pilih Menu</option>
                        {menuList.map((menu) => (
                          <option key={menu.id} value={menu.id}>
                            {menu.nama} - Rp {menu.harga.toLocaleString("id-ID")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jumlah</label>
                      <div className="flex gap-2">
                        <Input type="number" min="1" value={jumlahItem} onChange={(e) => setJumlahItem(e.target.value)} className="w-20" />
                        <Button type="button" onClick={handleAddToCart} disabled={!selectedMenuId} className="flex-1">
                          <Plus className="h-4 w-4 mr-1" />
                          Tambah
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keranjang */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Keranjang ({cart.length} item)</h3>
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">Keranjang masih kosong</div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Menu</TableHead>
                            <TableHead className="text-center">Jumlah</TableHead>
                            <TableHead className="text-right">Harga</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead className="w-16"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cart.map((item) => (
                            <TableRow key={item.menu_id}>
                              <TableCell>{item.menu?.nama || "Unknown"}</TableCell>
                              <TableCell className="text-center">{item.jumlah}</TableCell>
                              <TableCell className="text-right">Rp {(item.menu?.harga || 0).toLocaleString("id-ID")}</TableCell>
                              <TableCell className="text-right font-semibold">Rp {((item.menu?.harga || 0) * item.jumlah).toLocaleString("id-ID")}</TableCell>
                              <TableCell>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFromCart(item.menu_id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold">
                              Total:
                            </TableCell>
                            <TableCell className="text-right font-bold text-lg">Rp {calculateTotal().toLocaleString("id-ID")}</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                {/* Pembayaran */}
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-primary/5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Bayar <span className="text-destructive">*</span>
                    </label>
                    <Input type="number" value={bayar} onChange={(e) => setBayar(e.target.value)} placeholder="Masukkan jumlah bayar" required className="text-lg font-semibold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kembalian</label>
                    <div className="text-2xl font-bold text-primary px-3 py-2 bg-background rounded-md border">Rp {calculateKembalian() > 0 ? calculateKembalian().toLocaleString("id-ID") : "0"}</div>
                  </div>
                </div>

                {/* Catatan */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catatan</label>
                  <Input value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan tambahan (opsional)" />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Batal
                </Button>
                <Button type="submit" disabled={cart.length === 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Proses Transaksi
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
