import type { StokLogTipe } from "./types";

// Format date time
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Get badge variant based on tipe
export const getTipeBadgeVariant = (tipe: string): "success" | "destructive" | "warning" => {
  switch (tipe) {
    case "masuk":
      return "success";
    case "keluar":
      return "destructive";
    case "penyesuaian":
      return "warning";
    default:
      return "success";
  }
};

// Get label for tipe
export const getTipeLabel = (tipe: string): string => {
  switch (tipe) {
    case "masuk":
      return "Stok Masuk";
    case "keluar":
      return "Stok Keluar";
    case "penyesuaian":
      return "Penyesuaian";
    default:
      return tipe;
  }
};

// Get color for tipe
export const getTipeColor = (tipe: string): string => {
  switch (tipe) {
    case "masuk":
      return "rgb(34, 197, 94)"; // green
    case "keluar":
      return "rgb(239, 68, 68)"; // red
    case "penyesuaian":
      return "rgb(245, 158, 11)"; // amber
    default:
      return "rgb(0, 0, 0)";
  }
};

// Get icon color for tipe
export const getTipeIconColor = (tipe: string): string => {
  switch (tipe) {
    case "masuk":
      return "text-green-600";
    case "keluar":
      return "text-red-600";
    case "penyesuaian":
      return "text-amber-600";
    default:
      return "text-muted-foreground";
  }
};

// TIPE options
export const TIPE_OPTIONS: { value: StokLogTipe; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "masuk", label: "Masuk" },
  { value: "keluar", label: "Keluar" },
  { value: "penyesuaian", label: "Penyesuaian" },
];

// Initial form data
export const INITIAL_FORM_DATA = {
  bahan_baku_id: "",
  jumlah: "",
  keterangan: "",
};
