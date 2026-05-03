"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useAppTheme } from "@/components/layout/theme-provider";
import { useLanguage } from "@/components/layout/language-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme } = useAppTheme();
  const { t, locale } = useLanguage();

  const nextLabel =
    theme === "system"
      ? t(resolvedTheme === "dark" ? "light" : "dark")
      : theme === "dark"
        ? t("light")
        : t("system");

  const label =
    theme === "system"
      ? `${t("system")} · ${resolvedTheme === "dark" ? t("dark") : t("light")}`
      : theme === "dark"
        ? t("dark")
        : t("light");

  const Icon = theme === "system" ? Monitor : theme === "dark" ? Moon : Sun;

  return (
    <button
      type="button"
      title={`${label} → ${nextLabel}`}
      aria-label={`${label}. ${locale === "ar" ? "اضغط للتغيير إلى" : "Switch to"} ${nextLabel}`}
      onClick={toggleTheme}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-lg border border-stone-200 bg-[#fffefa] px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-stone-100",
        "dark:border-zinc-800 dark:bg-[#1f1f1f] dark:text-zinc-100 dark:hover:bg-zinc-900",
      )}
    >
      <Icon className={cn("size-4", theme === "light" ? "text-amber-500" : theme === "dark" ? "text-blue-400" : "text-cyan-500")} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
