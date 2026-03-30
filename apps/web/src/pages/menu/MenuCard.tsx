import { PackagePlus, History, Pencil, Trash2, Link2, Unlink, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getImageUrl } from "./utils";
import type { Menu } from "./types";

interface MenuCardProps {
  item: Menu;
  onAddStok: (item: Menu) => void;
  onViewHistory: (item: Menu) => void;
  onEdit: (item: Menu) => void;
  onDelete: (id: number) => void;
}

export function MenuCard({ item, onAddStok, onViewHistory, onEdit, onDelete }: MenuCardProps) {
  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 border-border group overflow-hidden flex flex-col"
      style={{
        boxShadow: "var(--shadow-sm)",
        borderRadius: "var(--radius)",
      }}
    >
      {/* Gambar */}
      <div className="relative w-full h-24 sm:h-40 bg-muted overflow-hidden">
        {item.gambar ? (
          <img src={getImageUrl(item.gambar) || ""} alt={item.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-[11px] sm:text-xs">Tidak ada gambar</span>
            </div>
          </div>
        )}
      </div>

      <CardHeader className="pb-2 sm:pb-3 flex-1">
        <div className="space-y-1">
          <CardTitle className="text-sm sm:text-xl text-foreground group-hover:text-primary transition-colors line-clamp-2">{item.nama}</CardTitle>
          <p className="text-[11px] sm:text-sm text-muted-foreground capitalize line-clamp-1">{item.kategori}</p>
          <div className="flex flex-wrap gap-1">
            <Badge
              variant={item.tersedia ? "success" : "destructive"}
              className="text-[10px] sm:text-xs"
              style={{
                borderRadius: "calc(var(--radius) - 2px)",
              }}
            >
              {item.tersedia ? "Tersedia" : "Habis"}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] sm:text-xs gap-1"
              style={{
                borderRadius: "calc(var(--radius) - 2px)",
              }}
            >
              {item.kelola_stok_mandiri ? (
                <>
                  <Unlink className="h-3 w-3" />
                  Manual
                </>
              ) : (
                <>
                  <Link2 className="h-3 w-3" />
                  Bahan Baku
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        {item.deskripsi && <p className="text-[11px] sm:text-sm text-muted-foreground mb-2 line-clamp-1 sm:line-clamp-2">{item.deskripsi}</p>}

        {/* Info Stok */}
        <div className="flex items-center justify-between py-1.5 px-2 bg-muted/50 rounded-md mb-3">
          <span className="text-[11px] sm:text-sm text-muted-foreground">Stok:</span>
          <span className="text-xs sm:text-base font-semibold text-foreground">{Number(item.stok_efektif ?? item.stok ?? 0).toFixed(0)} porsi</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 border-t border-border mt-auto">
          <p className="text-base sm:text-2xl font-bold text-primary">{formatCurrency(Number(item.harga_jual || item.harga || 0))}</p>
          <div className="flex gap-1 justify-end">
            {item.kelola_stok_mandiri && (
              <Button onClick={() => onAddStok(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-500/10 hover:text-green-600" title="Tambah Stok">
                <PackagePlus className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={() => onViewHistory(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600" title="Riwayat Stok">
              <History className="h-4 w-4" />
            </Button>
            <Button onClick={() => onEdit(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => onDelete(item.id)} title="Hapus">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
