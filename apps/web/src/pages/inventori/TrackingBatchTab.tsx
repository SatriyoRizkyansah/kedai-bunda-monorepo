import { useEffect, useState } from "react";
import { TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/LoadingScreen";
import api from "@/lib/api";
import type { BahanBaku } from "@/lib/types";

export function TrackingBatchTab() {
  const [bahanBakuList, setBahanBakuList] = useState<BahanBaku[]>([]);
  const [selectedBahan, setSelectedBahan] = useState<BahanBaku | null>(null);
  const [batchData, setBatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBatch, setLoadingBatch] = useState(false);

  useEffect(() => {
    fetchBahanBaku();
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

  if (loading) {
    return <LoadingScreen message="Memuat data tracking..." size="md" />;
  }

  if (bahanBakuList.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Belum ada bahan baku dengan tracking bahan mentah</p>
          <p className="text-xs text-muted-foreground mt-2">Aktifkan tracking dengan menambah stok dan isi jumlah bahan mentah (misal: 2 ekor)</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
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
            <p className="text-xs text-muted-foreground">Estimasi sisa dihitung proporsional dengan metode FIFO</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingBatch ? (
              <LoadingScreen message="Memuat rincian batch..." size="sm" />
            ) : !batchData ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Belum ada data batch</div>
            ) : (
              <div className="space-y-3">
                {batchData.batch_details?.map((batch: any, index: number) => (
                  <div key={batch.id || index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Batch #{index + 1}</p>
                        <p className="text-xs text-muted-foreground">Tanggal: {new Date(batch.tanggal_masuk).toLocaleDateString("id-ID")}</p>
                      </div>
                      <Badge variant="outline">
                        {batch.sisa} {batch.satuan?.nama || selectedBahan?.satuan?.nama || selectedBahan?.satuan_dasar}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Jumlah Masuk</p>
                        <p className="font-medium">
                          {batch.jumlah_masuk} {batch.satuan?.nama || selectedBahan?.satuan?.nama || selectedBahan?.satuan_dasar}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Terpakai</p>
                        <p className="font-medium">
                          {batch.jumlah_keluar} {batch.satuan?.nama || selectedBahan?.satuan?.nama || selectedBahan?.satuan_dasar}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Penyesuaian</p>
                        <p className="font-medium">
                          {batch.penyesuaian} {batch.satuan?.nama || selectedBahan?.satuan?.nama || selectedBahan?.satuan_dasar}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sisa</p>
                        <p className="font-medium">
                          {batch.sisa} {batch.satuan?.nama || selectedBahan?.satuan?.nama || selectedBahan?.satuan_dasar}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
