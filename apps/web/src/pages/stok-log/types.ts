import type { StokLog as StokLogType, BahanBaku } from "@/lib/types";

export interface StokStats {
  total_masuk: number;
  total_keluar: number;
  total_penyesuaian: number;
}

export interface StokLogFormData {
  bahan_baku_id: string;
  jumlah: string;
  keterangan: string;
}

export type StokLogTipe = "masuk" | "keluar" | "penyesuaian" | "semua";

export type { StokLogType, BahanBaku };
