import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaksi } from "@/lib/types";
import { formatCurrency, formatDateTime } from "./utils";

interface TransaksiDetailDialogProps {
  open: boolean;
  selectedTransaksi: Transaksi | null;
  onOpenChange: (open: boolean) => void;
}

export function TransaksiDetailDialog({ open, selectedTransaksi, onOpenChange }: TransaksiDetailDialogProps) {
  if (!selectedTransaksi) return null;

  const items = selectedTransaksi.detail || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detail Transaksi {selectedTransaksi.kode_transaksi}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Pelanggan</p>
              <p className="font-semibold">{selectedTransaksi.nama_pelanggan || "Guest"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Metode</p>
              <p className="font-semibold capitalize">{selectedTransaksi.metode_pembayaran}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tanggal</p>
              <p className="font-semibold">{formatDateTime(selectedTransaksi.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-semibold capitalize">{selectedTransaksi.status}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Menu</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.menu?.nama || "Menu"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.harga || 0)}</TableCell>
                      <TableCell className="text-right">{item.jumlah}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency((item.harga || 0) * (item.jumlah || 0))}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Tidak ada item
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <Card className="p-4 space-y-2 bg-muted">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency((selectedTransaksi.detail || []).reduce((sum, item) => sum + (item.subtotal || 0), 0))}</span>
            </div>
            <div className="h-px bg-border"></div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(selectedTransaksi.total || 0)}</span>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
