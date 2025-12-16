import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { StokLogFormData, BahanBaku } from "./types";

interface StokLogDialogProps {
  open: boolean;
  type: "tambah" | "kurangi";
  formData: StokLogFormData;
  bahanBakuList: BahanBaku[];
  onFormDataChange: (data: StokLogFormData) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function StokLogDialog({ open, type, formData, bahanBakuList, onFormDataChange, onSubmit, onOpenChange, isLoading = false }: StokLogDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === "tambah" ? "Tambah Stok" : "Kurangi Stok"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Bahan Baku <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.bahan_baku_id}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    bahan_baku_id: e.target.value,
                  })
                }
                required
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="">Pilih Bahan Baku</option>
                {bahanBakuList.map((bahan) => (
                  <option key={bahan.id} value={bahan.id}>
                    {bahan.nama} (Stok: {bahan.stok_tersedia} {bahan.satuan_dasar})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Jumlah <span className="text-destructive">*</span>
              </label>
              <Input type="number" step="0.01" value={formData.jumlah} onChange={(e) => onFormDataChange({ ...formData, jumlah: e.target.value })} placeholder="Masukkan jumlah" required disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Keterangan {type === "kurangi" && <span className="text-destructive">*</span>}</label>
              <Input
                value={formData.keterangan}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    keterangan: e.target.value,
                  })
                }
                placeholder="Masukkan keterangan"
                required={type === "kurangi"}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" variant={type === "tambah" ? "default" : "destructive"} disabled={isLoading}>
              {isLoading ? "Memproses..." : type === "tambah" ? "Tambah" : "Kurangi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
