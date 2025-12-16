import type { Menu, Transaksi as TransaksiType } from "@/lib/types";

export interface CartItem {
  menu_id: number;
  menu: Menu;
  jumlah: number;
}

export type MetodePembayaran = "tunai" | "qris";

export type { Menu, TransaksiType };
