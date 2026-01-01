// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "admin";
  aktif: boolean;
}

// Bahan Baku types
export interface BahanBaku {
  id: number;
  nama: string;
  satuan_id?: number | null;
  base_satuan_id?: number | null;
  satuan_dasar: string; // backward compat - derived dari satuan dasar
  satuan?: Satuan;
  base_satuan?: Satuan;
  stok_tersedia: number;
  harga_per_satuan: number;
  keterangan?: string;
  aktif: boolean;
  created_at?: string;
  updated_at?: string;
  // Legacy field names for backward compatibility
  stok?: number;
  stok_minimum?: number;
  harga_satuan?: number;
  konversi?: KonversiBahan[];
}

// Menu types
export interface Menu {
  id: number;
  nama: string;
  kategori: string;
  harga_jual: number;
  harga?: number; // alias untuk compatibility
  gambar?: string | null;
  deskripsi: string | null;
  tersedia: boolean;
  stok: number;
  kelola_stok_mandiri: boolean;
  satuan_id?: number | null;
  stok_efektif?: number;
  satuan?: Satuan;
  created_at: string;
  updated_at: string;
  komposisi?: KomposisiMenu[];
}

// Satuan types
export interface Satuan {
  id: number;
  nama: string;
  singkatan: string;
  tipe: "berat" | "volume" | "jumlah";
  satuan_dasar?: string | null;
  faktor_konversi: number;
  is_satuan_dasar: boolean;
  aktif: boolean;
}

export interface KomposisiMenu {
  id?: number;
  menu_id: number;
  bahan_baku_id: number;
  satuan_id?: number | null;
  jumlah: number;
  menu?: Menu;
  // Helper computed fields (dari backend)
  bahan_baku?: BahanBaku;
  satuan?: Satuan;
}

// Transaksi types
export interface Transaksi {
  id: number;
  kode_transaksi: string;
  tanggal: string;
  nama_pelanggan?: string;
  total: number;
  metode_pembayaran: "tunai" | "qris" | "transfer";
  status: "selesai" | "batal";
  user_id: number;
  user?: User;
  detail?: DetailTransaksi[];
  created_at: string;
  updated_at: string;
}

export interface DetailTransaksi {
  id: number;
  transaksi_id: number;
  menu_id: number;
  jumlah: number;
  harga: number;
  subtotal: number;
  menu?: Menu;
}

// Konversi Bahan types
export interface KonversiBahan {
  id: number;
  bahan_baku_id: number;
  satuan_id: number;
  jumlah_konversi: number;
  keterangan?: string;
  bahan_baku?: BahanBaku;
  satuan?: Satuan;
  created_at: string;
  updated_at: string;
}

// Stok Log types
export interface StokLog {
  id: number;
  bahan_baku_id: number;
  tipe: "masuk" | "keluar" | "penyesuaian";
  jumlah: number;
  satuan: string;
  keterangan?: string;
  user_id: number;
  bahan_baku?: BahanBaku;
  user?: User;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  sukses: boolean;
  pesan?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
