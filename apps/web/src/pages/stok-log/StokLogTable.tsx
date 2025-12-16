import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingScreen } from "@/components/LoadingScreen";
import { formatDate, getTipeBadgeVariant, getTipeLabel, getTipeColor } from "./utils";
import type { StokLogType } from "./types";

interface StokLogTableProps {
  logs: StokLogType[];
  loading: boolean;
}

export function StokLogTable({ logs, loading }: StokLogTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Riwayat Stok</CardTitle>
        <CardDescription>{logs.length} riwayat ditemukan</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingScreen message="Memuat riwayat stok..." size="md" />
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Tidak ada riwayat stok ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Bahan Baku</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{formatDate(log.created_at!)}</TableCell>
                    <TableCell>{log.bahan_baku?.nama || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={getTipeBadgeVariant(log.tipe)}>{getTipeLabel(log.tipe)}</Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className="font-mono font-semibold"
                        style={{
                          color: getTipeColor(log.tipe),
                        }}
                      >
                        {log.tipe === "masuk" ? "+" : log.tipe === "keluar" ? "-" : "±"}
                        {Number(log.jumlah).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>{log.satuan}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.keterangan || "-"}</TableCell>
                    <TableCell>{log.user?.name || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
