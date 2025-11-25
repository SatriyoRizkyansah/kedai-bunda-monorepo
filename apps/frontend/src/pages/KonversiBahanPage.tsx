import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { KonversiBahan } from "@/lib/types";
import { Plus, Pencil, Trash2, ArrowRightLeft } from "lucide-react";

export function KonversiBahanPage() {
  const [konversi, setKonversi] = useState<KonversiBahan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKonversi();
  }, []);

  const fetchKonversi = async () => {
    setLoading(true);
    try {
      const response = await api.get("/konversi-bahan");
      console.log("Konversi Response:", response.data);
      setKonversi(response.data.data || []);
    } catch (error) {
      console.error("Error fetching konversi:", error);
      alert("Gagal memuat data konversi bahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus konversi ini?")) return;

    try {
      await api.delete(`/konversi-bahan/${id}`);
      fetchKonversi();
    } catch (error: any) {
      console.error("Error deleting:", error);
      alert(error.response?.data?.pesan || "Gagal menghapus konversi");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: "var(--font-sans)" }}>
              Konversi Bahan
            </h2>
            <p className="text-muted-foreground mt-2" style={{ fontFamily: "var(--font-sans)" }}>
              Kelola konversi satuan bahan baku
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
            Tambah Konversi
          </Button>
        </div>

        {/* Info Card */}
        <Card
          className="bg-primary/5 border-primary/20"
          style={{
            boxShadow: "var(--shadow-sm)",
            borderRadius: "var(--radius)",
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div
                className="bg-primary/10 p-3"
                style={{
                  borderRadius: "var(--radius)",
                }}
              >
                <ArrowRightLeft className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2" style={{ fontFamily: "var(--font-sans)" }}>
                  Tentang Konversi Bahan
                </h3>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                  Konversi bahan digunakan untuk mengonversi satuan bahan baku ke satuan yang lebih kecil. Contoh: 1 ekor ayam = 8 potong, 1 liter nasi = 12 porsi
                </p>
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
              Daftar Konversi Bahan
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
            ) : konversi.length === 0 ? (
              <div className="text-center py-12">
                <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                  Belum ada konversi bahan
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bahan Baku</TableHead>
                    <TableHead>Satuan Asal</TableHead>
                    <TableHead>Satuan Tujuan</TableHead>
                    <TableHead className="text-right">Nilai Konversi</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {konversi.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-foreground">{item.bahan_baku?.nama || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{item.bahan_baku?.satuan || "-"}</TableCell>
                      <TableCell className="text-foreground">{item.satuan_konversi}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className="font-mono text-primary border-primary/30"
                          style={{
                            borderRadius: "calc(var(--radius) - 2px)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {item.nilai_konversi}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{item.keterangan || "-"}</TableCell>
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
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            style={{
                              borderRadius: "calc(var(--radius) - 4px)",
                            }}
                            onClick={() => handleDelete(item.id)}
                          >
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
      </div>
    </DashboardLayout>
  );
}
