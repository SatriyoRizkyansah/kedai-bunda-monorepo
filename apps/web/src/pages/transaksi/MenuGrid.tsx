import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { Menu } from "@/lib/types";
import { MenuItemCard } from "./MenuItemCard";

interface MenuGridProps {
  filteredMenu: Menu[];
  searchTerm: string;
  selectedKategori: string;
  cart: Array<{ menu_id: number; jumlah: number; menu: Menu }>;
  kategoris: string[];
  onAddToCart: (menu: Menu) => void;
  onSearchChange: (value: string) => void;
  onKategoriChange: (kategori: string) => void;
}

export function MenuGrid({ filteredMenu, searchTerm, selectedKategori, cart, kategoris, onAddToCart, onSearchChange, onKategoriChange }: MenuGridProps) {
  const cartMap = new Map(cart.map((item) => [item.menu_id, item.jumlah]));

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      {/* Search Bar */}
      <div className="relative flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Cari menu..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="pl-10" />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 flex-shrink-0">
        <Button variant={selectedKategori === "semua" ? "default" : "outline"} size="sm" onClick={() => onKategoriChange("semua")} className="shrink-0">
          Semua
        </Button>
        {kategoris.map((kategori) => (
          <Button key={kategori} variant={selectedKategori === kategori ? "default" : "outline"} size="sm" onClick={() => onKategoriChange(kategori)} className="shrink-0">
            {kategori}
          </Button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredMenu.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-2">
            {filteredMenu.map((menu) => (
              <MenuItemCard key={menu.id} menu={menu} isInCart={cartMap.has(menu.id)} cartQuantity={cartMap.get(menu.id) || 0} onAddClick={() => onAddToCart(menu)} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-gray-500">Tidak ada menu tersedia</div>
        )}
      </div>
    </div>
  );
}
