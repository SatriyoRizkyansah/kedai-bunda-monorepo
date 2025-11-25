import { useEffect, useState } from "react";

// Import all theme CSS files
import amberMinimalCss from "./amber-minimal.css?inline";
import amethystHazeCss from "./amethyst-haze.css?inline";
import artDecoCss from "./art-deco.css?inline";
import blueCss from "./blue.css?inline";
import boldTechCss from "./bold.tech.css?inline";
import bubblegumCss from "./bubblegum.css?inline";
import caffeinCss from "./caffein.css?inline";
import candylandCss from "./candyland.css?inline";
import catppuccinCss from "./catppuccin.css?inline";
import claudeCss from "./claude.css?inline";
import claymorphismCss from "./claymorphism.css?inline";
import cleanStateCss from "./clean-state.css?inline";
import corporateCss from "./corporate.css?inline";
import cosmicNightCss from "./cosmic-night.css?inline";
import cyberPunkCss from "./cyber-punk.css?inline";
import darkMatterCss from "./dark-matter.css?inline";
import doom64Css from "./doom-64.css?inline";
import elegantLuxuryCss from "./elegant-luxury.css?inline";
import ghibliStudioCss from "./ghibli-studio.css?inline";
import graphiteCss from "./graphite.css?inline";
import greenCss from "./green.css?inline";
import kodamaGroveCss from "./kodama-grove.css?inline";
import marshmallowCss from "./marshmallow.css?inline";
import marvelCss from "./marvel.css?inline";
import materialDesignCss from "./material-design.css?inline";
import midnightBlossomCss from "./midnight-blossom.css?inline";
import mochaMousseCss from "./mocha-mousse.css?inline";
import modernMinimalCss from "./modern-minimal.css?inline";
import monoCss from "./mono.css?inline";
import natureCss from "./nature.css?inline";
import neoBrutalismCss from "./neo-brutalism.css?inline";
import northernLightsCss from "./northern-lights.css?inline";
import noteBookCss from "./note-book.css?inline";
import oceanBreezeCss from "./ocean-breeze.css?inline";
import orangeCss from "./orange.css?inline";
import pastelDreamsCss from "./pastel-dreams.css?inline";
import perpetuityCss from "./perpetuity.css?inline";
import quantumRoseCss from "./quantum-rose.css?inline";
import redCss from "./red.css?inline";
import retroArcadeCss from "./retro-arcade.css?inline";
import roseCss from "./rose.css?inline";
import slackCss from "./slack.css?inline";
import softPopCss from "./soft-pop.css?inline";
import solarDuskCss from "./solar-dusk.css?inline";
import spotifyCss from "./spotify.css?inline";
import starryNightCss from "./starry-night.css?inline";
import summerCss from "./summer.css?inline";
import sunsetHorizonCss from "./sunset-horizon.css?inline";
import supabaseCss from "./supabase.css?inline";
import t3ChatCss from "./t3-chat.css?inline";
import tangerineCss from "./tangerine.css?inline";
import twitterCss from "./twitter.css?inline";
import valorantCss from "./valorant.css?inline";
import vercelCss from "./vercel.css?inline";
import vintagePaperCss from "./vintage-paper.css?inline";
import violetBlossomCss from "./violet-blossom.css?inline";
import violetCss from "./violet.css?inline";
import vscodeCss from "./vscode.css?inline";
import yellowCss from "./yellow.css?inline";
import dota2Css from "./dota2.css?inline";
import callOfDutyCss from "./call-of-duty.css?inline";
import discordCss from "./discord.css?inline";
import netflixCss from "./netflix.css?inline";
import steamCss from "./steam.css?inline";
import notionCss from "./notion.css?inline";
import youtubeCss from "./youtube.css?inline";
import leagueOfLegendsCss from "./league-of-legends.css?inline";

/**
 * Available theme options
 */
export const themes = [
  "amber-minimal",
  "amethyst-haze",
  "art-deco",
  "blue",
  "bold.tech",
  "bubblegum",
  "caffein",
  "candyland",
  "catppuccin",
  "claude",
  "claymorphism",
  "clean-state",
  "corporate",
  "cosmic-night",
  "cyber-punk",
  "dark-matter",
  "doom-64",
  "elegant-luxury",
  "ghibli-studio",
  "graphite",
  "green",
  "kodama-grove",
  "marshmallow",
  "marvel",
  "material-design",
  "midnight-blossom",
  "mocha-mousse",
  "modern-minimal",
  "mono",
  "nature",
  "neo-brutalism",
  "northern-lights",
  "note-book",
  "ocean-breeze",
  "orange",
  "pastel-dreams",
  "perpetuity",
  "quantum-rose",
  "red",
  "retro-arcade",
  "rose",
  "slack",
  "soft-pop",
  "solar-dusk",
  "spotify",
  "starry-night",
  "summer",
  "sunset-horizon",
  "supabase",
  "t3-chat",
  "tangerine",
  "twitter",
  "valorant",
  "vercel",
  "vintage-paper",
  "violet-blossom",
  "violet",
  "vscode",
  "yellow",
  "dota2",
  "call-of-duty",
  "discord",
  "netflix",
  "steam",
  "notion",
  "youtube",
  "league-of-legends",
] as const;

export type ThemeName = (typeof themes)[number];

