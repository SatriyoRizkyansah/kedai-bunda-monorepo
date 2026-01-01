import type { BahanBaku } from "@/lib/types";

export interface MenuTerlarisItem {
  nama: string;
  terjual: number;
  pendapatan: number;
}

export interface PenjualanKategoriItem {
  kategori: string;
  total: number;
}

export interface GrafikPendapatanItem {
  tanggal: string;
  hari: string;
  pendapatan: number;
}

export interface DashboardStats {
  totalMenu: number;
  totalBahanBaku: number;
  transaksiHariIni: number;
  pendapatanHariIni: number;
  pendapatanKemarin: number;
  bahanStokMenipis: BahanBaku[];
  menuTerlaris: MenuTerlarisItem[];
  penjualanPerKategori: PenjualanKategoriItem[];
  grafikPendapatan: GrafikPendapatanItem[];
}
