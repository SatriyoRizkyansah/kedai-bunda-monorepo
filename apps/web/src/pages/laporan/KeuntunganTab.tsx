import { TrendingUp, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingScreen } from "@/components/LoadingScreen";
import { formatCurrency, formatNumber, formatDate } from "./utils";
import { exportKeuntunganToExcel } from "./exportService";
import type { LaporanKeuntungan, PeriodDate } from "./types";

interface KeuntunganTabProps {
  loading: boolean;
  laporan: LaporanKeuntungan | null;
  period: PeriodDate;
}

export function KeuntunganTab({ loading, laporan, period }: KeuntunganTabProps) {
  const handleExport = () => {
    if (laporan) {
      exportKeuntunganToExcel(laporan, period);
    }
  };

  if (loading) {
    return <LoadingScreen message="Memuat laporan keuntungan..." size="md" />;
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Pendapatan</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(laporan.ringkasan.total_pendapatan)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total HPP</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(laporan.ringkasan.total_hpp)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Laba Kotor</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(laporan.ringkasan.laba_kotor)}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">{laporan.ringkasan.margin_kotor_persen.toFixed(1)}% margin</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Biaya Stok Masuk</p>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(laporan.ringkasan.biaya_pembelian_stok)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Profit per Menu */}
      <Card>
        <CardHeader>
          <CardTitle>Keuntungan per Menu</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Menu</TableHead>
                <TableHead className="text-center">Terjual</TableHead>
                <TableHead className="text-right">Pendapatan</TableHead>
                <TableHead className="text-right">HPP</TableHead>
                <TableHead className="text-right">Laba</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laporan.per_menu.length > 0 ? (
                laporan.per_menu.map((m, idx) => {
                  const margin = m.total_pendapatan > 0 ? ((m.total_laba / m.total_pendapatan) * 100).toFixed(1) : "0";
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        <p className="font-medium">{m.nama_menu}</p>
                        <p className="text-xs text-muted-foreground capitalize">{m.kategori}</p>
                      </TableCell>
                      <TableCell className="text-center">{formatNumber(m.jumlah_terjual)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(m.total_pendapatan)}</TableCell>
                      <TableCell className="text-right text-red-600">{formatCurrency(m.total_hpp)}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">{formatCurrency(m.total_laba)}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={parseFloat(margin) >= 30 ? "default" : parseFloat(margin) >= 15 ? "secondary" : "destructive"}
                          className={
                            parseFloat(margin) >= 30 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : parseFloat(margin) >= 15 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : ""
                          }
                        >
                          {margin}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Daily Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Harian</CardTitle>
        </CardHeader>
        <CardContent>
          {laporan.trend_harian.length > 0 ? (
            <div className="space-y-2">
              {laporan.trend_harian.map((t, idx) => (
                <div key={idx} className="flex items-center gap-4 p-2 rounded hover:bg-muted/50">
                  <div className="w-24 flex-shrink-0">
                    <p className="text-sm font-medium">{t.hari}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.tanggal)}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2 mb-1">
                      <div
                        className="h-2 bg-primary rounded"
                        style={{
                          width: `${(t.pendapatan / Math.max(...laporan.trend_harian.map((x) => x.pendapatan), 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Pendapatan: {formatCurrency(t.pendapatan)}</span>
                      <span className="text-green-600 font-medium">Laba: {formatCurrency(t.laba)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Tidak ada data di periode ini</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
