import { useTheme, type ThemeName } from "@/contexts/ThemeContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Palette, Sun, Moon } from "lucide-react";

const themes: { name: ThemeName; label: string }[] = [
    { name: "blue", label: "Blue" },
    { name: "red", label: "Red (Kedai Bunda)" },
    { name: "amber-minimal", label: "Amber Minimal" },
    { name: "amethyst-haze", label: "Amethyst Haze" },
    { name: "art-deco", label: "Art Deco" },
    { name: "catppuccin", label: "Catppuccin" },
    { name: "nature", label: "Nature" },
    { name: "ocean-breeze", label: "Ocean Breeze" },
];

export function ThemeSwitcher() {
    const { theme, variant, setTheme, setVariant } = useTheme();

    const currentTheme = themes.find((t) => t.name === theme);

    return (
        <div className="flex items-center gap-2">
            {/* Theme Selector */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="hidden md:inline">
                            {currentTheme?.label || "Theme"}
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Pilih Tema</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {themes.map((t) => (
                        <DropdownMenuItem
                            key={t.name}
                            onClick={() => setTheme(t.name)}
                            className={`cursor-pointer ${
                                theme === t.name ? "bg-accent" : ""
                            }`}
                        >
                            <div className="flex items-center gap-2 w-full">
                                <div
                                    className="w-4 h-4 rounded-full border"
                                    style={{
                                        background: getThemePreviewColor(
                                            t.name
                                        ),
                                    }}
                                />
                                <span>{t.label}</span>
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Light/Dark Toggle */}
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    setVariant(variant === "light" ? "dark" : "light")
                }
                className="h-9 w-9 p-0"
            >
                {variant === "light" ? (
                    <Sun className="h-4 w-4" />
                ) : (
                    <Moon className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
}

// Preview colors for themes
function getThemePreviewColor(theme: ThemeName): string {
    const colors: Record<ThemeName, string> = {
        blue: "rgb(59 130 246)",
        red: "rgb(220 38 38)",
        "amber-minimal": "rgb(245 158 11)",
        "amethyst-haze": "rgb(168 85 247)",
        "art-deco": "rgb(212 175 55)",
        catppuccin: "rgb(137 180 250)",
        nature: "rgb(34 197 94)",
        "ocean-breeze": "rgb(14 165 233)",
    };
    return colors[theme];
}
