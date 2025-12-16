import { PackagePlus, History, Pencil, Trash2, Link2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "./utils";
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
      className="hover:shadow-lg transition-all duration-300 border-border group"
      style={{
        boxShadow: "var(--shadow-sm)",
        borderRadius: "var(--radius)",
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">{item.nama}</CardTitle>
            <p className="text-sm text-muted-foreground capitalize mt-1">{item.kategori}</p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge
              variant={item.tersedia ? "success" : "destructive"}
              style={{
                borderRadius: "calc(var(--radius) - 2px)",
              }}
            >
              {item.tersedia ? "Tersedia" : "Habis"}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs gap-1"
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
      <CardContent>
        {item.deskripsi && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.deskripsi}</p>}

        {/* Info Stok */}
        <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md mb-4">
          <span className="text-sm text-muted-foreground">Stok:</span>
          <span className="font-semibold text-foreground">{Number(item.stok_efektif ?? item.stok ?? 0).toFixed(0)} porsi</span>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-border">
          <p className="text-2xl font-bold text-primary">{formatCurrency(Number(item.harga_jual || item.harga || 0))}</p>
          <div className="flex gap-1">
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
