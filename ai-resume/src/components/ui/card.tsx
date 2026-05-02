import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-stone-200 bg-[#fffefa] p-5 shadow-sm shadow-stone-900/5 dark:border-zinc-800 dark:bg-[#111111] dark:shadow-black/30",
        className,
      )}
      {...props}
    />
  );
}
