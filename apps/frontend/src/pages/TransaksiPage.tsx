import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Transaksi } from "@/lib/types";
import { Plus, Search, Eye, XCircle, ShoppingCart, Calendar, DollarSign } from "lucide-react";

export function TransaksiPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("semua");

  useEffect(() => {
    fetchTransaksi();
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
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Memuat data...
                  </p>
                </div>
              </div>
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
      </div>
    </DashboardLayout>
  );
}
