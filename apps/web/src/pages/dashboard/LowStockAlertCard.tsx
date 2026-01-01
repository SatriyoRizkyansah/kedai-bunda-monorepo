import { AlertCircle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BahanBaku } from "@/lib/types";
import { LOW_STOCK_THRESHOLD } from "./utils";

interface LowStockAlertCardProps {
  data: BahanBaku[];
}

export function LowStockAlertCard({ data }: LowStockAlertCardProps) {
  const hasLowStock = data.length > 0;
  return (
    <Card className={hasLowStock ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"} style={{ boxShadow: "var(--shadow-md)", borderRadius: "var(--radius)" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: hasLowStock ? "hsl(var(--destructive))" : "hsl(var(--foreground))" }}>
          <AlertCircle className="h-5 w-5" />
          Peringatan Stok Menipis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] overflow-y-auto">
          {hasLowStock ? (
            <div className="space-y-3">
              {data.map((bahan) => (
                <div key={bahan.id} className="flex justify-between items-center p-3 bg-background border border-border rounded-lg hover:shadow-sm transition-all">
                  <div>
                    <p className="font-medium text-foreground text-sm">{bahan.nama}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Threshold: {LOW_STOCK_THRESHOLD} {bahan.satuan_dasar}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-destructive">{Number(bahan.stok_tersedia || 0).toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">{bahan.satuan_dasar}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Package className="h-12 w-12 mb-3 text-green-500" />
              <p className="text-sm font-medium text-green-600">Semua stok aman</p>
              <p className="text-xs mt-1">Tidak ada bahan baku yang menipis</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
