import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PERIOD_OPTIONS } from "./utils";
import type { PeriodPreset, PeriodDate } from "./types";

interface PeriodFilterCardProps {
  periodPreset: PeriodPreset;
  customPeriod: PeriodDate;
  onPeriodPresetChange: (preset: PeriodPreset) => void;
  onCustomPeriodChange: (period: PeriodDate) => void;
}

export function PeriodFilterCard({ periodPreset, customPeriod, onPeriodPresetChange, onCustomPeriodChange }: PeriodFilterCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Periode:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <Button key={option.value} variant={periodPreset === option.value ? "default" : "outline"} size="sm" onClick={() => onPeriodPresetChange(option.value)}>
                {option.label}
              </Button>
            ))}
          </div>
          {periodPreset === "custom" && (
            <div className="flex gap-2 items-center">
              <Input type="date" value={customPeriod.mulai} onChange={(e) => onCustomPeriodChange({ ...customPeriod, mulai: e.target.value })} className="w-auto" />
              <span className="text-muted-foreground">-</span>
              <Input type="date" value={customPeriod.selesai} onChange={(e) => onCustomPeriodChange({ ...customPeriod, selesai: e.target.value })} className="w-auto" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
