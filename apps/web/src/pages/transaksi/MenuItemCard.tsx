import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Menu } from "@/lib/types";
import { formatCurrency, getImageUrl } from "./utils";

interface MenuItemCardProps {
  menu: Menu;
  isInCart: boolean;
  cartQuantity: number;
  onAddClick: (menu: Menu) => void;
}

export function MenuItemCard({ menu, isInCart, cartQuantity, onAddClick }: MenuItemCardProps) {
  const imageSrc = getImageUrl(menu.gambar);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden" onClick={() => onAddClick(menu)}>
        {imageSrc ? <img src={imageSrc} alt={menu.nama} className="w-full h-full object-cover hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>}
        {isInCart && <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">{cartQuantity}</div>}
      </div>

      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2">{menu.nama}</h3>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">{formatCurrency(menu.harga || menu.harga_jual || 0)}</span>
          <Button size="sm" variant="outline" onClick={() => onAddClick(menu)} className="h-8 w-8 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
