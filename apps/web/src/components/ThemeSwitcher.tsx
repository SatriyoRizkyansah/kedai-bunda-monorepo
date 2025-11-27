import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Palette, Sun, Moon } from "lucide-react";

export function ThemeSwitcher() {
  const { variant, setVariant } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      {/* Theme Settings Button */}
      <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/theme-settings")}>
        <Palette className="h-4 w-4" />
        <span className="hidden md:inline">Tema</span>
      </Button>

      {/* Light/Dark Toggle */}
      <Button variant="outline" size="sm" onClick={() => setVariant(variant === "light" ? "dark" : "light")} className="h-9 w-9 p-0">
        {variant === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  );
}
