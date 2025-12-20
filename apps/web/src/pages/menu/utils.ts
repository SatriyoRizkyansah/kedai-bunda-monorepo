import type { MenuFormData } from "./types";

// Initial form data
export const INITIAL_FORM_DATA: MenuFormData = {
  nama: "",
  kategori: "makanan",
  harga: "0",
  deskripsi: "",
  tersedia: true,
  stok: "0",
  kelola_stok_mandiri: true,
};

export const INITIAL_STOK_FORM = {
  jumlah: "",
  keterangan: "",
  harga_beli: "",
};

// Kategori options
export const KATEGORI_OPTIONS = [
  { value: "makanan", label: "Makanan" },
  { value: "minuman", label: "Minuman" },
];

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
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Validate menu form
export const validateMenuForm = (data: MenuFormData): string | null => {
  if (!data.nama.trim()) {
    return "Nama menu tidak boleh kosong";
  }
  if (!data.kategori) {
    return "Kategori harus dipilih";
  }
  if (parseFloat(data.harga) <= 0) {
    return "Harga harus lebih dari 0";
  }
  if (data.kelola_stok_mandiri && parseFloat(data.stok) < 0) {
    return "Stok tidak boleh negatif";
  }
  return null;
};

// Validate stok form
export const validateStokForm = (data: { jumlah: string }): string | null => {
  if (!data.jumlah.trim()) {
    return "Jumlah tidak boleh kosong";
  }
  if (parseFloat(data.jumlah) <= 0) {
    return "Jumlah harus lebih dari 0";
  }
  return null;
};
