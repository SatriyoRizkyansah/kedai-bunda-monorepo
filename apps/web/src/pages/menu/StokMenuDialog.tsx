import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import type { StokFormData, Menu } from "./types";

interface StokMenuDialogProps {
  open: boolean;
  stokItem: Menu | null;
  formData: StokFormData;
  onFormDataChange: (data: StokFormData) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function StokMenuDialog({ open, stokItem, formData, onFormDataChange, onSubmit, onOpenChange, isLoading = false }: StokMenuDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Tambah Stok Menu</DialogTitle>
          <DialogDescription>
            {stokItem?.nama} - Stok saat ini: {Number(stokItem?.stok || 0)} porsi
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="jumlah_stok_menu" className="text-sm font-medium">
                Jumlah Tambah <span className="text-destructive">*</span>
              </label>
              <Input id="jumlah_stok_menu" type="number" step="1" min="1" value={formData.jumlah} onChange={(e) => onFormDataChange({ ...formData, jumlah: e.target.value })} placeholder="Jumlah porsi" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="keterangan_stok_menu" className="text-sm font-medium">
                Keterangan
              </label>
              <Input
                id="keterangan_stok_menu"
                value={formData.keterangan}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    keterangan: e.target.value,
                  })
                }
                placeholder="Contoh: Produksi pagi"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
              <PackagePlus className="h-4 w-4 mr-2" />
              {isLoading ? "Menambahkan..." : "Tambah Stok"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
