"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useAppTheme } from "@/components/layout/theme-provider";
import { useLanguage } from "@/components/layout/language-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useAppTheme();
  const { t } = useLanguage();
  const options = [
    { value: "system" as const, label: t("system"), icon: Monitor },
    { value: "dark" as const, label: t("dark"), icon: Moon },
    { value: "light" as const, label: t("light"), icon: Sun },
  ];

  return (
    <div className="flex h-9 items-center rounded-lg border border-stone-200 bg-[#fffefa] p-1 dark:border-zinc-800 dark:bg-[#1f1f1f]">
      {options.map((option) => {
        const Icon = option.icon;
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            title={option.label}
            aria-label={option.label}
            onClick={() => setTheme(option.value)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-semibold transition sm:px-2.5",
              active
                ? "bg-blue-500 text-white shadow-sm dark:bg-[#2b2b2b] dark:text-white"
                : "text-slate-500 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-zinc-900",
            )}
          >
            <Icon className={cn("size-3.5", active ? "text-white" : "text-blue-500")} />
            <span className="hidden lg:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
