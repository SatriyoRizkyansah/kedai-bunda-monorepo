import { Search, Plus, Minus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TIPE_OPTIONS } from "./utils";
import type { StokLogTipe } from "./types";

interface StokLogFiltersProps {
  searchQuery: string;
  tipeFilter: StokLogTipe;
  onSearchChange: (value: string) => void;
  onTipeFilterChange: (tipe: StokLogTipe) => void;
  onTambahClick: () => void;
  onKurangiClick: () => void;
}

export function StokLogFilters({ searchQuery, tipeFilter, onSearchChange, onTipeFilterChange, onTambahClick, onKurangiClick }: StokLogFiltersProps) {
  return (
    <>
      {/* Header with Buttons */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-sans)" }}>
            Riwayat Stok
          </h1>
          <p className="text-muted-foreground">Kelola dan pantau pergerakan stok bahan baku</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onTambahClick} className="gap-2 bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4" />
            Tambah Stok
          </Button>
          <Button onClick={onKurangiClick} variant="destructive" className="gap-2">
            <Minus className="h-4 w-4" />
            Kurangi Stok
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Riwayat</CardTitle>
          <CardDescription>Cari dan filter riwayat pergerakan stok</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari berdasarkan nama bahan baku..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-10" />
            </div>

            {/* Tipe Filter */}
            <div className="flex gap-2">
              {TIPE_OPTIONS.map((option) => (
                <Button key={option.value} variant={tipeFilter === option.value ? "default" : "outline"} onClick={() => onTipeFilterChange(option.value)} size="sm" className="gap-1">
                  {option.value === "masuk" && <Plus className="h-4 w-4" />}
                  {option.value === "keluar" && <Minus className="h-4 w-4" />}
                  {option.value === "penyesuaian" && <AlertCircle className="h-4 w-4" />}
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
