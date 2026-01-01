import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import type { GrafikPendapatanItem } from "./types";
import { formatCurrency, formatCurrencyFull } from "./utils";

interface RevenueTrendCardProps {
  data: GrafikPendapatanItem[];
}

export function RevenueTrendCard({ data }: RevenueTrendCardProps) {
  return (
    <Card className="border-border bg-card" style={{ boxShadow: "var(--shadow-md)", borderRadius: "var(--radius)" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Pendapatan 7 Hari Terakhir
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hari" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} width={70} />
              <Tooltip
                formatter={(value) => {
                  const numValue = typeof value === "number" ? value : 0;
                  return [formatCurrencyFull(numValue), "Pendapatan"];
                }}
                labelFormatter={(label) => `Hari: ${label}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Area type="monotone" dataKey="pendapatan" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorPendapatan)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
