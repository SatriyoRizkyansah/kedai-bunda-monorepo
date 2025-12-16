import type { PeriodPreset, PeriodDate } from "./types";

// Format functions
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat("id-ID").format(value);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Period helper functions
export const getPeriodDates = (preset: PeriodPreset): PeriodDate => {
  const today = new Date();
  const formatYMD = (date: Date) => date.toISOString().split("T")[0];

  switch (preset) {
    case "hari_ini":
      return { mulai: formatYMD(today), selesai: formatYMD(today) };
    case "minggu_ini": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      return { mulai: formatYMD(startOfWeek), selesai: formatYMD(today) };
    }
    case "bulan_ini": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { mulai: formatYMD(startOfMonth), selesai: formatYMD(today) };
    }
    case "tahun_ini": {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return { mulai: formatYMD(startOfYear), selesai: formatYMD(today) };
    }
    default:
      return { mulai: formatYMD(today), selesai: formatYMD(today) };
  }
};

// Period options
export const PERIOD_OPTIONS = [
  { value: "hari_ini" as PeriodPreset, label: "Hari Ini" },
  { value: "minggu_ini" as PeriodPreset, label: "Minggu Ini" },
  { value: "bulan_ini" as PeriodPreset, label: "Bulan Ini" },
  { value: "tahun_ini" as PeriodPreset, label: "Tahun Ini" },
  { value: "custom" as PeriodPreset, label: "Custom" },
];
