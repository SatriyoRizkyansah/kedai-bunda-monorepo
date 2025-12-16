import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CartPanel } from "./CartPanel";
import type { CartItem, MetodePembayaran } from "./types";

interface MobileCartDialogProps {
  open: boolean;
  cart: CartItem[];
  bayar: string;
  metodePembayaran: MetodePembayaran;
  namaPelanggan: string;
  onUpdateQuantity: (menuId: number, delta: number) => void;
  onRemoveFromCart: (menuId: number) => void;
  onClearCart: () => void;
  onBayarChange: (value: string) => void;
  onMetodeChange: (value: MetodePembayaran) => void;
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
  namaPelanggan,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onBayarChange,
  onMetodeChange,
  onNamaChange,
  onSubmit,
  onOpenChange,
  isLoading = false,
}: MobileCartDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] h-screen sm:h-auto">
        <DialogHeader>
          <DialogTitle>Keranjang Belanja ({cart.length} item)</DialogTitle>
        </DialogHeader>

        <div className="flex-1">
          <CartPanel
            cart={cart}
            bayar={bayar}
            metodePembayaran={metodePembayaran}
            namaPelanggan={namaPelanggan}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveFromCart={onRemoveFromCart}
            onClearCart={onClearCart}
            onBayarChange={onBayarChange}
            onMetodeChange={onMetodeChange}
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
