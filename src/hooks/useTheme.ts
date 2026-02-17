import { useEffect, useState } from "react";

export type ResolvedTheme = "light" | "dark";
export type ThemeMode = ResolvedTheme | "system";

const THEME_STORAGE_KEY = "dnd-ui-theme";

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function getInitialThemeMode(): ThemeMode {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (isThemeMode(storedTheme)) {
    return storedTheme;
  }

  return "system";
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const resolvedTheme: ResolvedTheme =
    themeMode === "system" ? systemTheme : themeMode;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [resolvedTheme, themeMode]);

  const cycleThemeMode = () => {
    setThemeMode((currentThemeMode) => {
      if (currentThemeMode === "light") {
        return "dark";
      }

      if (currentThemeMode === "dark") {
        return "system";
      }

      return "light";
    });
  };

  return { themeMode, resolvedTheme, setThemeMode, cycleThemeMode };
}

export const themeStorageKey = THEME_STORAGE_KEY;