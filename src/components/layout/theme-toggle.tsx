"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useAppTheme } from "@/components/layout/theme-provider";
import { useLanguage } from "@/components/layout/language-provider";
import { cn } from "@/lib/utils";

const themeOrder = ["system", "light", "dark"] as const;

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useAppTheme();
  const { t } = useLanguage();

  const currentIndex = themeOrder.indexOf(theme);
  const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
  const label = t(theme);
  const nextLabel = t(nextTheme);
  const Icon = theme === "system" ? Monitor : theme === "light" ? Sun : Moon;

  return (
    <button
      type="button"
      title={`${label} → ${nextLabel}`}
      aria-label={`${label} → ${nextLabel}`}
      aria-pressed={theme !== "system"}
      onClick={() => setTheme(nextTheme)}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold shadow-sm transition",
        "border-stone-200 bg-[#fffefa] text-slate-700 hover:bg-stone-100",
        "dark:border-zinc-800 dark:bg-[#1f1f1f] dark:text-zinc-100 dark:hover:bg-zinc-900",
      )}
    >
      <Icon
        className={cn(
          "size-4",
          theme === "light" && "text-amber-500",
          theme === "dark" && "text-cyan-300",
          theme === "system" && (resolvedTheme === "dark" ? "text-cyan-300" : "text-blue-500"),
        )}
      />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
