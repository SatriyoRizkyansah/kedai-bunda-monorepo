import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ShoppingCart } from "lucide-react";
import type { MenuTerlarisItem } from "./types";
import { formatCurrencyFull } from "./utils";

interface TopMenuCardProps {
  data: MenuTerlarisItem[];
}

export function TopMenuCard({ data }: TopMenuCardProps) {
  const handleFormatter = (value: unknown, name: unknown) => {
    const numValue = typeof value === "number" ? value : 0;
    const nameStr = String(name);
    if (nameStr === "terjual") return [`${numValue} pcs`, "Terjual"];
    return [formatCurrencyFull(numValue), "Pendapatan"];
  };

  return (
    <Card className="border-border bg-card" style={{ boxShadow: "var(--shadow-md)", borderRadius: "var(--radius)" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Top 5 Menu Terlaris
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal vertical={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
                <YAxis type="category" dataKey="nama" width={110} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
                <Tooltip
                  formatter={handleFormatter as any}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="terjual" fill="#3b82f6" radius={[0, 4, 4, 0]} name="terjual" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">Belum ada data menu terlaris</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
