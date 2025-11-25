import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Search, ArrowUpCircle, ArrowDownCircle, AlertCircle, History, Plus, Minus } from "lucide-react";
import api from "../lib/api";
import type { StokLog } from "../lib/types";

interface StokStats {
  total_masuk: number;
  total_keluar: number;
  total_penyesuaian: number;
}

export const StokLogPage = () => {
  const [stokLogs, setStokLogs] = useState<StokLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<StokLog[]>([]);
  const [stats, setStats] = useState<StokStats>({
    total_masuk: 0,
    total_keluar: 0,
    total_penyesuaian: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tipeFilter, setTipeFilter] = useState<string>("semua");

  useEffect(() => {
    fetchStokLogs();
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-sans)" }}>
            Riwayat Stok
          </h1>
          <p className="text-muted-foreground">Kelola dan pantau pergerakan stok bahan baku</p>
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
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "rgb(var(--primary))" }} />
              </div>
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
      </div>
    </DashboardLayout>
  );
};
