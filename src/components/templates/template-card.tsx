"use client";

import Image from "next/image";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/components/layout/language-provider";
import type { CanvaResumeTemplate } from "@/types/template";

export function CanvaTemplateCard({
  template,
  selected,
  onSelect,
  actionLabel,
  priority = false,
}: {
  template: CanvaResumeTemplate;
  selected: boolean;
  onSelect?: () => void;
  actionLabel?: string;
  priority?: boolean;
}) {
  const { t, locale } = useLanguage();
  const isArabic = locale === "ar";
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
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />
        {selected ? (
          <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-md bg-blue-500 px-2 py-1 text-xs font-bold text-white">
            <CheckCircle2 className="size-3.5" />
            {t("selected")}
          </span>
        ) : null}
        {template.needsCleanup ? (
          <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-md bg-amber-500/90 px-2 py-1 text-xs font-bold text-white">
            <AlertTriangle className="size-3.5" />
            {isArabic ? "يحتاج تنظيف" : "Needs cleanup"}
          </span>
        ) : null}
      </div>
      <div className="mt-4">
        <h3 className="font-bold text-slate-950 dark:text-white">{templateName}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {templateDescription}
        </p>
        {template.needsCleanup ? (
          <p className="mt-2 rounded-md bg-amber-50 p-2 text-xs leading-5 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            <AlertTriangle className="me-1 inline size-3.5" />
            {isArabic
              ? "هذا القالب يحتوي على نصوص مدمجة في الخلفية لا يمكن تعديلها. عدد الحقول القابلة للتحرير قليل جدًا."
              : template.qualityWarning ?? "This template has limited editable fields."}
          </p>
        ) : null}
      </div>
      {onSelect ? (
        <Button className="mt-4 w-full" onClick={onSelect} variant={selected ? "primary" : "secondary"}>
          {actionLabel ?? (selected ? t("useSelectedTemplate") : t("useTemplate"))}
        </Button>
      ) : null}
    </Card>
  );
}
