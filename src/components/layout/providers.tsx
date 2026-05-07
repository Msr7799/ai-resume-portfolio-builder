"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/components/layout/language-provider";
import { AppThemeProvider } from "@/components/layout/theme-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </AppThemeProvider>
  );
}
