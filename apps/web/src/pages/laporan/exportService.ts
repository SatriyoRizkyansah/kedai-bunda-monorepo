import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "./utils";
import type { LaporanPenjualan, LaporanStokLog, LaporanKeuntungan, PeriodDate } from "./types";

type LaporanLengkap = {
  penjualan: LaporanPenjualan;
  stokLog: LaporanStokLog;
  keuntungan: LaporanKeuntungan;
};

const safeSheetName = (name: string) => {
  // Excel sheet name limit is 31 chars; also avoid characters that Excel rejects.
  return name.replace(/[:\\/?*\[\]]/g, " ").slice(0, 31);
};

const buildStokCostMaps = (stokLog: LaporanStokLog) => {
  const bahanUnitCost = new Map<number, number>();
  const menuUnitCost = new Map<number, number>();

  stokLog.per_bahan_baku.forEach((b) => {
    const unitCost = b.stok_masuk > 0 ? b.nilai_masuk / b.stok_masuk : b.stok_keluar > 0 ? b.nilai_keluar / b.stok_keluar : 0;
    bahanUnitCost.set(b.bahan_baku_id, Number.isFinite(unitCost) ? unitCost : 0);
  });

  // Menu unit cost from logs masuk that have harga_beli
  const menuTotals = new Map<number, { totalHarga: number; totalQty: number }>();
  stokLog.logs.forEach((log) => {
    const menuId = (log as any).menu_id as number | undefined;
    const hasHarga = log.harga_beli !== null && log.harga_beli !== undefined;
    if (!menuId || !hasHarga || log.tipe !== "masuk" || !log.jumlah || log.jumlah <= 0) return;

    const current = menuTotals.get(menuId) || { totalHarga: 0, totalQty: 0 };
    menuTotals.set(menuId, {
      totalHarga: current.totalHarga + (log.harga_beli as number),
      totalQty: current.totalQty + log.jumlah,
    });
  });

  menuTotals.forEach((totals, menuId) => {
    const unitCost = totals.totalQty > 0 ? totals.totalHarga / totals.totalQty : 0;
    menuUnitCost.set(menuId, Number.isFinite(unitCost) ? unitCost : 0);
  });

  return { bahanUnitCost, menuUnitCost };
};

const resolveStokLogRow = (_stokLog: LaporanStokLog, log: LaporanStokLog["logs"][number], maps: ReturnType<typeof buildStokCostMaps>) => {
  const isMenuLog = (log as any).source === "menu" || Boolean((log as any).menu_id);
  const itemName = isMenuLog ? ((log as any).menu?.nama ?? "-") : (log.bahan_baku?.nama ?? "-");
  const satuan = isMenuLog ? "unit" : (log.bahan_baku?.satuan_dasar ?? "unit");

  const qty = typeof log.jumlah === "number" ? log.jumlah : 0;
  const absQty = Math.abs(qty || 0);

  const hasHarga = log.harga_beli !== null && log.harga_beli !== undefined;
  const bahanId = log.bahan_baku_id ?? undefined;
  const menuId = (log as any).menu_id as number | undefined;
  const unitCost = isMenuLog ? (menuId ? maps.menuUnitCost.get(menuId) || 0 : 0) : bahanId ? maps.bahanUnitCost.get(bahanId) || 0 : 0;

  const estimatedTotal = !hasHarga && unitCost > 0 && absQty > 0 ? absQty * unitCost : null;
  const totalHarga = hasHarga ? (log.harga_beli as number) : estimatedTotal;
  const sumberHarga = hasHarga ? "input" : estimatedTotal !== null ? "estimasi" : "kosong";
  const hargaPerUnit = totalHarga !== null && absQty > 0 ? totalHarga / absQty : null;

  return {
    isMenuLog,
    itemName,
    satuan,
    qty,
    absQty,
    totalHarga,
    hargaPerUnit,
    sumberHarga,
  };
};

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

