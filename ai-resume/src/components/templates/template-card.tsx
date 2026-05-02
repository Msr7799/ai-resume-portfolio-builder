"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/components/layout/language-provider";
import type { CanvaResumeTemplate } from "@/types/template";

export function CanvaTemplateCard({
  template,
  selected,
  onSelect,
  actionLabel,
}: {
  template: CanvaResumeTemplate;
  selected: boolean;
  onSelect?: () => void;
  actionLabel?: string;
}) {
  const { t, locale } = useLanguage();
  const templateName = template.id === "my-cv" ? t("myCvTemplateName") : template.name;
  const templateDescription =
    template.id === "my-cv" ? t("myCvTemplateDescription") : template.description;

  return (
    <Card className={selected ? "ring-2 ring-blue-500" : ""} dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="relative aspect-[210/297] overflow-hidden rounded-lg border border-stone-200 bg-stone-100 dark:border-zinc-800 dark:bg-black">
        <Image
          src={template.thumbnail}
          alt={templateName}
          fill
          className="object-contain p-2"
          sizes="(max-width: 768px) 100vw, 360px"
          priority
        />
        {selected ? (
          <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-md bg-blue-500 px-2 py-1 text-xs font-bold text-white">
            <CheckCircle2 className="size-3.5" />
            {t("selected")}
          </span>
        ) : null}
      </div>
      <div className="mt-4">
        <h3 className="font-bold text-slate-950 dark:text-white">{templateName}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {templateDescription}
        </p>
      </div>
      {onSelect ? (
        <Button className="mt-4 w-full" onClick={onSelect} variant={selected ? "primary" : "secondary"}>
          {actionLabel ?? (selected ? t("useSelectedTemplate") : t("useTemplate"))}
        </Button>
      ) : null}
    </Card>
  );
}
