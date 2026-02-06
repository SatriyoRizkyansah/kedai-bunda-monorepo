import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Menu } from "@/lib/types";
import { formatCurrency, getImageUrl, formatStockValue } from "./utils";

interface MenuItemCardProps {
  menu: Menu;
  isInCart: boolean;
  cartQuantity: number;
  totalStock: number;
  remainingStock: number;
  onAddClick: (menu: Menu) => void;
}

export function MenuItemCard({ menu, isInCart, cartQuantity, totalStock, remainingStock, onAddClick }: MenuItemCardProps) {
  const imageSrc = getImageUrl(menu.gambar);
  const isOutOfStock = remainingStock <= 0;
  const satuanLabel = menu.satuan?.singkatan || menu.satuan?.nama || "porsi";

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddClick(menu);
  };

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${isOutOfStock ? "opacity-70" : "cursor-pointer"}`}>
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden" onClick={handleAdd}>
        {imageSrc ? <img src={imageSrc} alt={menu.nama} className="w-full h-full object-cover hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>}
        {isInCart && <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">{cartQuantity}</div>}
        <div className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full shadow-md ${isOutOfStock ? "bg-red-600 text-white" : "bg-white/90 text-gray-900"}`}>
          {isOutOfStock ? "Stok Habis" : `Sisa ${formatStockValue(remainingStock)}`}
        </div>
      </div>

      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2">{menu.nama}</h3>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="capitalize">{menu.kategori}</span>
          <span>{menu.kelola_stok_mandiri ? "Manual" : "Bahan"}</span>
        </div>

        <div className="text-xs">
          <p className={isOutOfStock ? "text-red-600 font-semibold" : "text-gray-500"}>{isOutOfStock ? `Stok habis (${satuanLabel})` : `Sisa ${formatStockValue(remainingStock)} / ${formatStockValue(totalStock)} ${satuanLabel}`}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">{formatCurrency(menu.harga || menu.harga_jual || 0)}</span>
          <Button size="sm" variant="outline" onClick={handleAdd} disabled={isOutOfStock} className="h-8 w-8 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
