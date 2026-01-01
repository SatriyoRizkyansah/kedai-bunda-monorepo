import { AlertCircle, ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: { percentage: string; isUp: boolean };
}

export function StatsCard({ title, value, icon, subtitle, trend }: StatsCardProps) {
  return (
    <Card className="group relative overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-500">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:scale-150" />
      <div className="absolute -right-3 -bottom-3 h-16 w-16 rounded-full bg-primary/5 blur-xl opacity-60" />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">{title}</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
            {trend && (
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${trend.isUp ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                {trend.isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                <span>{trend.percentage}%</span>
              </div>
            )}
            {subtitle && !trend && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{subtitle}</span>
              </div>
            )}
          </div>
          <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3">{icon}</div>
        </div>
      </CardContent>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
