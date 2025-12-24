import type { CartItem, Menu } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Get image URL
export const getImageUrl = (gambar: string | null | undefined): string | null => {
  if (!gambar) return null;
  if (gambar.startsWith("http")) return gambar;
  return API_URL + "/storage/" + gambar;
};

// Calculate total
export const calculateTotal = (cart: CartItem[]): number => {
  return cart.reduce((sum, item) => sum + (item.menu?.harga || item.menu?.harga_jual || 0) * item.jumlah, 0);
};

// Calculate kembalian
export const calculateKembalian = (cart: CartItem[], bayar: string): number => {
  return (parseFloat(bayar) || 0) - calculateTotal(cart);
};

// Format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format date time
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get status color
export const getStatusColor = (status: string): string => {
  if (status === "selesai") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (status === "batal") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  return "bg-gray-100 text-gray-700";
};

// Handle numpad press
export const handleNumpadPress = (key: string, currentBayar: string): string => {
  if (key === "C") {
    return "";
  } else if (key === "DEL") {
    return currentBayar.slice(0, -1);
  } else if (key === "000") {
    return currentBayar + "000";
  } else {
    return currentBayar + key;
  }
};

// Get cart item count
export const getCartItemCount = (cart: CartItem[]): number => {
  return cart.reduce((sum, item) => sum + item.jumlah, 0);
};

// Filter menu
export const filterMenu = (menuList: Menu[], searchTerm: string, selectedKategori: string): Menu[] => {
  return menuList.filter((menu) => {
    const matchSearch = menu.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori = selectedKategori === "semua" || menu.kategori === selectedKategori;
    return matchSearch && matchKategori;
  });
};

// Filter transaksi
export const filterTransaksi = (transaksiList: any[], searchQuery: string, selectedStatus: string): any[] => {
  return transaksiList.filter((item) => {
    // If search is empty, show all; otherwise filter
    const matchSearch = searchQuery === "" || item.kode_transaksi?.toLowerCase().includes(searchQuery.toLowerCase()) || item.nama_pelanggan?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = selectedStatus === "semua" || item.status === selectedStatus;
    return matchSearch && matchStatus;
  });
};
