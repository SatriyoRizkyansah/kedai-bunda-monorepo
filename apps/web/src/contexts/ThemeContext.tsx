import { createContext, useContext, useEffect, useState } from "react";
import { type ThemeName as HookThemeName } from "../../public/themes/hook";

export type ThemeName = HookThemeName;

type ThemeVariant = "light" | "dark";

type ThemeContextType = {
  theme: ThemeName;
  variant: ThemeVariant;
  setTheme: (theme: ThemeName) => void;
  setVariant: (variant: ThemeVariant) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("theme");
    return (saved as ThemeName) || "blue";
  });

  const [variant, setVariantState] = useState<ThemeVariant>(() => {
    const saved = localStorage.getItem("theme-variant");
    return (saved as ThemeVariant) || "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.className = "";

    // Add current theme and variant
    root.classList.add(theme);
    if (variant === "dark") {
      root.classList.add("dark");
    }

    // Import theme CSS dynamically
    const link = document.getElementById("theme-css") as HTMLLinkElement;
    if (link) {
      link.href = `/themes/${theme}.css`;
    } else {
      const newLink = document.createElement("link");
      newLink.id = "theme-css";
      newLink.rel = "stylesheet";
      newLink.href = `/themes/${theme}.css`;
      document.head.appendChild(newLink);
    }
  }, [theme, variant]);

  const setTheme = (newTheme: ThemeName) => {
    localStorage.setItem("theme", newTheme);
    setThemeState(newTheme);
  };

  const setVariant = (newVariant: ThemeVariant) => {
    localStorage.setItem("theme-variant", newVariant);
    setVariantState(newVariant);
  };

  return <ThemeContext.Provider value={{ theme, variant, setTheme, setVariant }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
