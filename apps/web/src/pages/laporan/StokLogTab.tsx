import { ArrowDownCircle, ArrowUpCircle, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingScreen } from "@/components/LoadingScreen";
import { formatCurrency, formatNumber, formatDateTime } from "./utils";
import { exportStokLogToExcel, exportStokLogToPdf } from "./exportService";
import type { LaporanStokLog, PeriodDate } from "./types";

interface StokLogTabProps {
  loading: boolean;
  laporan: LaporanStokLog | null;
  period: PeriodDate;
  showExport?: boolean;
}

export function StokLogTab({ loading, laporan, period, showExport = true }: StokLogTabProps) {
  const handleExport = () => {
    if (laporan) {
      exportStokLogToExcel(laporan, period);
    }
  };

  const handleExportPdf = () => {
    if (laporan) {
      exportStokLogToPdf(laporan, period);
    }
  };

  const bahanCostMap = new Map<number, number>();
  const menuCostMap = new Map<number, number>();
  const menuTotalsMap = new Map<number, { totalHarga: number; totalQty: number }>();
  if (laporan) {
    laporan.per_bahan_baku.forEach((bahan) => {
      const unitCost = bahan.stok_masuk > 0 ? bahan.nilai_masuk / bahan.stok_masuk : bahan.stok_keluar > 0 ? bahan.nilai_keluar / bahan.stok_keluar : 0;
      bahanCostMap.set(bahan.bahan_baku_id, unitCost || 0);
    });

    laporan.logs.forEach((log) => {
      const menuId = (log as any).menu_id as number | undefined;
      const hasHarga = log.harga_beli !== null && log.harga_beli !== undefined;
      if (!menuId || !hasHarga || log.tipe !== "masuk" || !log.jumlah || log.jumlah <= 0) return;
      const current = menuTotalsMap.get(menuId) || { totalHarga: 0, totalQty: 0 };
      menuTotalsMap.set(menuId, {
        totalHarga: current.totalHarga + (log.harga_beli as number),
        totalQty: current.totalQty + log.jumlah,
      });
    });

    menuTotalsMap.forEach((totals, menuId) => {
      const unitCost = totals.totalQty > 0 ? totals.totalHarga / totals.totalQty : 0;
      menuCostMap.set(menuId, unitCost || 0);
    });
  }

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
      {showExport && (
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button onClick={handleExport} className="w-full sm:w-auto">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={handleExportPdf} variant="outline" className="w-full sm:w-auto">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Stok Masuk */}
        <Card>
          <CardContent className="pt-5 sm:pt-6">
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
          <CardContent className="pt-5 sm:pt-6">
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
          <div className="space-y-3 p-4 sm:hidden">
            {laporan.per_bahan_baku.length > 0 ? (
              laporan.per_bahan_baku.map((b, idx) => (
                <div key={idx} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{b.nama}</p>
                      <p className="text-xs text-muted-foreground">{b.satuan_dasar}</p>
                    </div>
                    <Badge variant={b.selisih >= 0 ? "default" : "destructive"}>
                      {b.selisih >= 0 ? "+" : ""}
                      {formatNumber(b.selisih)}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="text-green-600">Masuk: {formatNumber(b.stok_masuk)}</div>
                    <div className="text-red-600">Keluar: {formatNumber(b.stok_keluar)}</div>
                    <div className="text-green-600">Nilai Masuk: {formatCurrency(b.nilai_masuk)}</div>
                    <div className="text-red-600">Nilai Keluar: {formatCurrency(b.nilai_keluar)}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-6">Tidak ada data</p>
            )}
          </div>

          <div className="hidden w-full overflow-x-auto sm:block">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Bahan Baku</TableHead>
                  <TableHead className="text-center text-green-600">Masuk</TableHead>
                  <TableHead className="text-center text-red-600">Keluar</TableHead>
                  <TableHead className="text-center">Selisih</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
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
                      <TableCell className="text-right">
                        <div className="text-xs">
                          <div className="text-green-600">Masuk: {formatCurrency(b.nilai_masuk)}</div>
                          <div className="text-red-600">Keluar: {formatCurrency(b.nilai_keluar)}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Stok Input (Detail per Batch)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            {laporan.logs.length > 0 ? (
              <div className="divide-y">
                {laporan.logs.slice(0, 100).map((log) => {
                  // Determine if this is a menu log or bahan baku log
                  const isMenuLog = (log as any).source === "menu" || (log as any).menu_id;
                  const itemName = isMenuLog ? (log as any).menu?.nama : log.bahan_baku?.nama;
                  const satuan = isMenuLog ? "" : log.bahan_baku?.satuan_dasar;

                  return (
                    <div key={log.id} className="p-4 hover:bg-muted/50 transition">
                      {/* Header Row: Item, Tipe, Source */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-base">{itemName ?? "-"}</h4>
                            <Badge variant="outline" className="text-xs">
                              {isMenuLog ? "🍽️ Menu" : "📦 Bahan Baku"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{log.keterangan || "Tanpa keterangan"}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={log.tipe === "masuk" ? "default" : "destructive"} className={log.tipe === "masuk" ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400" : ""}>
                            {log.tipe === "masuk" ? "📥 Masuk" : "📤 Keluar"}
                          </Badge>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-muted/30 rounded-lg">
                        {/* Jumlah Stok */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">Jumlah</p>
                          <p className="text-sm font-semibold">
                            {log.tipe === "masuk" ? "+" : "-"}
                            {formatNumber(log.jumlah)} {satuan || "unit"}
                          </p>
                        </div>

                        {/* Tanggal */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">Tanggal</p>
                          <p className="text-sm">{formatDateTime(log.created_at)}</p>
                        </div>
                      </div>

                      {/* Harga Batch / Estimasi */}
                      {(() => {
                        const hasHarga = log.harga_beli !== null && log.harga_beli !== undefined;
                        const bahanUnitCost = log.bahan_baku_id ? bahanCostMap.get(log.bahan_baku_id) || 0 : 0;
                        const menuId = (log as any).menu_id as number | undefined;
                        const menuUnitCost = menuId ? menuCostMap.get(menuId) || 0 : 0;
                        const unitCost = isMenuLog ? menuUnitCost : bahanUnitCost;
                        const estimatedTotal = !hasHarga && unitCost > 0 ? Math.abs(log.jumlah) * unitCost : null;
                        const totalHarga = hasHarga ? log.harga_beli : estimatedTotal;
                        const label = hasHarga ? (isMenuLog ? "Harga Input" : "Harga Batch") : unitCost > 0 ? "Estimasi Harga" : "Harga Input";

                        if (totalHarga === null) {
                          return <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg text-xs text-muted-foreground italic">(Tanpa harga input)</div>;
                        }

                        return (
                          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">💰 {label}</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-amber-600 dark:text-amber-400">Total Harga</p>
                                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{formatCurrency(totalHarga as number)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-amber-600 dark:text-amber-400">Per Unit</p>
                                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{Math.abs(log.jumlah) > 0 ? formatCurrency((totalHarga as number) / Math.abs(log.jumlah)) : "-"}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
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
