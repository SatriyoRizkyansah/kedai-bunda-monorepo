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
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Inventori</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Kelola bahan baku, tracking batch FIFO, komposisi menu, dan konversi satuan</p>
        </div>

        <Tabs defaultValue="bahan-baku" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 gap-2 p-1 h-auto sm:hidden">
            <TabsTrigger value="bahan-baku" className="flex-col gap-1 py-2 text-[11px] leading-tight whitespace-normal text-center">
              <Package className="h-4 w-4" />
              <span>Bahan Baku</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex-col gap-1 py-2 text-[11px] leading-tight whitespace-normal text-center">
              <TrendingDown className="h-4 w-4" />
              <span>Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="komposisi" className="col-span-2 flex-col gap-1 py-2 text-[11px] leading-tight whitespace-normal text-center">
              <Layers className="h-4 w-4" />
              <span>Komposisi</span>
            </TabsTrigger>
            {/* <TabsTrigger value="konversi" className="flex-col gap-1 py-2 text-[11px] leading-tight whitespace-normal text-center">
              <ArrowRightLeft className="h-4 w-4" />
              <span>Konversi</span>
            </TabsTrigger> */}
          </TabsList>

          <div className="hidden w-full overflow-x-auto sm:block">
            <TabsList className="inline-flex min-w-max gap-2 p-1">
              <TabsTrigger value="bahan-baku" className="gap-2 min-w-[130px] justify-center">
                <Package className="h-4 w-4" />
                <span className="text-sm">Bahan Baku</span>
              </TabsTrigger>
              <TabsTrigger value="tracking" className="gap-2 min-w-[130px] justify-center">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm">Tracking</span>
              </TabsTrigger>
              <TabsTrigger value="komposisi" className="gap-2 min-w-[130px] justify-center">
                <Layers className="h-4 w-4" />
                <span className="text-sm">Komposisi</span>
              </TabsTrigger>
              {/* <TabsTrigger value="konversi" className="gap-2 min-w-[130px] justify-center">
                <ArrowRightLeft className="h-4 w-4" />
                <span className="text-sm">Konversi</span>
              </TabsTrigger> */}
            </TabsList>
          </div>

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
