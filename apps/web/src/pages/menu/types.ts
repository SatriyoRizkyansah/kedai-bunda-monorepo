import type { Menu } from "@/lib/types";

export interface MenuFormData {
  nama: string;
  kategori: string;
  harga: string;
  deskripsi: string;
  tersedia: boolean;
  stok: string;
  kelola_stok_mandiri: boolean;
}

export interface StokFormData {
  jumlah: string;
  keterangan: string;
  harga_beli: string;
}

export interface StokLog {
  id: number;
  menu_id: number;
  jumlah: number;
  tipe: "masuk" | "keluar";
  keterangan: string;
  stok_sebelum: number;
  stok_sesudah: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
}

export type { Menu };
