"use client";

import {
  FileText,
  GitBranch,
  Home,
  LayoutDashboard,
  Palette,
  Settings,
  Sparkles,
  UserCircle,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/layout/language-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, color: "text-blue-500" },
  { href: "/dashboard/resume", labelKey: "resume", icon: FileText, color: "text-emerald-500" },
  { href: "/dashboard/portfolio", labelKey: "portfolio", icon: UserRound, color: "text-amber-500" },
  { href: "/dashboard/templates", labelKey: "templates", icon: Palette, color: "text-rose-500" },
  { href: "/dashboard/github", labelKey: "github", icon: GitBranch, color: "text-violet-500" },
  { href: "/dashboard/profile", labelKey: "profile", icon: UserCircle, color: "text-cyan-500" },
  { href: "/dashboard/settings", labelKey: "settings", icon: Settings, color: "text-zinc-500" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { locale, t } = useLanguage();
  const isArabic = locale === "ar";

  return (
    <aside className="hidden w-72 shrink-0 border-e border-stone-200 bg-[#fffefa]/90 p-4 backdrop-blur dark:border-zinc-900 dark:bg-[#111111]/95 lg:block">
      <Link href="/" className="flex items-center gap-3 rounded-lg px-2 py-3">
        <span className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-blue-500 via-emerald-400 to-amber-400 text-white">
          <Sparkles className="size-5" />
        </span>
        <span>
          <span className="block text-sm font-bold text-slate-950 dark:text-white">
            {isArabic ? "منشئ السيرة" : "AI Career Kit"}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isArabic ? "سيرة + بورتفوليو" : "Resume + Portfolio"}
          </span>
        </span>
      </Link>

      <nav className="mt-6 space-y-1">
        <Link
          href="/"
          className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Home className="size-4" />
          {isArabic ? "الرئيسية" : "Home"}
        </Link>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[#1f1f1f] text-white shadow-sm dark:bg-[#2b2b2b] dark:text-white"
                  : "text-slate-600 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-[#1f1f1f]",
              )}
            >
              <Icon className={cn("size-4", item.color)} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
