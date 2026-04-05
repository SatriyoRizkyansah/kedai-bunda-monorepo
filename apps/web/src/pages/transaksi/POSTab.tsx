import type { CartItem, MetodePembayaran, TipeTransaksi } from "./types";
import { MenuGrid } from "./MenuGrid";
import { CartPanel } from "./CartPanel";
import type { Menu } from "@/lib/types";

interface POSTabProps {
  filteredMenu: Menu[];
  cart: CartItem[];
  searchTerm: string;
  selectedKategori: string;
  kategoris: string[];
  bayar: string;
  metodePembayaran: MetodePembayaran;
  tipeTransaksi: TipeTransaksi;
  namaPelanggan: string;
  onSearchChange: (value: string) => void;
  onKategoriChange: (kategori: string) => void;
  onAddToCart: (menu: Menu) => void;
  onUpdateQuantity: (menuId: number, delta: number) => void;
  onRemoveFromCart: (menuId: number) => void;
  onClearCart: () => void;
  onBayarChange: (value: string) => void;
  onMetodeChange: (value: MetodePembayaran) => void;
  onTipeChange: (value: TipeTransaksi) => void;
  onNamaChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function POSTab({
  filteredMenu,
  cart,
  searchTerm,
  selectedKategori,
  kategoris,
  bayar,
  metodePembayaran,
  tipeTransaksi,
  namaPelanggan,
  onSearchChange,
  onKategoriChange,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onBayarChange,
  onMetodeChange,
  onTipeChange,
  onNamaChange,
  onSubmit,
  isLoading = false,
}: POSTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch h-full min-h-0">
      {/* Menu Grid */}
      <div className="md:col-span-2 min-h-0">
        <MenuGrid filteredMenu={filteredMenu} searchTerm={searchTerm} selectedKategori={selectedKategori} cart={cart} kategoris={kategoris} onAddToCart={onAddToCart} onSearchChange={onSearchChange} onKategoriChange={onKategoriChange} />
      </div>

      {/* Cart Panel */}
      <div className="md:col-span-1 hidden md:block min-h-0">
        <div className="md:sticky md:top-4 md:h-[calc(100vh-8rem)] md:max-h-[calc(100vh-8rem)]">
          <CartPanel
            cart={cart}
            bayar={bayar}
            metodePembayaran={metodePembayaran}
            tipeTransaksi={tipeTransaksi}
            namaPelanggan={namaPelanggan}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveFromCart={onRemoveFromCart}
            onClearCart={onClearCart}
            onBayarChange={onBayarChange}
            onMetodeChange={onMetodeChange}
            onTipeChange={onTipeChange}
            onNamaChange={onNamaChange}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
