import { useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "../../public/themes/hook";

/**
 * Global keyboard shortcut hook for theme switching
 * Ctrl + Arrow Right = Next theme
 * Active on all pages
 */
export function useGlobalThemeShortcut() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl + Arrow Right to cycle to next theme
      if (e.ctrlKey && e.key === "ArrowRight") {
        e.preventDefault();

        const allThemes = [...themes];
        const currentIndex = allThemes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % allThemes.length;
        const nextTheme = allThemes[nextIndex];

        setTheme(nextTheme);

        // Show toast notification
        showThemeChangeNotification(nextTheme);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [theme, setTheme]);
}

// Simple toast notification for theme change
function showThemeChangeNotification(themeName: string) {
  // Remove existing notification if any
  const existing = document.getElementById("theme-change-toast");
  if (existing) {
    existing.remove();
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.id = "theme-change-toast";
  toast.className = "fixed bottom-6 right-6 z-[100] bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in";
  toast.style.cssText = "animation-duration: 0.2s;";

  // Format theme name
  const formattedName = themeName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  toast.innerHTML = `
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
    <div>
      <div class="font-semibold">Tema Berubah</div>
      <div class="text-sm opacity-90">${formattedName}</div>
    </div>
  `;

  document.body.appendChild(toast);

  // Auto remove after 2 seconds
  setTimeout(() => {
    toast.style.animation = "fade-out 0.2s ease-in";
    setTimeout(() => toast.remove(), 200);
  }, 2000);
}
