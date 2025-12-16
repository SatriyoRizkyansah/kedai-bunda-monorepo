import { ArrowDownCircle, ArrowUpCircle, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingScreen } from "@/components/LoadingScreen";
import { formatCurrency, formatNumber, formatDateTime } from "./utils";
import { exportStokLogToExcel } from "./exportService";
import type { LaporanStokLog, PeriodDate } from "./types";

interface StokLogTabProps {
  loading: boolean;
  laporan: LaporanStokLog | null;
  period: PeriodDate;
}

export function StokLogTab({ loading, laporan, period }: StokLogTabProps) {
  const handleExport = () => {
    if (laporan) {
      exportStokLogToExcel(laporan, period);
    }
  };

  if (loading) {
    return <LoadingScreen message="Memuat laporan stok..." size="md" />;
  }

  if (!laporan) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Tidak ada data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stok Masuk */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ArrowDownCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stok Masuk</p>
                <p className="text-xl font-bold text-green-600">+{formatNumber(laporan.ringkasan.stok_masuk.total_unit)} unit</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Transaksi</p>
                <p className="font-medium">{laporan.ringkasan.stok_masuk.jumlah_transaksi}x</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nilai</p>
                <p className="font-medium text-green-600">{formatCurrency(laporan.ringkasan.stok_masuk.nilai)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stok Keluar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <ArrowUpCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stok Keluar</p>
                <p className="text-xl font-bold text-red-600">-{formatNumber(laporan.ringkasan.stok_keluar.total_unit)} unit</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Transaksi</p>
                <p className="font-medium">{laporan.ringkasan.stok_keluar.jumlah_transaksi}x</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nilai</p>
                <p className="font-medium text-red-600">{formatCurrency(laporan.ringkasan.stok_keluar.nilai)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per Bahan Baku Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan per Bahan Baku</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bahan Baku</TableHead>
                <TableHead className="text-center text-green-600">Masuk</TableHead>
                <TableHead className="text-center text-red-600">Keluar</TableHead>
                <TableHead className="text-center">Selisih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laporan.per_bahan_baku.length > 0 ? (
                laporan.per_bahan_baku.map((b, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <p className="font-medium">{b.nama}</p>
                      <p className="text-xs text-muted-foreground">{b.satuan_dasar}</p>
                    </TableCell>
                    <TableCell className="text-center text-green-600">+{formatNumber(b.stok_masuk)}</TableCell>
                    <TableCell className="text-center text-red-600">-{formatNumber(b.stok_keluar)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={b.selisih >= 0 ? "default" : "destructive"}>
                        {b.selisih >= 0 ? "+" : ""}
                        {formatNumber(b.selisih)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto">
            {laporan.logs.length > 0 ? (
              <div className="divide-y">
                {laporan.logs.slice(0, 50).map((log) => (
                  <div key={log.id} className="p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${log.tipe === "masuk" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                      {log.tipe === "masuk" ? <ArrowDownCircle className="h-4 w-4 text-green-600" /> : <ArrowUpCircle className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{log.bahan_baku?.nama ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">{log.keterangan}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${log.tipe === "masuk" ? "text-green-600" : "text-red-600"}`}>
                        {log.tipe === "masuk" ? "+" : "-"}
                        {formatNumber(log.jumlah)} {log.bahan_baku?.satuan_dasar}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Tidak ada riwayat di periode ini</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
