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
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Periode</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {PERIOD_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={periodPreset === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => onPeriodPresetChange(option.value)}
                className={`w-full justify-center sm:w-auto ${option.value === "custom" ? "col-span-2" : ""}`}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {periodPreset === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input type="date" value={customPeriod.mulai} onChange={(e) => onCustomPeriodChange({ ...customPeriod, mulai: e.target.value })} />
              <Input type="date" value={customPeriod.selesai} onChange={(e) => onCustomPeriodChange({ ...customPeriod, selesai: e.target.value })} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
