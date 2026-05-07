import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: ReactNode;
};

const variants = {
  primary:
    "bg-[#1a73e8] text-white shadow-lg shadow-blue-500/20 hover:bg-[#1765cc] dark:bg-[#8ab4f8] dark:text-black dark:hover:bg-[#aecbfa]",
  secondary:
    "border border-stone-200 bg-[#fffefa] text-slate-900 hover:bg-stone-100 dark:border-zinc-800 dark:bg-[#1f1f1f] dark:text-white dark:hover:bg-[#2a2a2a]",
  ghost:
    "text-slate-700 hover:bg-stone-100 dark:text-zinc-300 dark:hover:bg-[#1f1f1f]",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-slate-950",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    if (href.startsWith("http") || href.startsWith("mailto:")) {
      return (
        <a className={classes} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
          {children}
        </a>
      );
    }

    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
