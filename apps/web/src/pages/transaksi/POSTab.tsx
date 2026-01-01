import type { CartItem, MetodePembayaran } from "./types";
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
  namaPelanggan: string;
  onSearchChange: (value: string) => void;
  onKategoriChange: (kategori: string) => void;
  onAddToCart: (menu: Menu) => void;
  onUpdateQuantity: (menuId: number, delta: number) => void;
  onRemoveFromCart: (menuId: number) => void;
  onClearCart: () => void;
  onBayarChange: (value: string) => void;
  onMetodeChange: (value: MetodePembayaran) => void;
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
  namaPelanggan,
  onSearchChange,
  onKategoriChange,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onBayarChange,
  onMetodeChange,
  onNamaChange,
  onSubmit,
  isLoading = false,
}: POSTabProps) {
  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
      {/* Menu Grid */}
      <div className="lg:col-span-2 h-full overflow-hidden">
        <MenuGrid filteredMenu={filteredMenu} searchTerm={searchTerm} selectedKategori={selectedKategori} cart={cart} kategoris={kategoris} onAddToCart={onAddToCart} onSearchChange={onSearchChange} onKategoriChange={onKategoriChange} />
      </div>

      {/* Cart Panel */}
      <div className="lg:col-span-1 hidden lg:flex lg:flex-col h-full overflow-hidden">
        <CartPanel
          cart={cart}
          bayar={bayar}
          metodePembayaran={metodePembayaran}
          namaPelanggan={namaPelanggan}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveFromCart={onRemoveFromCart}
          onClearCart={onClearCart}
          onBayarChange={onBayarChange}
          onMetodeChange={onMetodeChange}
          onNamaChange={onNamaChange}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
