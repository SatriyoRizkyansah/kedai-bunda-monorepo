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
    satuan: string;
    stok: number;
    stok_minimum: number;
    harga_satuan: number;
    created_at: string;
    updated_at: string;
}

// Menu types
export interface Menu {
    id: number;
    nama: string;
    kategori: string;
    harga: number;
    deskripsi: string | null;
    tersedia: boolean;
    created_at: string;
    updated_at: string;
    komposisi?: KomposisiMenu[];
}

export interface KomposisiMenu {
    id: number;
    menu_id: number;
    bahan_baku_id: number;
    jumlah: number;
    satuan: string;
    bahan_baku?: BahanBaku;
}

// Transaksi types
export interface Transaksi {
    id: number;
    kode_transaksi: string;
    tanggal: string;
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
