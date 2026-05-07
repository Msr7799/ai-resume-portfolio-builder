"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/components/layout/language-provider";
import { cn } from "@/lib/utils";
import type { Template } from "@/types";

export function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: Template;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const { locale, t } = useLanguage();
  const text =
    locale === "ar"
      ? {
          selected: t("selected"),
          use: t("useTemplate"),
        }
      : {
          selected: "Selected",
          use: "Use template",
        };

  return (
    <Card className={cn("space-y-4", selected && "ring-2 ring-cyan-500")}>
      <div className={cn("h-32 rounded-lg bg-gradient-to-br p-4", template.previewClassName)}>
        <div className="h-full rounded-md border border-white/25 bg-white/20 p-3 backdrop-blur">
          <div className="h-3 w-24 rounded bg-white/80" />
          <div className="mt-5 space-y-2">
            <div className="h-2 rounded bg-white/60" />
            <div className="h-2 w-2/3 rounded bg-white/60" />
            <div className="h-2 w-4/5 rounded bg-white/60" />
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-slate-950 dark:text-white">{template.name}</h3>
          {selected ? <Check className="size-5 text-cyan-500" /> : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {template.description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {template.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      {onSelect ? (
        <Button className="w-full" variant={selected ? "primary" : "secondary"} onClick={onSelect}>
          {selected ? text.selected : text.use}
        </Button>
      ) : null}
    </Card>
  );
}
