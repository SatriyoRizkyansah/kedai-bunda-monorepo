import { Link2, Unlink, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { KATEGORI_OPTIONS } from "./utils";
import type { MenuFormData, Menu } from "./types";

interface MenuDialogProps {
  open: boolean;
  editingItem: Menu | null;
  formData: MenuFormData;
  onFormDataChange: (data: MenuFormData) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function MenuDialog({ open, editingItem, formData, onFormDataChange, onSubmit, onOpenChange, isLoading = false }: MenuDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit Menu" : "Tambah Menu"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="nama" className="text-sm font-medium">
                Nama Menu <span className="text-destructive">*</span>
              </label>
              <Input id="nama" value={formData.nama} onChange={(e) => onFormDataChange({ ...formData, nama: e.target.value })} placeholder="Contoh: Nasi Goreng Spesial" required disabled={isLoading} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="kategori" className="text-sm font-medium">
                  Kategori <span className="text-destructive">*</span>
                </label>
                <select
                  id="kategori"
                  value={formData.kategori}
                  onChange={(e) => onFormDataChange({ ...formData, kategori: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  disabled={isLoading}
                >
                  {KATEGORI_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="harga" className="text-sm font-medium">
                  Harga <span className="text-destructive">*</span>
                </label>
                <Input id="harga" type="number" step="0.01" min="0" value={formData.harga} onChange={(e) => onFormDataChange({ ...formData, harga: e.target.value })} required disabled={isLoading} />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="deskripsi" className="text-sm font-medium">
                Deskripsi
              </label>
              <Input id="deskripsi" value={formData.deskripsi} onChange={(e) => onFormDataChange({ ...formData, deskripsi: e.target.value })} placeholder="Deskripsi menu (opsional)" disabled={isLoading} />
            </div>

            {/* Foto Menu */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Foto Menu</label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                {formData.gambar_preview ? (
                  <div className="relative">
                    <img src={formData.gambar_preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => onFormDataChange({ ...formData, gambar: null, gambar_preview: "" })}
                      className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full hover:bg-destructive/90"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-6 gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Klik untuk upload foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            onFormDataChange({
                              ...formData,
                              gambar: file,
                              gambar_preview: event.target?.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Mode Stok */}
            <div className="grid gap-3 p-4 border border-border rounded-lg bg-muted/30">
              <label className="text-sm font-medium">Mode Pengelolaan Stok</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="kelola_stok"
                    checked={formData.kelola_stok_mandiri}
                    onChange={() =>
                      onFormDataChange({
                        ...formData,
                        kelola_stok_mandiri: true,
                      })
                    }
                    className="h-4 w-4"
                    disabled={isLoading}
                  />
                  <span className="text-sm flex items-center gap-1">
                    <Unlink className="h-3 w-3" />
                    Stok Manual
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="kelola_stok"
                    checked={!formData.kelola_stok_mandiri}
                    onChange={() =>
                      onFormDataChange({
                        ...formData,
                        kelola_stok_mandiri: false,
                      })
                    }
                    className="h-4 w-4"
                    disabled={isLoading}
                  />
                  <span className="text-sm flex items-center gap-1">
                    <Link2 className="h-3 w-3" />
                    Terhubung Bahan Baku
                  </span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">{formData.kelola_stok_mandiri ? "Stok dikelola manual, tidak terhubung dengan bahan baku." : "Stok dihitung otomatis dari ketersediaan bahan baku."}</p>
            </div>

            {/* Stok Awal (hanya jika manual) */}
            {formData.kelola_stok_mandiri && (
              <div className="grid gap-2">
                <label htmlFor="stok" className="text-sm font-medium">
                  Stok Awal
                </label>
                <Input id="stok" type="number" step="1" min="0" value={formData.stok} onChange={(e) => onFormDataChange({ ...formData, stok: e.target.value })} placeholder="Jumlah stok awal" disabled={isLoading} />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input type="checkbox" id="tersedia" checked={formData.tersedia} onChange={(e) => onFormDataChange({ ...formData, tersedia: e.target.checked })} className="h-4 w-4" disabled={isLoading} />
              <label htmlFor="tersedia" className="text-sm font-medium">
                Tersedia
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : editingItem ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
