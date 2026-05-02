import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="flex flex-col items-center justify-center py-10 text-center">
      <Icon className="mb-3 size-9 text-slate-400" />
      <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </Card>
  );
}
