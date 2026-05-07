"use client";

import { Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/layout/language-provider";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const mobileLinks = [
  { href: "/dashboard", ar: "لوحة التحكم", en: "Dashboard" },
  { href: "/dashboard/resume", ar: "السيرة الذاتية", en: "Resume" },
  { href: "/dashboard/templates", ar: "القوالب", en: "Templates" },
  { href: "/dashboard/portfolio", ar: "البورتفوليو", en: "Portfolio" },
  { href: "/dashboard/github", ar: "GitHub", en: "GitHub" },
  { href: "/dashboard/settings", ar: "الإعدادات", en: "Settings" },
] as const;

export function Topbar() {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const isArabic = locale === "ar";

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#fffefa]/85 px-4 py-3 backdrop-blur dark:border-zinc-900 dark:bg-[#111111]/90 lg:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-950 dark:text-white lg:hidden">
          <Sparkles className="size-5 text-cyan-500" />
          {isArabic ? "منشئ السيرة" : "AI Career Kit"}
        </Link>
        <div className="hidden text-sm text-slate-500 dark:text-slate-400 lg:block">
          {isArabic
            ? "ابنِ وعاين وانشر وعدّل من مساحة عمل واحدة."
            : "Build, preview, publish, and iterate from one workspace."}
        </div>
        <div className="flex items-center gap-2">
          <Button href="/dashboard/profile" size="sm" variant="ghost">
            {isArabic ? "البروفايل" : "Profile"}
          </Button>
          <LanguageToggle />
          <ThemeToggle />
          <Button
            className="lg:hidden"
            size="sm"
            variant="ghost"
            aria-label={isArabic ? "فتح القائمة" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>
      {open ? (
        <nav className="mt-3 grid gap-2 rounded-lg border border-stone-200 bg-[#fffefa] p-2 shadow-sm dark:border-zinc-800 dark:bg-[#1a1a1a] lg:hidden">
          {mobileLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-stone-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              {isArabic ? link.ar : link.en}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
