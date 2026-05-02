import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function DashboardStatsCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className="grid size-11 place-items-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    </Card>
  );
}
