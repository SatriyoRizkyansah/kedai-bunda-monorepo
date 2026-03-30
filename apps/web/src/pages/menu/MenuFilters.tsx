import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface MenuFiltersProps {
  searchTerm: string;
  selectedKategori: string;
  kategoris: string[];
  onSearchChange: (value: string) => void;
  onKategoriChange: (kategori: string) => void;
}

export function MenuFilters({ searchTerm, selectedKategori, kategoris, onSearchChange, onKategoriChange }: MenuFiltersProps) {
  return (
    <Card
      style={{
        boxShadow: "var(--shadow-sm)",
        borderRadius: "var(--radius)",
      }}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari menu..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              style={{
                borderRadius: "calc(var(--radius) - 2px)",
              }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 md:flex-wrap">
            {kategoris.map((kat) => (
              <Button
                key={kat}
                variant={selectedKategori === kat ? "default" : "outline"}
                size="sm"
                onClick={() => onKategoriChange(kat)}
                className="capitalize shrink-0 text-xs sm:text-sm"
                style={{
                  borderRadius: "calc(var(--radius) - 2px)",
                }}
              >
                {kat}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
