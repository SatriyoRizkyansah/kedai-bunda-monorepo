import { useState } from "react";
import { ChevronRight, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/LoadingScreen";
import { formatCurrency, formatNumber } from "./utils";
import { exportPenjualanToExcel, exportPenjualanToPdf } from "./exportService";
import type { LaporanPenjualan, PeriodDate } from "./types";

interface PenjualanTabProps {
  loading: boolean;
  laporan: LaporanPenjualan | null;
  period: PeriodDate;
  showExport?: boolean;
}

export function PenjualanTab({ loading, laporan, period, showExport = true }: PenjualanTabProps) {
  const [expandedKategoriUmum, setExpandedKategoriUmum] = useState<number | null>(null);
  const [expandedKategoriJatah, setExpandedKategoriJatah] = useState<number | null>(null);
  const totalUmum = laporan?.ringkasan.total_transaksi_umum;
  const totalJatah = laporan?.ringkasan.total_transaksi_jatah;
  const showTipeBreakdown = totalUmum !== undefined || totalJatah !== undefined;
  const kategoriJatah = laporan?.per_kategori_jatah || [];
  const detailMenuJatah = laporan?.detail_menu_jatah || [];
  const metodePembayaran = laporan?.ringkasan.metode_pembayaran;

  const handleExport = () => {
    if (laporan) {
      exportPenjualanToExcel(laporan, period);
    }
  };

  const handleExportPdf = () => {
    if (laporan) {
      exportPenjualanToPdf(laporan, period);
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Transaksi</p>
            <p className="text-lg sm:text-2xl font-bold text-foreground">{formatNumber(laporan.ringkasan.total_transaksi)}</p>
            {showTipeBreakdown && (
              <p className="text-xs text-muted-foreground mt-1">
                Umum: {formatNumber(totalUmum ?? 0)} • Jatah: {formatNumber(totalJatah ?? 0)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Pendapatan</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(laporan.ringkasan.total_pendapatan)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Hanya transaksi umum</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Bayar</p>
            <p className="text-lg sm:text-2xl font-bold text-foreground">{formatCurrency(laporan.ringkasan.total_bayar)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Rata-rata/Transaksi</p>
            <p className="text-lg sm:text-2xl font-bold text-foreground">{formatCurrency(laporan.ringkasan.rata_rata_per_transaksi)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Metode Pembayaran */}
      <Card>
        <CardHeader>
          <CardTitle>Metode Pembayaran (Transaksi Umum)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-xs sm:text-sm text-muted-foreground">Tunai</p>
              <p className="text-lg font-bold mt-1">{formatNumber(metodePembayaran?.tunai?.jumlah_transaksi ?? 0)} transaksi</p>
              <p className="text-sm text-green-600 mt-1">{formatCurrency(metodePembayaran?.tunai?.total_nominal ?? 0)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs sm:text-sm text-muted-foreground">QRIS</p>
              <p className="text-lg font-bold mt-1">{formatNumber(metodePembayaran?.qris?.jumlah_transaksi ?? 0)} transaksi</p>
              <p className="text-sm text-green-600 mt-1">{formatCurrency(metodePembayaran?.qris?.total_nominal ?? 0)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs sm:text-sm text-muted-foreground">Transfer</p>
              <p className="text-lg font-bold mt-1">{formatNumber(metodePembayaran?.transfer?.jumlah_transaksi ?? 0)} transaksi</p>
              <p className="text-sm text-green-600 mt-1">{formatCurrency(metodePembayaran?.transfer?.total_nominal ?? 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per Kategori - Umum */}
      <Card>
        <CardHeader>
          <CardTitle>Penjualan per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          {laporan.per_kategori.length > 0 ? (
            <div className="space-y-2">
              {laporan.per_kategori.map((kat, idx) => {
                const menuKategori = laporan.detail_menu.filter((m) => m.kategori === kat.kategori);
                const isOpen = expandedKategoriUmum === idx;

                return (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedKategoriUmum(isOpen ? null : idx)}
                      className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 bg-muted/50 hover:bg-muted/70 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <p className="font-medium capitalize text-base">{kat.kategori}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(kat.jumlah_transaksi)} transaksi • {formatNumber(kat.total_item)} item
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                        <p className="font-semibold text-green-600">{formatCurrency(kat.total_pendapatan)}</p>
                        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-3 sm:p-4 bg-white dark:bg-slate-950 border-t space-y-2">
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

      {/* Per Kategori - Jatah Karyawan */}
      {kategoriJatah.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Jatah Karyawan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {kategoriJatah.map((kat, idx) => {
                const menuKategori = detailMenuJatah.filter((m) => m.kategori === kat.kategori);
                const isOpen = expandedKategoriJatah === idx;

                return (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedKategoriJatah(isOpen ? null : idx)}
                      className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <p className="font-medium capitalize text-base">{kat.kategori}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(kat.jumlah_transaksi)} transaksi • {formatNumber(kat.total_item)} item
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                        <p className="font-semibold text-amber-600">{formatCurrency(kat.total_pendapatan)}</p>
                        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-3 sm:p-4 bg-white dark:bg-slate-950 border-t space-y-2">
                        {menuKategori.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Konsumsi karyawan (tidak masuk pendapatan):</p>
                            {menuKategori.map((menu) => (
                              <div key={menu.menu_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{menu.nama}</p>
                                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                    <span>📦 {formatNumber(menu.total_terjual)} pcs</span>
                                    <span>•</span>
                                    <span>🧑‍🍳 {formatNumber(menu.jumlah_transaksi)}x</span>
                                  </div>
                                </div>
                                <div className="text-right ml-4 flex-shrink-0">
                                  <p className="text-xs text-muted-foreground">@{formatCurrency(menu.harga_jual)}</p>
                                  <p className="font-semibold text-amber-600 text-sm">{formatCurrency(menu.total_pendapatan)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground text-sm py-4">Tidak ada konsumsi di kategori ini</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
