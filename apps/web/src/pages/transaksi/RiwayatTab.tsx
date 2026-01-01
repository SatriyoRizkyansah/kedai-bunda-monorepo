import { Eye, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaksi } from "@/lib/types";
import { formatCurrency, formatDateTime, getStatusColor } from "./utils";

interface RiwayatTabProps {
  transaksi: Transaksi[];
  loading: boolean;
  searchQuery: string;
  selectedStatus: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: string) => void;
  onViewDetail: (item: Transaksi) => void;
  onBatal: (id: number) => void;
  isBalCancelLoading?: boolean;
}

export function RiwayatTab({ transaksi, loading, searchQuery, selectedStatus, onSearchChange, onStatusChange, onViewDetail, onBatal, isBalCancelLoading = false }: RiwayatTabProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input type="text" placeholder="Cari transaksi..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <select value={selectedStatus} onChange={(e) => onStatusChange(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="semua">Semua Status</option>
          <option value="selesai">Selesai</option>
          <option value="batal">Batal</option>
        </select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Memuat...
                  </TableCell>
                </TableRow>
              ) : transaksi.length > 0 ? (
                transaksi.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-semibold">{item.kode_transaksi}</TableCell>
                    <TableCell>{item.nama_pelanggan || "Guest"}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(item.total || 0)}</TableCell>
                    <TableCell className="capitalize">{item.metode_pembayaran}</TableCell>
                    <TableCell className="text-sm">{formatDateTime(item.created_at)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>{item.status === "selesai" ? "Selesai" : "Batal"}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => onViewDetail(item)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {item.status === "selesai" && (
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onBatal(item.id)} disabled={isBalCancelLoading}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Belum ada transaksi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
