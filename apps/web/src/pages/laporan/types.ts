// Periode types
export type PeriodPreset = "hari_ini" | "minggu_ini" | "bulan_ini" | "tahun_ini" | "custom";

export interface PeriodDate {
  mulai: string;
  selesai: string;
}

// Laporan Penjualan Types
export interface RingkasanPenjualan {
  total_transaksi: number;
  total_pendapatan: number;
  total_bayar: number;
  total_kembalian: number;
  rata_rata_per_transaksi: number;
}

export interface PenjualanPerKategori {
  kategori: string;
  jumlah_transaksi: number;
  total_item: number;
  total_pendapatan: number;
}

export interface DetailMenuPenjualan {
  menu_id: number;
  nama: string;
  kategori: string;
  harga_jual: number;
  total_terjual: number;
  total_pendapatan: number;
  jumlah_transaksi: number;
}

export interface LaporanPenjualan {
  periode: PeriodDate;
  ringkasan: RingkasanPenjualan;
  per_kategori: PenjualanPerKategori[];
  detail_menu: DetailMenuPenjualan[];
  transaksi: unknown[];
}

// Laporan Stok Log Types
export interface RingkasanStokLog {
  total_transaksi: number;
  stok_masuk: { jumlah_transaksi: number; total_unit: number; nilai: number };
  stok_keluar: { jumlah_transaksi: number; total_unit: number; nilai: number };
}

export interface PerBahanBaku {
  bahan_baku_id: number;
  nama: string;
  satuan_dasar: string;
  stok_masuk: number;
  stok_keluar: number;
  selisih: number;
  nilai_masuk: number;
  nilai_keluar: number;
}

export interface StokLogItem {
  id: string | number;
  bahan_baku_id?: number | null;
  menu_id?: number;
  jumlah: number;
  tipe: "masuk" | "keluar";
  keterangan: string;
  harga_beli?: number;
  created_at: string;
  bahan_baku?: { nama: string; satuan_dasar: string };
  menu?: { nama: string };
  user?: { name: string };
  source?: "menu" | "bahan_baku";
}

export interface LaporanStokLog {
  periode: PeriodDate;
  ringkasan: RingkasanStokLog;
  per_bahan_baku: PerBahanBaku[];
  logs: StokLogItem[];
}

// Laporan Keuntungan Types
export interface RingkasanKeuntungan {
  total_transaksi: number;
  total_pendapatan: number;
  total_hpp: number;
  laba_kotor: number;
  margin_kotor_persen: number;
  biaya_pembelian_stok: number;
}

export interface DetailPerMenu {
  menu_id: number;
  nama_menu: string;
  kategori: string;
  harga_jual: number;
  hpp_per_unit: number;
  margin_per_unit: number;
  jumlah_terjual: number;
  total_pendapatan: number;
  total_hpp: number;
  total_laba: number;
}

export interface TrendHarian {
  tanggal: string;
  hari: string;
  pendapatan: number;
  hpp: number;
  laba: number;
}

export interface LaporanKeuntungan {
  periode: PeriodDate;
  ringkasan: RingkasanKeuntungan;
  per_menu: DetailPerMenu[];
  trend_harian: TrendHarian[];
}
