import type { BahanBaku } from "@/lib/types";

export const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"] as const;

export const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `Rp ${(value / 1000).toFixed(0)}K`;
  }
  return `Rp ${value}`;
};

export const formatCurrencyFull = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "Selamat Pagi";
  if (hour >= 11 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};

export const LOW_STOCK_THRESHOLD = 10;

export const isLowStock = (item: BahanBaku) => Number(item.stok_tersedia || 0) < LOW_STOCK_THRESHOLD;
