import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Legend, Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { UtensilsCrossed } from "lucide-react";
import type { PenjualanKategoriItem } from "./types";
import { PIE_COLORS, formatCurrencyFull } from "./utils";

interface CategorySalesCardProps {
  data: PenjualanKategoriItem[];
}

export function CategorySalesCard({ data }: CategorySalesCardProps) {
  return (
    <Card className="border-border bg-card" style={{ boxShadow: "var(--shadow-md)", borderRadius: "var(--radius)" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          Penjualan per Kategori
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data as unknown as Record<string, unknown>[]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="total"
                  nameKey="kategori"
                  label={({ name, percent }) => `${name} ${(percent || 0) * 100 >= 1 ? ((percent || 0) * 100).toFixed(0) : ((percent || 0) * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => {
                    const numValue = typeof value === "number" ? value : 0;
                    return [formatCurrencyFull(numValue), "Total"];
                  }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">Belum ada data penjualan</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