export const exportLaporanLengkapToExcel = (data: LaporanLengkap, period: PeriodDate) => {
  const wb = XLSX.utils.book_new();
  const generatedAt = new Date().toISOString();

  // Ringkasan (gabungan)
  const ringkasanData = [
    ["Laporan Lengkap"],
    ["Periode", `${formatDate(period.mulai)} - ${formatDate(period.selesai)}`],
    ["Generated", generatedAt],
    [],
    ["PENJUALAN"],
    ["Total Transaksi", data.penjualan.ringkasan.total_transaksi],
    ["Total Pendapatan", data.penjualan.ringkasan.total_pendapatan],
    ["Rata-rata / Transaksi", data.penjualan.ringkasan.rata_rata_per_transaksi],
    [],
    ["KEUNTUNGAN"],
    ["Total Pendapatan", data.keuntungan.ringkasan.total_pendapatan],
    ["Total HPP", data.keuntungan.ringkasan.total_hpp],
    ["Laba Kotor", data.keuntungan.ringkasan.laba_kotor],
    ["Margin Kotor (%)", data.keuntungan.ringkasan.margin_kotor_persen],
    [],
    ["STOK LOG"],
    ["Stok Masuk (unit)", data.stokLog.ringkasan.stok_masuk.total_unit],
    ["Stok Masuk (nilai)", data.stokLog.ringkasan.stok_masuk.nilai],
    ["Stok Keluar (unit)", data.stokLog.ringkasan.stok_keluar.total_unit],
    ["Stok Keluar (nilai)", data.stokLog.ringkasan.stok_keluar.nilai],
  ];
  const wsRingkasan = XLSX.utils.aoa_to_sheet(ringkasanData);
  XLSX.utils.book_append_sheet(wb, wsRingkasan, safeSheetName("Ringkasan"));

  // Penjualan: per kategori
  const jualKategoriHeader = ["Kategori", "Jumlah Transaksi", "Total Item", "Total Pendapatan"];
  const jualKategoriData = data.penjualan.per_kategori.map((k) => [k.kategori, k.jumlah_transaksi, k.total_item, k.total_pendapatan]);
  const wsJualKategori = XLSX.utils.aoa_to_sheet([jualKategoriHeader, ...jualKategoriData]);
  XLSX.utils.book_append_sheet(wb, wsJualKategori, safeSheetName("Jual Kategori"));

  // Penjualan: detail menu
  const jualMenuHeader = ["Menu", "Kategori", "Harga Jual", "Total Terjual", "Jumlah Transaksi", "Total Pendapatan"];
  const jualMenuData = data.penjualan.detail_menu.map((m) => [m.nama, m.kategori, m.harga_jual, m.total_terjual, m.jumlah_transaksi, m.total_pendapatan]);
  const wsJualMenu = XLSX.utils.aoa_to_sheet([jualMenuHeader, ...jualMenuData]);
  XLSX.utils.book_append_sheet(wb, wsJualMenu, safeSheetName("Jual Menu"));

  // Keuntungan: per menu
  const untungMenuHeader = ["Menu", "Kategori", "Harga Jual", "HPP/Unit", "Margin/Unit", "Terjual", "Pendapatan", "HPP Total", "Laba", "Margin (%)"];
  const untungMenuData = data.keuntungan.per_menu.map((m) => {
    const margin = m.total_pendapatan > 0 ? (m.total_laba / m.total_pendapatan) * 100 : 0;
    return [m.nama_menu, m.kategori, m.harga_jual, m.hpp_per_unit, m.margin_per_unit, m.jumlah_terjual, m.total_pendapatan, m.total_hpp, m.total_laba, margin];
  });
  const wsUntungMenu = XLSX.utils.aoa_to_sheet([untungMenuHeader, ...untungMenuData]);
  XLSX.utils.book_append_sheet(wb, wsUntungMenu, safeSheetName("Untung Menu"));

  // Keuntungan: trend harian
  const untungTrendHeader = ["Tanggal", "Hari", "Pendapatan", "HPP", "Laba", "Margin (%)"];
  const untungTrendData = data.keuntungan.trend_harian.map((t) => {
    const margin = t.pendapatan > 0 ? (t.laba / t.pendapatan) * 100 : 0;
    return [t.tanggal, t.hari, t.pendapatan, t.hpp, t.laba, margin];
  });
  const wsUntungTrend = XLSX.utils.aoa_to_sheet([untungTrendHeader, ...untungTrendData]);
  XLSX.utils.book_append_sheet(wb, wsUntungTrend, safeSheetName("Untung Trend"));

  // Stok: ringkasan per bahan
  const stokBahanHeader = ["Bahan Baku", "Satuan", "Stok Masuk", "Stok Keluar", "Selisih", "Nilai Masuk", "Nilai Keluar", "Estimasi Harga/Unit"];
  const stokBahanData = data.stokLog.per_bahan_baku.map((b) => {
    const unitCost = b.stok_masuk > 0 ? b.nilai_masuk / b.stok_masuk : b.stok_keluar > 0 ? b.nilai_keluar / b.stok_keluar : 0;
    return [b.nama, b.satuan_dasar, b.stok_masuk, b.stok_keluar, b.selisih, b.nilai_masuk, b.nilai_keluar, Number.isFinite(unitCost) ? unitCost : 0];
  });
  const wsStokBahan = XLSX.utils.aoa_to_sheet([stokBahanHeader, ...stokBahanData]);
  XLSX.utils.book_append_sheet(wb, wsStokBahan, safeSheetName("Stok Bahan"));

  // Stok: detail logs (with estimasi harga jika kosong)
  const maps = buildStokCostMaps(data.stokLog);
  const stokLogsHeader = ["Tanggal", "Source", "Item", "Tipe", "Jumlah", "Satuan", "Harga Total", "Harga/Unit", "Sumber Harga", "Keterangan", "User"];
  const stokLogsData = data.stokLog.logs.map((l) => {
    const row = resolveStokLogRow(data.stokLog, l, maps);
    return [
      formatDateTime(l.created_at),
      row.isMenuLog ? "menu" : "bahan_baku",
      row.itemName,
      l.tipe === "masuk" ? "Masuk" : "Keluar",
      l.jumlah,
      row.satuan,
      row.totalHarga,
      row.hargaPerUnit,
      row.sumberHarga,
      l.keterangan,
      l.user?.name ?? "-",
    ];
  });
  const wsStokLogs = XLSX.utils.aoa_to_sheet([stokLogsHeader, ...stokLogsData]);
  XLSX.utils.book_append_sheet(wb, wsStokLogs, safeSheetName("Stok Logs"));

  XLSX.writeFile(wb, `Laporan_Lengkap_${period.mulai}_${period.selesai}.xlsx`);
};