// Theme CSS mapping
const themeCssMap: Record<ThemeName, string> = {
  "amber-minimal": amberMinimalCss,
  "amethyst-haze": amethystHazeCss,
  "art-deco": artDecoCss,
  blue: blueCss,
  "bold.tech": boldTechCss,
  bubblegum: bubblegumCss,
  caffein: caffeinCss,
  candyland: candylandCss,
  catppuccin: catppuccinCss,
  claude: claudeCss,
  claymorphism: claymorphismCss,
  "clean-state": cleanStateCss,
  corporate: corporateCss,
  "cosmic-night": cosmicNightCss,
  "cyber-punk": cyberPunkCss,
  "dark-matter": darkMatterCss,
  "doom-64": doom64Css,
  "elegant-luxury": elegantLuxuryCss,
  "ghibli-studio": ghibliStudioCss,
  graphite: graphiteCss,
  green: greenCss,
  "kodama-grove": kodamaGroveCss,
  marshmallow: marshmallowCss,
  marvel: marvelCss,
  "material-design": materialDesignCss,
  "midnight-blossom": midnightBlossomCss,
  "mocha-mousse": mochaMousseCss,
  "modern-minimal": modernMinimalCss,
  mono: monoCss,
  nature: natureCss,
  "neo-brutalism": neoBrutalismCss,
  "northern-lights": northernLightsCss,
  "note-book": noteBookCss,
  "ocean-breeze": oceanBreezeCss,
  orange: orangeCss,
  "pastel-dreams": pastelDreamsCss,
  perpetuity: perpetuityCss,
  "quantum-rose": quantumRoseCss,
  red: redCss,
  "retro-arcade": retroArcadeCss,
  rose: roseCss,
  slack: slackCss,
  "soft-pop": softPopCss,
  "solar-dusk": solarDuskCss,
  spotify: spotifyCss,
  "starry-night": starryNightCss,
  summer: summerCss,
  "sunset-horizon": sunsetHorizonCss,
  supabase: supabaseCss,
  "t3-chat": t3ChatCss,
  tangerine: tangerineCss,
  twitter: twitterCss,
  valorant: valorantCss,
  vercel: vercelCss,
  "vintage-paper": vintagePaperCss,
  "violet-blossom": violetBlossomCss,
  violet: violetCss,
  vscode: vscodeCss,
  yellow: yellowCss,
  dota2: dota2Css,
  "call-of-duty": callOfDutyCss,
  discord: discordCss,
  netflix: netflixCss,
  steam: steamCss,
  notion: notionCss,
  youtube: youtubeCss,
  "league-of-legends": leagueOfLegendsCss,
};

interface UseThemeSwitcherReturn {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: readonly ThemeName[];
}

const THEME_STORAGE_KEY = "app-theme";
const THEME_LINK_ID = "theme-stylesheet";
const DEFAULT_THEME: ThemeName = "modern-minimal";

/**
 * Hook for switching between CSS themes
 *
 * @example
 * ```tsx
 * function ThemeSwitcher() {
 *   const { currentTheme, setTheme, themes } = useThemeSwitcher();
 *
 *   return (
 *     <select value={currentTheme} onChange={(e) => setTheme(e.target.value as ThemeName)}>
 *       {themes.map((theme) => (
 *         <option key={theme} value={theme}>
 *           {theme}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useThemeSwitcher(): UseThemeSwitcherReturn {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    // Get theme from localStorage or use default
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && themes.includes(stored as ThemeName)) {
        return stored as ThemeName;
      }
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    // Load the theme CSS file
    const loadTheme = (themeName: ThemeName) => {
      // Remove existing theme style if present
      const existingStyle = document.getElementById(THEME_LINK_ID);
      if (existingStyle) {
        existingStyle.remove();
      }

      // Get CSS content from map
      const cssContent = themeCssMap[themeName];

      if (!cssContent) {
        console.error(`Theme CSS not found: ${themeName}`);
        return;
      }

      // Create and append new style tag
      const style = document.createElement("style");
      style.id = THEME_LINK_ID;
      style.textContent = cssContent;
      document.head.appendChild(style);
    };

    loadTheme(currentTheme);

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
  }, [currentTheme]);

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
  };

  return {
    currentTheme,
    setTheme,
    themes,
  };
}

/**
 * Get a formatted display name for a theme
 */
export function getThemeDisplayName(theme: ThemeName): string {
  return theme
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Group themes by category for better organization
 */
export const themeCategories = {
  brand: [
    "spotify",
    "twitter",
    "slack",
    "supabase",
    "vercel",
    "vscode",
    "marvel",
    "discord",
    "netflix",
    "youtube",
    "notion",
  ],
  color: [
    "blue",
    "green",
    "orange",
    "red",
    "rose",
    "violet",
    "yellow",
    "tangerine",
  ],
  nature: [
    "ocean-breeze",
    "northern-lights",
    "starry-night",
    "summer",
    "sunset-horizon",
    "kodama-grove",
    "ghibli-studio",
  ],
  style: [
    "neo-brutalism",
    "claymorphism",
    "cyber-punk",
    "retro-arcade",
    "art-deco",
    "vintage-paper",
    "material-design",
    "modern-minimal",
  ],
  aesthetic: [
    "pastel-dreams",
    "quantum-rose",
    "violet-blossom",
    "amethyst-haze",
    "midnight-blossom",
    "mocha-mousse",
    "bubblegum",
    "candyland",
    "marshmallow",
    "soft-pop",
  ],
  professional: [
    "corporate",
    "clean-state",
    "perpetuity",
    "graphite",
    "mono",
    "note-book",
    "elegant-luxury",
  ],
  gaming: [
    "valorant",
    "doom-64",
    "dota2",
    "call-of-duty",
    "league-of-legends",
    "steam",
  ],
  other: [
    "amber-minimal",
    "bold.tech",
    "caffein",
    "catppuccin",
    "claude",
    "cosmic-night",
    "dark-matter",
    "nature",
    "solar-dusk",
    "t3-chat",
  ],
} as const;
