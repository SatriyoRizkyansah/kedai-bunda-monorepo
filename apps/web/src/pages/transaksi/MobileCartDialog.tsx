import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CartPanel } from "./CartPanel";
import type { CartItem, MetodePembayaran, TipeTransaksi } from "./types";

interface MobileCartDialogProps {
  open: boolean;
  cart: CartItem[];
  bayar: string;
  metodePembayaran: MetodePembayaran;
  tipeTransaksi: TipeTransaksi;
  namaPelanggan: string;
  onUpdateQuantity: (menuId: number, delta: number) => void;
  onRemoveFromCart: (menuId: number) => void;
  onClearCart: () => void;
  onBayarChange: (value: string) => void;
  onMetodeChange: (value: MetodePembayaran) => void;
  onTipeChange: (value: TipeTransaksi) => void;
  onNamaChange: (value: string) => void;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function MobileCartDialog({
  open,
  cart,
  bayar,
  metodePembayaran,
  tipeTransaksi,
  namaPelanggan,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onBayarChange,
  onMetodeChange,
  onTipeChange,
  onNamaChange,
  onSubmit,
  onOpenChange,
  isLoading = false,
}: MobileCartDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] h-[100svh] sm:h-[100svh] lg:h-auto max-h-[100svh] sm:max-h-[100svh] lg:max-h-[90svh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Keranjang Belanja ({cart.length} item)</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          <CartPanel
            cart={cart}
            bayar={bayar}
            metodePembayaran={metodePembayaran}
            tipeTransaksi={tipeTransaksi}
            namaPelanggan={namaPelanggan}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveFromCart={onRemoveFromCart}
            onClearCart={onClearCart}
            onBayarChange={onBayarChange}
            onMetodeChange={onMetodeChange}
            onTipeChange={onTipeChange}
            onNamaChange={onNamaChange}
            onSubmit={() => {
              onSubmit();
              onOpenChange(false);
            }}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
