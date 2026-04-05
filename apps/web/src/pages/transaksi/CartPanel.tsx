import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CartItem, MetodePembayaran } from "./types";
import { calculateTotal, calculateKembalian, formatCurrency, handleNumpadPress, getMenuStockValue, formatStockValue } from "./utils";

interface CartPanelProps {
  cart: CartItem[];
  bayar: string;
  metodePembayaran: MetodePembayaran;
  tipeTransaksi: "umum" | "jatah_karyawan";
  namaPelanggan: string;
  onUpdateQuantity: (menuId: number, delta: number) => void;
  onRemoveFromCart: (menuId: number) => void;
  onClearCart: () => void;
  onBayarChange: (value: string) => void;
  onMetodeChange: (value: MetodePembayaran) => void;
  onTipeChange: (value: "umum" | "jatah_karyawan") => void;
  onNamaChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const NUMPAD_KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["000", "0", "DEL"],
  ["C", "Uang Pas"],
];

export function CartPanel({
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
  isLoading = false,
}: CartPanelProps) {
  const total = calculateTotal(cart);
  const kembalian = calculateKembalian(cart, bayar);
  const isJatahKaryawan = tipeTransaksi === "jatah_karyawan";
  const isReadyToPay = cart.length > 0 && (isJatahKaryawan || metodePembayaran !== "tunai" || bayar === "Uang Pas" || kembalian >= 0);

  const handleNumpadKeyClick = (key: string) => {
    if (key === "Uang Pas") {
      onBayarChange(total.toString());
    } else {
      const newBayar = handleNumpadPress(key, bayar);
      onBayarChange(newBayar);
    }
  };

  return (
    <Card className="h-full min-h-0 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
        {/* Customer Name */}
        <div>
          <label className="text-sm font-medium">Nama Pelanggan (Opsional)</label>
          <Input placeholder="Masukkan nama..." value={namaPelanggan} onChange={(e) => onNamaChange(e.target.value)} className="mt-1" />
        </div>

        {/* Cart Items */}
        <div className="space-y-2">
          {cart.length > 0 ? (
            <>
              <p className="text-sm font-semibold">Keranjang ({cart.length} item)</p>
              <div className="space-y-2">
                {cart.map((item) => (
                  <CartItemRow key={item.menu_id} item={item} onUpdateQuantity={onUpdateQuantity} onRemoveFromCart={onRemoveFromCart} />
                ))}
              </div>

              <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive" onClick={onClearCart}>
                Hapus Semua
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-center py-6 text-gray-500 text-sm">Keranjang kosong</div>
          )}
        </div>

        {/* Totals */}
        <Card className="p-3 space-y-2 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>

          {!isJatahKaryawan && metodePembayaran === "tunai" && bayar !== "Uang Pas" && bayar && (
            <>
              <div className="flex justify-between text-sm">
                <span>Uang Pembeli:</span>
                <span className="font-medium">{formatCurrency(parseFloat(bayar) || 0)}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: kembalian < 0 ? "#ef4444" : "#22c55e" }}>
                <span>Kembalian:</span>
                <span className="font-medium">{formatCurrency(Math.abs(kembalian))}</span>
              </div>
            </>
          )}
        </Card>

        {/* Transaction Type */}
        <div>
          <label className="text-sm font-medium">Tipe Transaksi</label>
          <select value={tipeTransaksi} onChange={(e) => onTipeChange(e.target.value as "umum" | "jatah_karyawan")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
            <option value="umum">Umum (Penjualan)</option>
            <option value="jatah_karyawan">Jatah Karyawan</option>
          </select>
          {isJatahKaryawan && <p className="text-xs text-muted-foreground mt-1">Pembayaran tidak diperlukan dan tidak dihitung sebagai profit.</p>}
        </div>

        {/* Payment Method */}
        {!isJatahKaryawan ? (
          <div>
            <label className="text-sm font-medium">Metode Pembayaran</label>
            <select
              value={metodePembayaran}
              onChange={(e) => {
                onMetodeChange(e.target.value as MetodePembayaran);
                onBayarChange("");
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
            >
              <option value="tunai">Tunai</option>
              <option value="qris">QRIS</option>
            </select>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">Pembayaran otomatis diset ke Rp 0 untuk konsumsi karyawan.</div>
        )}

        {/* Numpad (only for cash) */}
        {!isJatahKaryawan && metodePembayaran === "tunai" && (
          <div className="space-y-2">
            <Input value={bayar === "Uang Pas" ? formatCurrency(total) : bayar} onChange={(e) => onBayarChange(e.target.value)} placeholder="Masukkan uang..." className="text-lg text-center font-mono" readOnly />

            <div className="grid grid-cols-3 gap-2">
              {NUMPAD_KEYS.map((row) =>
                row.map((key) => (
                  <Button key={key} variant={key === "C" || key === "DEL" ? "destructive" : "outline"} className="h-10 text-sm font-medium" onClick={() => handleNumpadKeyClick(key)} disabled={isLoading}>
                    {key}
                  </Button>
                )),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button - Always Visible */}
      <div className="p-4 border-t flex-shrink-0">
        <Button onClick={onSubmit} disabled={!isReadyToPay || isLoading} className="w-full h-12 text-base font-semibold" size="lg">
          {isLoading ? "Memproses..." : "Bayar"}
        </Button>
      </div>
    </Card>
  );
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (menuId: number, delta: number) => void;
  onRemoveFromCart: (menuId: number) => void;
}

function CartItemRow({ item, onUpdateQuantity, onRemoveFromCart }: CartItemRowProps) {
  const totalStock = Math.floor(getMenuStockValue(item.menu));
  const remainingStock = Math.max(0, Number((totalStock - item.jumlah).toFixed(2)));
  const satuanLabel = item.menu.satuan?.nama || "porsi";

  return (
    <div className="flex justify-between items-start gap-2 pb-2 border-b last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm line-clamp-1">{item.menu.nama}</p>
        <p className="text-xs text-gray-500">
          {formatCurrency(item.menu.harga || item.menu.harga_jual || 0)} x {item.jumlah}
        </p>
        <p className={`text-xs ${remainingStock <= 0 ? "text-red-600 font-semibold" : "text-gray-500"}`}>{remainingStock <= 0 ? "Stok habis" : `Sisa stok: ${formatStockValue(remainingStock)} ${satuanLabel}`}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onUpdateQuantity(item.menu_id, -1)}>
          <Minus className="w-3 h-3" />
        </Button>

        <span className="w-6 text-center text-sm font-medium">{item.jumlah}</span>

        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onUpdateQuantity(item.menu_id, 1)} disabled={remainingStock <= 0}>
          <Plus className="w-3 h-3" />
        </Button>

        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600" onClick={() => onRemoveFromCart(item.menu_id)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