export const exportLaporanLengkapToPdf = (data: LaporanLengkap, period: PeriodDate) => {
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const now = new Date();
  const generated = now.toLocaleString("id-ID");

  const addTitle = () => {
    doc.setFontSize(16);
    doc.text("Laporan Lengkap", marginX, 16);
    doc.setFontSize(10);
    doc.text(`Periode: ${formatDate(period.mulai)} - ${formatDate(period.selesai)}`, marginX, 22);
    doc.text(`Generated: ${generated}`, marginX, 27);
    doc.setDrawColor(180);
    doc.line(marginX, 30, pageWidth - marginX, 30);
  };

  addTitle();
  let cursorY = 34;

  const addSectionHeader = (title: string) => {
    doc.setFontSize(13);
    doc.text(title, marginX, cursorY);
    cursorY += 2;
  };

  // === PENJUALAN ===
  addSectionHeader("Penjualan");
  autoTable(doc, {
    startY: cursorY + 2,
    head: [["Metrik", "Nilai"]],
    body: [
      ["Total Transaksi", formatNumber(data.penjualan.ringkasan.total_transaksi)],
      ["Total Pendapatan", formatCurrency(data.penjualan.ringkasan.total_pendapatan)],
      ["Total Bayar", formatCurrency(data.penjualan.ringkasan.total_bayar)],
      ["Rata-rata / Transaksi", formatCurrency(data.penjualan.ringkasan.rata_rata_per_transaksi)],
    ],
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [245, 245, 245], textColor: 20 },
    margin: { left: marginX, right: marginX },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: cursorY,
    head: [["Kategori", "Transaksi", "Item", "Pendapatan"]],
    body: data.penjualan.per_kategori.map((k) => [k.kategori, formatNumber(k.jumlah_transaksi), formatNumber(k.total_item), formatCurrency(k.total_pendapatan)]),
    theme: "striped",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [245, 245, 245], textColor: 20 },
    margin: { left: marginX, right: marginX },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: cursorY,
    head: [["Menu", "Kategori", "@Harga", "Terjual", "Transaksi", "Pendapatan"]],
    body: data.penjualan.detail_menu.map((m) => [m.nama, m.kategori, formatCurrency(m.harga_jual), formatNumber(m.total_terjual), formatNumber(m.jumlah_transaksi), formatCurrency(m.total_pendapatan)]),
    theme: "striped",
    styles: { fontSize: 7 },
    headStyles: { fillColor: [245, 245, 245], textColor: 20 },
    margin: { left: marginX, right: marginX },
    columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 25 } },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // === KEUNTUNGAN ===
  addSectionHeader("Keuntungan");
  autoTable(doc, {
    startY: cursorY + 2,
    head: [["Metrik", "Nilai"]],
    body: [
      ["Total Pendapatan", formatCurrency(data.keuntungan.ringkasan.total_pendapatan)],
      ["Total HPP", formatCurrency(data.keuntungan.ringkasan.total_hpp)],
      ["Laba Kotor", formatCurrency(data.keuntungan.ringkasan.laba_kotor)],
      ["Margin Kotor (%)", `${data.keuntungan.ringkasan.margin_kotor_persen.toFixed(1)}%`],
    ],
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [245, 245, 245], textColor: 20 },
    margin: { left: marginX, right: marginX },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: cursorY,
    head: [["Menu", "Kategori", "Terjual", "Pendapatan", "HPP", "Laba", "Margin"]],
    body: data.keuntungan.per_menu.map((m) => {
      const margin = m.total_pendapatan > 0 ? (m.total_laba / m.total_pendapatan) * 100 : 0;
      return [m.nama_menu, m.kategori, formatNumber(m.jumlah_terjual), formatCurrency(m.total_pendapatan), formatCurrency(m.total_hpp), formatCurrency(m.total_laba), `${margin.toFixed(1)}%`];
    }),
    theme: "striped",
    styles: { fontSize: 7 },
    headStyles: { fillColor: [245, 245, 245], textColor: 20 },
    margin: { left: marginX, right: marginX },
    columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 25 } },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: cursorY,
    head: [["Tanggal", "Hari", "Pendapatan", "HPP", "Laba", "Margin"]],
    body: data.keuntungan.trend_harian.map((t) => {
      const margin = t.pendapatan > 0 ? (t.laba / t.pendapatan) * 100 : 0;
      return [formatDate(t.tanggal), t.hari, formatCurrency(t.pendapatan), formatCurrency(t.hpp), formatCurrency(t.laba), `${margin.toFixed(1)}%`];
    }),
    theme: "striped",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [245, 245, 245], textColor: 20 },
    margin: { left: marginX, right: marginX },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // === STOK LOG ===
  addSectionHeader("Stok Log");
  autoTable(doc, {
    startY: cursorY + 2,
    head: [["Metrik", "Nilai"]],
    body: [
      ["Stok Masuk (Transaksi)", formatNumber(data.stokLog.ringkasan.stok_masuk.jumlah_transaksi)],
      ["Stok Masuk (Unit)", formatNumber(data.stokLog.ringkasan.stok_masuk.total_unit)],
      ["Stok Masuk (Nilai)", formatCurrency(data.stokLog.ringkasan.stok_masuk.nilai)],
      ["Stok Keluar (Transaksi)", formatNumber(data.stokLog.ringkasan.stok_keluar.jumlah_transaksi)],
      ["Stok Keluar (Unit)", formatNumber(data.stokLog.ringkasan.stok_keluar.total_unit)],
      ["Stok Keluar (Nilai)", formatCurrency(data.stokLog.ringkasan.stok_keluar.nilai)],
    ],
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [245, 245, 245], textColor: 20 },
    margin: { left: marginX, right: marginX },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: cursorY,
    head: [["Bahan Baku", "Satuan", "Masuk", "Keluar", "Selisih", "Nilai Masuk", "Nilai Keluar"]],
    body: data.stokLog.per_bahan_baku.map((b) => [b.nama, b.satuan_dasar, formatNumber(b.stok_masuk), formatNumber(b.stok_keluar), formatNumber(b.selisih), formatCurrency(b.nilai_masuk), formatCurrency(b.nilai_keluar)]),
    theme: "striped",
    styles: { fontSize: 7 },
    headStyles: { fillColor: [245, 245, 245], textColor: 20 },
    margin: { left: marginX, right: marginX },
    columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 18 } },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 6;

  const maps = buildStokCostMaps(data.stokLog);
  const maxLogs = 500;
  const logs = data.stokLog.logs.slice(0, maxLogs);
  autoTable(doc, {
    startY: cursorY,
    head: [["Tanggal", "Item", "Tipe", "Qty", "Satuan", "Harga", "Sumber", "User"]],
    body: logs.map((l) => {
      const row = resolveStokLogRow(data.stokLog, l, maps);
      const hargaText = row.totalHarga === null ? "-" : formatCurrency(row.totalHarga);
      return [formatDateTime(l.created_at), row.itemName, l.tipe === "masuk" ? "Masuk" : "Keluar", formatNumber(l.jumlah), row.satuan, hargaText, row.sumberHarga, l.user?.name ?? "-"];
    }),
    theme: "striped",
    styles: { fontSize: 7 },
    headStyles: { fillColor: [245, 245, 245], textColor: 20 },
    margin: { left: marginX, right: marginX },
    columnStyles: { 0: { cellWidth: 28 }, 1: { cellWidth: 55 }, 7: { cellWidth: 22 } },
  });

  if (data.stokLog.logs.length > maxLogs) {
    const endY = (doc as any).lastAutoTable.finalY + 6;
    doc.setFontSize(9);
    doc.text(`Catatan: log ditampilkan ${maxLogs} dari ${data.stokLog.logs.length} untuk menjaga ukuran PDF.`, marginX, Math.min(endY, 285));
  }

  doc.save(`Laporan_Lengkap_${period.mulai}_${period.selesai}.pdf`);
};
