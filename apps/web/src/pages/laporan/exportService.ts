import * as XLSX from "xlsx";
import { formatDate, formatDateTime } from "./utils";
import type { LaporanPenjualan, LaporanStokLog, LaporanKeuntungan, PeriodDate } from "./types";

export const exportPenjualanToExcel = (laporan: LaporanPenjualan, period: PeriodDate) => {
  const wb = XLSX.utils.book_new();

  // Ringkasan
  const ringkasanData = [
    ["Laporan Penjualan"],
    ["Periode", `${formatDate(period.mulai)} - ${formatDate(period.selesai)}`],
    [],
    ["Total Transaksi", laporan.ringkasan.total_transaksi],
    ["Total Pendapatan", laporan.ringkasan.total_pendapatan],
    ["Rata-rata per Transaksi", laporan.ringkasan.rata_rata_per_transaksi],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(ringkasanData);
  XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan");

  // Per Kategori
  const kategoriHeader = ["Kategori", "Jumlah Transaksi", "Total Item", "Total Pendapatan"];
  const kategoriData = laporan.per_kategori.map((k) => [k.kategori, k.jumlah_transaksi, k.total_item, k.total_pendapatan]);
  const ws2 = XLSX.utils.aoa_to_sheet([kategoriHeader, ...kategoriData]);
  XLSX.utils.book_append_sheet(wb, ws2, "Per Kategori");

  // Detail Menu
  const menuHeader = ["Menu", "Kategori", "Harga Jual", "Total Terjual", "Jumlah Transaksi", "Total Pendapatan"];
  const menuData = laporan.detail_menu.map((m) => [m.nama, m.kategori, m.harga_jual, m.total_terjual, m.jumlah_transaksi, m.total_pendapatan]);
  const ws3 = XLSX.utils.aoa_to_sheet([menuHeader, ...menuData]);
  XLSX.utils.book_append_sheet(wb, ws3, "Detail Menu");

  XLSX.writeFile(wb, `Laporan_Penjualan_${period.mulai}_${period.selesai}.xlsx`);
};

export const exportStokLogToExcel = (laporan: LaporanStokLog, period: PeriodDate) => {
  const wb = XLSX.utils.book_new();

  // Ringkasan
  const ringkasanData = [
    ["Laporan Stok Masuk/Keluar"],
    ["Periode", `${formatDate(period.mulai)} - ${formatDate(period.selesai)}`],
    [],
    ["STOK MASUK"],
    ["Jumlah Transaksi", laporan.ringkasan.stok_masuk.jumlah_transaksi],
    ["Total Unit", laporan.ringkasan.stok_masuk.total_unit],
    ["Nilai", laporan.ringkasan.stok_masuk.nilai],
    [],
    ["STOK KELUAR"],
    ["Jumlah Transaksi", laporan.ringkasan.stok_keluar.jumlah_transaksi],
    ["Total Unit", laporan.ringkasan.stok_keluar.total_unit],
    ["Nilai", laporan.ringkasan.stok_keluar.nilai],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(ringkasanData);
  XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan");

  // Per Bahan Baku
  const bahanHeader = ["Bahan Baku", "Satuan", "Stok Masuk", "Stok Keluar", "Selisih", "Nilai Masuk", "Nilai Keluar"];
  const bahanData = laporan.per_bahan_baku.map((b) => [b.nama, b.satuan_dasar, b.stok_masuk, b.stok_keluar, b.selisih, b.nilai_masuk, b.nilai_keluar]);
  const ws2 = XLSX.utils.aoa_to_sheet([bahanHeader, ...bahanData]);
  XLSX.utils.book_append_sheet(wb, ws2, "Per Bahan Baku");

  // Detail Log
  const logHeader = ["Tanggal", "Bahan Baku", "Tipe", "Jumlah", "Keterangan", "User"];
  const logData = laporan.logs.map((l) => [formatDateTime(l.created_at), l.bahan_baku?.nama ?? "-", l.tipe === "masuk" ? "Masuk" : "Keluar", l.jumlah, l.keterangan, l.user?.name ?? "-"]);
  const ws3 = XLSX.utils.aoa_to_sheet([logHeader, ...logData]);
  XLSX.utils.book_append_sheet(wb, ws3, "Detail Log");

  XLSX.writeFile(wb, `Laporan_Stok_${period.mulai}_${period.selesai}.xlsx`);
};

export const exportKeuntunganToExcel = (laporan: LaporanKeuntungan, period: PeriodDate) => {
  const wb = XLSX.utils.book_new();

  // Ringkasan
  const ringkasanData = [
    ["Laporan Keuntungan / Laba Rugi"],
    ["Periode", `${formatDate(period.mulai)} - ${formatDate(period.selesai)}`],
    [],
    ["Total Transaksi", laporan.ringkasan.total_transaksi],
    ["Total Pendapatan", laporan.ringkasan.total_pendapatan],
    ["Total HPP (Harga Pokok Penjualan)", laporan.ringkasan.total_hpp],
    ["Laba Kotor", laporan.ringkasan.laba_kotor],
    ["Margin Kotor (%)", laporan.ringkasan.margin_kotor_persen],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(ringkasanData);
  XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan");

  // Per Menu
  const menuHeader = ["Menu", "Kategori", "Harga Jual", "HPP/Unit", "Margin/Unit", "Terjual", "Pendapatan", "HPP Total", "Laba"];
  const menuData = laporan.per_menu.map((m) => [m.nama_menu, m.kategori, m.harga_jual, m.hpp_per_unit, m.margin_per_unit, m.jumlah_terjual, m.total_pendapatan, m.total_hpp, m.total_laba]);
  const ws2 = XLSX.utils.aoa_to_sheet([menuHeader, ...menuData]);
  XLSX.utils.book_append_sheet(wb, ws2, "Per Menu");

  // Trend Harian
  const trendHeader = ["Tanggal", "Hari", "Pendapatan", "HPP", "Laba"];
  const trendData = laporan.trend_harian.map((t) => [t.tanggal, t.hari, t.pendapatan, t.hpp, t.laba]);
  const ws3 = XLSX.utils.aoa_to_sheet([trendHeader, ...trendData]);
  XLSX.utils.book_append_sheet(wb, ws3, "Trend Harian");

  XLSX.writeFile(wb, `Laporan_Keuntungan_${period.mulai}_${period.selesai}.xlsx`);
};
