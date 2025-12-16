import { useState } from "react";
import { ChevronRight, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/LoadingScreen";
import { formatCurrency, formatNumber } from "./utils";
import { exportPenjualanToExcel } from "./exportService";
import type { LaporanPenjualan, PeriodDate } from "./types";

interface PenjualanTabProps {
  loading: boolean;
  laporan: LaporanPenjualan | null;
  period: PeriodDate;
}

export function PenjualanTab({ loading, laporan, period }: PenjualanTabProps) {
  const [expandedKategori, setExpandedKategori] = useState<number | null>(null);

  const handleExport = () => {
    if (laporan) {
      exportPenjualanToExcel(laporan, period);
    }
  };

  if (loading) {
    return <LoadingScreen message="Memuat laporan penjualan..." size="md" />;
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
            <p className="text-sm text-muted-foreground">Total Transaksi</p>
            <p className="text-2xl font-bold text-foreground">{formatNumber(laporan.ringkasan.total_transaksi)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Pendapatan</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(laporan.ringkasan.total_pendapatan)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Bayar</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(laporan.ringkasan.total_bayar)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Rata-rata/Transaksi</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(laporan.ringkasan.rata_rata_per_transaksi)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Per Kategori dengan Detail Menu */}
      <Card>
        <CardHeader>
          <CardTitle>Penjualan per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          {laporan.per_kategori.length > 0 ? (
            <div className="space-y-2">
              {laporan.per_kategori.map((kat, idx) => {
                // Filter menu untuk kategori ini
                const menuKategori = laporan.detail_menu.filter((m) => m.kategori === kat.kategori);
                const isOpen = expandedKategori === idx;

                return (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    {/* Header Kategori - Collapsible */}
                    <button onClick={() => setExpandedKategori(isOpen ? null : idx)} className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted/70 transition-colors text-left">
                      <div className="flex-1">
                        <p className="font-medium capitalize text-base">{kat.kategori}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(kat.jumlah_transaksi)} transaksi • {formatNumber(kat.total_item)} item
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-green-600">{formatCurrency(kat.total_pendapatan)}</p>
                        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      </div>
                    </button>

                    {/* Detail Menu - Collapsible Content */}
                    {isOpen && (
                      <div className="p-4 bg-white dark:bg-slate-950 border-t space-y-2">
                        {menuKategori.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Menu dalam kategori ini:</p>
                            {menuKategori.map((menu) => (
                              <div key={menu.menu_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{menu.nama}</p>
                                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                    <span>📦 {formatNumber(menu.total_terjual)} pcs</span>
                                    <span>•</span>
                                    <span>🛒 {formatNumber(menu.jumlah_transaksi)}x</span>
                                  </div>
                                </div>
                                <div className="text-right ml-4 flex-shrink-0">
                                  <p className="text-xs text-muted-foreground">@{formatCurrency(menu.harga_jual)}</p>
                                  <p className="font-semibold text-green-600 text-sm">{formatCurrency(menu.total_pendapatan)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground text-sm py-4">Tidak ada menu dalam kategori ini</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Tidak ada data penjualan di periode ini</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
