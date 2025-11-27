import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme, type ThemeName } from "@/contexts/ThemeContext";
import { useState } from "react";
import { Palette, Search, Check, Sun, Moon, Sparkles, Grid3x3, List, Shuffle } from "lucide-react";
import { themeCategories, getThemeDisplayName, themes } from "../../public/themes/hook";

export function ThemeSettingsPage() {
  const { theme, variant, setTheme, setVariant } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isChanging, setIsChanging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get all themes from the themes array
  const allThemes = [...themes];

  // Filter themes based on search and category
  const filteredThemes = allThemes.filter((themeName) => {
    const matchesSearch = themeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || (themeCategories[selectedCategory as keyof typeof themeCategories] as readonly string[])?.includes(themeName);
    return matchesSearch && matchesCategory;
  });

  // Handle theme change with animation
  const handleThemeChange = (newTheme: ThemeName) => {
    setIsChanging(true);
    setTimeout(() => {
      setTheme(newTheme);
      setTimeout(() => setIsChanging(false), 300);
    }, 150);
  };

  // Random theme
  const handleRandomTheme = () => {
    const randomIndex = Math.floor(Math.random() * allThemes.length);
    handleThemeChange(allThemes[randomIndex] as ThemeName);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <Palette className="h-8 w-8 text-primary" />
              Pengaturan Tema
            </h2>
            <p className="text-muted-foreground mt-2">
              Pilih dari {allThemes.length}+ tema yang tersedia • Tekan <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl + →</kbd> untuk ganti tema
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Random Theme */}
            <Button onClick={handleRandomTheme} variant="outline" className="gap-2">
              <Shuffle className="h-4 w-4" />
              Random
            </Button>

            {/* Light/Dark Toggle */}
            <Button onClick={() => setVariant(variant === "light" ? "dark" : "light")} variant="outline" className="gap-2">
              {variant === "light" ? (
                <>
                  <Moon className="h-4 w-4" />
                  Dark
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  Light
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Current Theme Preview */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary text-primary-foreground p-4 rounded-xl">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tema Aktif</p>
                  <h3 className="text-2xl font-bold text-foreground">{getThemeDisplayName(theme as ThemeName)}</h3>
                  <p className="text-sm text-muted-foreground capitalize mt-1">Mode: {variant}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg bg-primary border-2 border-primary-foreground/20" />
                <div className="w-12 h-12 rounded-lg bg-secondary border-2 border-secondary-foreground/20" />
                <div className="w-12 h-12 rounded-lg bg-accent border-2 border-accent-foreground/20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari tema..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={selectedCategory === "all" ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory("all")}>
            Semua ({allThemes.length})
          </Badge>
          {Object.keys(themeCategories).map((category) => (
            <Badge key={category} variant={selectedCategory === category ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setSelectedCategory(category)}>
              {category} ({themeCategories[category as keyof typeof themeCategories].length})
            </Badge>
          ))}
        </div>

        {/* Theme Grid/List */}
        <div className={`${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"} ${isChanging ? "opacity-50 pointer-events-none" : "opacity-100"} transition-opacity duration-300`}>
          {filteredThemes.map((themeName) => {
            const isActive = theme === themeName;

            if (viewMode === "list") {
              return (
                <Card key={themeName} className={`cursor-pointer transition-all hover:shadow-lg ${isActive ? "border-primary border-2 bg-primary/5" : ""}`} onClick={() => handleThemeChange(themeName as ThemeName)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg border-2 bg-gradient-to-br"
                          style={{
                            background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)`,
                          }}
                        />
                        <div>
                          <h3 className="font-semibold text-foreground">{getThemeDisplayName(themeName as ThemeName)}</h3>
                          <p className="text-xs text-muted-foreground capitalize">{Object.entries(themeCategories).find(([, themeList]) => (themeList as readonly string[]).includes(themeName))?.[0] || "Other"}</p>
                        </div>
                      </div>

                      {isActive && (
                        <div className="flex items-center gap-2 text-primary">
                          <Check className="h-5 w-5" />
                          <span className="text-sm font-medium">Aktif</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={themeName} className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${isActive ? "border-primary border-2 shadow-xl" : ""}`} onClick={() => handleThemeChange(themeName as ThemeName)}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Color Preview */}
                    <div className="aspect-video rounded-lg overflow-hidden border-2 border-border bg-gradient-to-br from-primary via-secondary to-accent" />

                    {/* Theme Info */}
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-1">{getThemeDisplayName(themeName as ThemeName)}</h3>
                      <p className="text-xs text-muted-foreground capitalize mt-1">{Object.entries(themeCategories).find(([, themeList]) => (themeList as readonly string[]).includes(themeName))?.[0] || "Other"}</p>
                    </div>

                    {/* Active Badge */}
                    {isActive && (
                      <Badge className="w-full justify-center gap-1">
                        <Check className="h-3 w-3" />
                        Tema Aktif
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredThemes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Palette className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Tidak ada tema yang ditemukan</h3>
              <p className="text-muted-foreground">Coba kata kunci lain atau pilih kategori berbeda</p>
            </CardContent>
          </Card>
        )}

        {/* Loading Overlay */}
        {isChanging && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-lg font-semibold text-foreground animate-pulse">Mengganti tema...</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
