import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft, Layers, Package, TrendingDown } from "lucide-react";
import { BahanBakuTab } from "./inventori/BahanBakuTab";
import { KomposisiMenuTab } from "./inventori/KomposisiMenuTab";
import { KonversiBahanTab } from "./inventori/KonversiBahanTab";
import { TrackingBatchTab } from "./inventori/TrackingBatchTab";

export function InventoriPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Inventori</h2>
          <p className="text-muted-foreground mt-2">Kelola bahan baku, tracking batch FIFO, komposisi menu, dan konversi satuan</p>
        </div>

        <Tabs defaultValue="bahan-baku" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="bahan-baku" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Bahan Baku</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="komposisi" className="gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Komposisi</span>
            </TabsTrigger>
            <TabsTrigger value="konversi" className="gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Konversi</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bahan-baku">
            <BahanBakuTab />
          </TabsContent>

          <TabsContent value="tracking">
            <TrackingBatchTab />
          </TabsContent>

          <TabsContent value="komposisi">
            <KomposisiMenuTab />
          </TabsContent>

          <TabsContent value="konversi">
            <KonversiBahanTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
