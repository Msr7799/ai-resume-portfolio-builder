"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type AppTheme = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: AppTheme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
};

const THEME_KEY = "airpb:theme";
const THEME_EVENT = "airpb:theme-change";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function readPreference(): AppTheme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light" || stored === "system") return stored;
  return "system";
}

function resolveTheme(theme: AppTheme): ResolvedTheme {
  if (theme === "dark" || theme === "light") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getThemeSnapshot() {
  const theme = readPreference();
  return `${theme}:${resolveTheme(theme)}`;
}

function subscribeTheme(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);
  mediaQuery.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
    mediaQuery.removeEventListener("change", callback);
  };
}

function writeTheme(theme: AppTheme) {
  window.localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore<string>(
    subscribeTheme,
    getThemeSnapshot,
    () => "system:light",
  );
  const [theme, resolvedTheme] = snapshot.split(":") as [AppTheme, ResolvedTheme];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: writeTheme,
      toggleTheme: () => {
        if (theme === "system") writeTheme(resolvedTheme === "dark" ? "light" : "dark");
        else if (theme === "dark") writeTheme("light");
        else writeTheme("system");
      },
    }),
    [resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  }
  return context;
}
