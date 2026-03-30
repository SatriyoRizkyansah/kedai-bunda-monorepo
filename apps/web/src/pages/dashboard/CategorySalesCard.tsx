import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Legend, Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import type { PenjualanKategoriItem } from "./types";
import { PIE_COLORS, formatCurrencyFull } from "./utils";

interface CategorySalesCardProps {
  data: PenjualanKategoriItem[];
}

export function CategorySalesCard({ data }: CategorySalesCardProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const renderLabel = ({ name, percent }: { name?: string; percent?: number }) => {
    if (isMobile) return "";
    const pct = (percent || 0) * 100;
    const displayPct = pct >= 1 ? pct.toFixed(0) : pct.toFixed(1);
    return `${name || ""} ${displayPct}%`;
  };

  return (
    <Card className="border-border bg-card" style={{ boxShadow: "var(--shadow-md)", borderRadius: "var(--radius)" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          Penjualan per Kategori
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[180px] sm:h-[240px] lg:h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data as unknown as Record<string, unknown>[]}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 45 : 60}
                  outerRadius={isMobile ? 72 : 90}
                  paddingAngle={3}
                  dataKey="total"
                  nameKey="kategori"
                  label={renderLabel}
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
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ display: isMobile ? "none" : "block" }} formatter={(value) => <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>{value}</span>} />
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
