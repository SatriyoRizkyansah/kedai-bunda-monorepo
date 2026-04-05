import { useEffect, useState } from "react";
import { TrendingDown, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/LoadingScreen";
import api from "@/lib/api";
import type { BahanBaku, Menu } from "@/lib/types";
import type { StokLog } from "../menu/types";

export function TrackingBatchTab() {
  const [bahanBakuList, setBahanBakuList] = useState<BahanBaku[]>([]);
  const [selectedBahan, setSelectedBahan] = useState<BahanBaku | null>(null);
  const [batchData, setBatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBatch, setLoadingBatch] = useState(false);

  const [menuManualList, setMenuManualList] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [menuLogs, setMenuLogs] = useState<StokLog[]>([]);
  const [loadingMenuList, setLoadingMenuList] = useState(false);
  const [loadingMenuLogs, setLoadingMenuLogs] = useState(false);

  useEffect(() => {
    fetchBahanBaku();
    fetchMenuManual();
  }, []);

  const fetchBahanBaku = async () => {
    setLoading(true);
    try {
      const response = await api.get("/bahan-baku");
      const list = response.data.data || [];
      const withTracking = list.filter((b: BahanBaku) => b.base_satuan_id);
      setBahanBakuList(withTracking);

      if (withTracking.length > 0) {
        handleSelectBahan(withTracking[0]);
      }
    } catch (error) {
      console.error("Error fetching bahan baku:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuManual = async () => {
    setLoadingMenuList(true);
    try {
      const response = await api.get("/menu");
      const list = (response.data.data || []).filter((item: Menu) => item.kelola_stok_mandiri);
      setMenuManualList(list);

      if (list.length > 0) {
        handleSelectMenu(list[0]);
      }
    } catch (error) {
      console.error("Error fetching menu manual:", error);
      setMenuManualList([]);
    } finally {
      setLoadingMenuList(false);
    }
  };

  const handleSelectBahan = async (bahan: BahanBaku) => {
    setSelectedBahan(bahan);
    setLoadingBatch(true);

    try {
      const response = await api.get(`/bahan-baku/${bahan.id}/batch-tracking`);
      setBatchData(response.data.data);
    } catch (error) {
      console.error("Error fetching batch tracking:", error);
      setBatchData(null);
    } finally {
      setLoadingBatch(false);
    }
  };

  const handleSelectMenu = async (menu: Menu) => {
    setSelectedMenu(menu);
    setLoadingMenuLogs(true);

    try {
      const response = await api.get(`/menu/${menu.id}/stok-log`);
      setMenuLogs(response.data.data?.data || []);
    } catch (error) {
      console.error("Error fetching menu logs:", error);
      setMenuLogs([]);
    } finally {
      setLoadingMenuLogs(false);
    }
  };

  const getMenuStock = (item: Menu) => {
    const rawValue = item.stok_sisa ?? item.stok ?? 0;
    const parsed = Number(rawValue ?? 0);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  if (loading) {
    return <LoadingScreen message="Memuat data tracking..." size="md" />;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-sm text-blue-700 dark:text-blue-400">Tentang Tracking Batch FIFO</h3>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Sistem melacak setiap pembelian bahan mentah (batch) dan menghitung sisa berdasarkan metode FIFO (First In First Out). Estimasi sisa bahan mentah dihitung proporsional dari stok yang tersisa di setiap batch.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {bahanBakuList.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada bahan baku dengan tracking bahan mentah</p>
            <p className="text-xs text-muted-foreground mt-2">Aktifkan tracking dengan menambah stok dan isi jumlah bahan mentah (misal: 2 ekor)</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bahan Baku dengan Tracking</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {bahanBakuList.map((bahan) => (
                  <button key={bahan.id} onClick={() => handleSelectBahan(bahan)} className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors ${selectedBahan?.id === bahan.id ? "bg-primary/10 border-l-4 border-primary" : ""}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{bahan.nama}</p>
                        <p className="text-xs text-muted-foreground">
                          Stok: {bahan.stok_tersedia} {bahan.satuan?.nama || bahan.satuan_dasar}
                        </p>
                      </div>
                      {selectedBahan?.id === bahan.id && <Badge variant="secondary">Terpilih</Badge>}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Rincian Batch</CardTitle>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Batch:</span>
                  <span className="font-medium">{batchData?.summary?.total_batches || 0} batch</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Stok Tersedia:</span>
                  <span className="font-medium">
                    {selectedBahan?.stok_tersedia} {selectedBahan?.satuan?.nama || selectedBahan?.satuan_dasar}
                  </span>
                </div>
                {batchData?.summary?.estimated_base_remaining != null &&
                  (() => {
                    const estBase = parseFloat(batchData.summary.estimated_base_remaining as any);
                    const totals = (batchData.batches || []).reduce(
                      (acc: { totalJumlah: number; totalBase: number }, b: any) => {
                        acc.totalJumlah += parseFloat(b.jumlah_awal || 0);
                        acc.totalBase += parseFloat(b.base_jumlah || 0);
                        return acc;
                      },
                      { totalJumlah: 0, totalBase: 0 },
                    );

                    const conversionRate = totals.totalBase > 0 ? totals.totalJumlah / totals.totalBase : selectedBahan?.satuan?.faktor_konversi || 1;
                    const estimatedInConversion = estBase * conversionRate;
                    const baseSatuanName = batchData.summary?.base_satuan?.nama || selectedBahan?.base_satuan?.nama || selectedBahan?.base_satuan?.singkatan;
                    const convSatuanName = selectedBahan?.satuan?.nama || selectedBahan?.satuan_dasar;

                    return (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Estimasi tersisa (base):</span>
                        <span className="font-medium">
                          {estBase.toFixed(2)} {baseSatuanName} (~{Math.round(estimatedInConversion)} {convSatuanName})
                        </span>
                      </div>
                    );
                  })()}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingBatch ? (
                <LoadingScreen message="Memuat rincian batch..." size="sm" />
              ) : !batchData || !batchData.batches || batchData.batches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Belum ada data batch</div>
              ) : (
                <div className="space-y-3">
                  {batchData.batches.map((batch: any, index: number) => {
                    const jumlahTerpakai = Math.max(0, parseFloat(batch.jumlah_awal) - parseFloat(batch.jumlah_sisa));
                    const satuan = selectedBahan?.satuan?.nama || selectedBahan?.satuan?.singkatan || selectedBahan?.satuan_dasar;
                    const baseSatuan = batch.base_satuan?.singkatan || selectedBahan?.base_satuan?.singkatan;
                    const sisaBase = parseFloat(batch.base_jumlah);

                    return (
                      <div key={batch.id || index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium">Batch #{index + 1}</p>
                            <p className="text-xs text-muted-foreground">
                              Tanggal: {new Date(batch.created_at).toLocaleDateString("id-ID")} ({sisaBase.toFixed(2)} {baseSatuan})
                            </p>
                          </div>
                          <Badge variant="outline">
                            {parseFloat(batch.jumlah_sisa).toFixed(0)} {satuan}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Jumlah Masuk</p>
                            <p className="font-medium">
                              {parseFloat(batch.jumlah_awal).toFixed(0)} {satuan}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Terpakai</p>
                            <p className="font-medium">
                              {jumlahTerpakai.toFixed(0)} {satuan}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Penyesuaian</p>
                            <p className="font-medium">0 {satuan}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Sisa</p>
                            <p className="font-medium">
                              {parseFloat(batch.jumlah_sisa).toFixed(0)} {satuan}
                            </p>
                          </div>
                        </div>
                        {batch.keterangan && (
                          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                            <p>
                              <span className="font-medium">Keterangan:</span> {batch.keterangan}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <UtensilsCrossed className="h-5 w-5 text-amber-700 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-sm text-amber-800 dark:text-amber-300">Tracking Menu Manual</h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Riwayat stok menu manual dicatat per perubahan (tambah/kurang). Tidak menggunakan FIFO batch.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loadingMenuList ? (
        <LoadingScreen message="Memuat menu manual..." size="md" />
      ) : menuManualList.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada menu dengan stok manual</p>
            <p className="text-xs text-muted-foreground mt-2">Aktifkan stok manual saat membuat menu</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Menu Manual</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {menuManualList.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => handleSelectMenu(menu)}
                    className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors ${selectedMenu?.id === menu.id ? "bg-amber-100/60 dark:bg-amber-900/30 border-l-4 border-amber-500" : ""}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{menu.nama}</p>
                        <p className="text-xs text-muted-foreground capitalize">{menu.kategori}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Stok</p>
                        <p className="text-sm font-semibold">{Math.floor(getMenuStock(menu))}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Riwayat Stok Menu</CardTitle>
              <p className="text-xs text-muted-foreground mt-2">{selectedMenu ? selectedMenu.nama : "Pilih menu manual"}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingMenuLogs ? (
                <LoadingScreen message="Memuat riwayat stok..." size="sm" />
              ) : menuLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Belum ada riwayat stok</div>
              ) : (
                <div className="space-y-2">
                  {menuLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString("id-ID")}</p>
                          <p className="text-sm font-medium">{log.keterangan || "Perubahan stok"}</p>
                        </div>
                        <Badge variant={log.tipe === "masuk" ? "success" : "destructive"} className={log.tipe === "masuk" ? "bg-green-500" : "bg-red-500"}>
                          {log.tipe === "masuk" ? "+" : "-"} {log.tipe}
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Jumlah</span>
                          <p className="font-medium">
                            {log.tipe === "masuk" ? "+" : "-"}
                            {Number(log.jumlah).toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stok Akhir</span>
                          <p className="font-medium">{Number(log.stok_sesudah).toFixed(0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
