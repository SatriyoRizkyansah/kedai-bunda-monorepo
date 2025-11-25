import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { LoadingScreen } from "../components/LoadingScreen";
import { Search, ArrowUpCircle, ArrowDownCircle, AlertCircle, History, Plus, Minus } from "lucide-react";
import api from "../lib/api";
import type { StokLog, BahanBaku } from "../lib/types";

interface StokStats {
  total_masuk: number;
  total_keluar: number;
  total_penyesuaian: number;
}

export const StokLogPage = () => {
  const [stokLogs, setStokLogs] = useState<StokLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<StokLog[]>([]);
  const [bahanBakuList, setBahanBakuList] = useState<BahanBaku[]>([]);
  const [stats, setStats] = useState<StokStats>({
    total_masuk: 0,
    total_keluar: 0,
    total_penyesuaian: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tipeFilter, setTipeFilter] = useState<string>("semua");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"tambah" | "kurangi">("tambah");
  const [formData, setFormData] = useState({
    bahan_baku_id: "",
    jumlah: "",
    keterangan: "",
  });

  useEffect(() => {
    fetchStokLogs();
    fetchBahanBaku();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchQuery, tipeFilter, stokLogs]);

  const fetchStokLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/stok-log");
      const logs = response.data.data || [];
      setStokLogs(logs);
      calculateStats(logs);
    } catch (error) {
      console.error("Error fetching stok logs:", error);
      alert("Gagal memuat data stok log");
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

  const handleOpenDialog = (type: "tambah" | "kurangi") => {
    setDialogType(type);
    setFormData({
      bahan_baku_id: "",
      jumlah: "",
      keterangan: "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = dialogType === "tambah" ? "/stok-log/tambah" : "/stok-log/kurangi";
      await api.post(endpoint, {
        bahan_baku_id: parseInt(formData.bahan_baku_id),
        jumlah: parseFloat(formData.jumlah),
        keterangan: formData.keterangan,
      });
      handleCloseDialog();
      fetchStokLogs();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.response?.data?.pesan || "Gagal menyimpan data");
    }
  };

  const calculateStats = (logs: StokLog[]) => {
    const stats = logs.reduce(
      (acc, log) => {
        if (log.tipe === "masuk") acc.total_masuk += Number(log.jumlah);
        if (log.tipe === "keluar") acc.total_keluar += Number(log.jumlah);
        if (log.tipe === "penyesuaian") acc.total_penyesuaian += 1;
        return acc;
      },
      { total_masuk: 0, total_keluar: 0, total_penyesuaian: 0 }
    );
    setStats(stats);
  };

  const filterLogs = () => {
    let filtered = [...stokLogs];

    // Filter by search query (bahan baku name)
    if (searchQuery) {
      filtered = filtered.filter((log) => log.bahan_baku?.nama?.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Filter by tipe
    if (tipeFilter !== "semua") {
      filtered = filtered.filter((log) => log.tipe === tipeFilter);
    }

    setFilteredLogs(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTipeBadgeVariant = (tipe: string): "success" | "destructive" | "warning" => {
    switch (tipe) {
      case "masuk":
        return "success";
      case "keluar":
        return "destructive";
      case "penyesuaian":
        return "warning";
      default:
        return "secondary" as "success";
    }
  };

  const getTipeLabel = (tipe: string): string => {
    switch (tipe) {
      case "masuk":
        return "Stok Masuk";
      case "keluar":
        return "Stok Keluar";
      case "penyesuaian":
        return "Penyesuaian";
      default:
        return tipe;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-sans)" }}>
              Riwayat Stok
            </h1>
            <p className="text-muted-foreground">Kelola dan pantau pergerakan stok bahan baku</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleOpenDialog("tambah")} className="gap-2 bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Tambah Stok
            </Button>
            <Button onClick={() => handleOpenDialog("kurangi")} variant="destructive" className="gap-2">
              <Minus className="h-4 w-4" />
              Kurangi Stok
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Stok Masuk</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "rgb(var(--primary))" }}>
                {stats.total_masuk.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total bahan yang masuk</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Stok Keluar</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "rgb(var(--primary))" }}>
                {stats.total_keluar.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total bahan yang keluar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Penyesuaian Stok</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "rgb(var(--primary))" }}>
                {stats.total_penyesuaian}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Jumlah penyesuaian stok</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Riwayat</CardTitle>
            <CardDescription>Cari dan filter riwayat pergerakan stok</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari berdasarkan nama bahan baku..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>

              {/* Tipe Filter */}
              <div className="flex gap-2">
                <Button variant={tipeFilter === "semua" ? "default" : "outline"} onClick={() => setTipeFilter("semua")} size="sm">
                  Semua
                </Button>
                <Button variant={tipeFilter === "masuk" ? "default" : "outline"} onClick={() => setTipeFilter("masuk")} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Masuk
                </Button>
                <Button variant={tipeFilter === "keluar" ? "default" : "outline"} onClick={() => setTipeFilter("keluar")} size="sm">
                  <Minus className="h-4 w-4 mr-1" />
                  Keluar
                </Button>
                <Button variant={tipeFilter === "penyesuaian" ? "default" : "outline"} onClick={() => setTipeFilter("penyesuaian")} size="sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Penyesuaian
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Riwayat Stok</CardTitle>
            <CardDescription>{filteredLogs.length} riwayat ditemukan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingScreen message="Memuat riwayat stok..." size="md" />
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Tidak ada riwayat stok ditemukan</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Bahan Baku</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{formatDate(log.created_at!)}</TableCell>
                      <TableCell>{log.bahan_baku?.nama || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={getTipeBadgeVariant(log.tipe)}>{getTipeLabel(log.tipe)}</Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className="font-mono font-semibold"
                          style={{
                            color: log.tipe === "masuk" ? "rgb(34, 197, 94)" : log.tipe === "keluar" ? "rgb(239, 68, 68)" : "rgb(245, 158, 11)",
                          }}
                        >
                          {log.tipe === "masuk" ? "+" : log.tipe === "keluar" ? "-" : "±"}
                          {Number(log.jumlah).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>{log.satuan}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.keterangan || "-"}</TableCell>
                      <TableCell>{log.user?.name || "-"}</TableCell>
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
              <DialogTitle>{dialogType === "tambah" ? "Tambah Stok" : "Kurangi Stok"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Bahan Baku <span className="text-destructive">*</span>
                  </label>
                  <select value={formData.bahan_baku_id} onChange={(e) => setFormData({ ...formData, bahan_baku_id: e.target.value })} required className="w-full px-3 py-2 rounded-md border border-input bg-background">
                    <option value="">Pilih Bahan Baku</option>
                    {bahanBakuList.map((bahan) => (
                      <option key={bahan.id} value={bahan.id}>
                        {bahan.nama} (Stok: {bahan.stok_tersedia} {bahan.satuan_dasar})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Jumlah <span className="text-destructive">*</span>
                  </label>
                  <Input type="number" step="0.01" value={formData.jumlah} onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })} placeholder="Masukkan jumlah" required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Keterangan {dialogType === "kurangi" && <span className="text-destructive">*</span>}</label>
                  <Input value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} placeholder="Masukkan keterangan" required={dialogType === "kurangi"} />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Batal
                </Button>
                <Button type="submit" variant={dialogType === "tambah" ? "default" : "destructive"}>
                  {dialogType === "tambah" ? "Tambah" : "Kurangi"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};
