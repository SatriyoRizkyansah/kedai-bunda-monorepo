import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { formatDateTime } from "./utils";
import type { StokLog, Menu } from "./types";

interface HistoriStokDialogProps {
  open: boolean;
  historiItem: Menu | null;
  stokLogs: StokLog[];
  loading: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoriStokDialog({ open, historiItem, stokLogs, loading, onOpenChange }: HistoriStokDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Riwayat Stok - {historiItem?.nama}</DialogTitle>
          <DialogDescription>Mode: {historiItem?.kelola_stok_mandiri ? "Stok Manual" : "Terhubung Bahan Baku"}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Memuat riwayat...</p>
            </div>
          ) : stokLogs.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada riwayat perubahan stok</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Tanggal</th>
                  <th className="text-left py-2 px-2">Tipe</th>
                  <th className="text-right py-2 px-2">Jumlah</th>
                  <th className="text-right py-2 px-2">Stok Akhir</th>
                  <th className="text-left py-2 px-2">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {stokLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2">{formatDateTime(log.created_at)}</td>
                    <td className="py-2 px-2">
                      <Badge variant={log.tipe === "masuk" ? "success" : "destructive"} className={log.tipe === "masuk" ? "bg-green-500" : "bg-red-500"}>
                        {log.tipe === "masuk" ? "+" : "-"} {log.tipe}
                      </Badge>
                    </td>
                    <td className="text-right py-2 px-2 font-medium">
                      {log.tipe === "masuk" ? "+" : "-"}
                      {Number(log.jumlah).toFixed(0)}
                    </td>
                    <td className="text-right py-2 px-2">{Number(log.stok_sesudah).toFixed(0)}</td>
                    <td className="py-2 px-2 text-muted-foreground">{log.keterangan || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
