"use client";

import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import type { ReactNode } from "react";

type AppTheme = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
      storageKey="airpb:theme"
    >
      {children}
    </NextThemeProvider>
  );
}

export function useAppTheme() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const currentTheme = (theme ?? "system") as AppTheme;
  const currentResolvedTheme = (resolvedTheme ?? "light") as ResolvedTheme;

  return {
    theme: currentTheme,
    resolvedTheme: currentResolvedTheme,
    setTheme: (value: AppTheme) => setTheme(value),
    toggleTheme: () => {
      if (currentTheme === "system") {
        setTheme(currentResolvedTheme === "dark" ? "light" : "dark");
      } else if (currentTheme === "dark") {
        setTheme("light");
      } else {
        setTheme("system");
      }
    },
  };
}
