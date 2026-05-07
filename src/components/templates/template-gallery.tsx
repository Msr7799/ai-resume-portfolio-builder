"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { CanvaTemplateCard } from "@/components/templates/template-card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/layout/language-provider";
import { canvaResumeTemplates } from "@/templates/resume-template-registry";
import type { Resume } from "@/types";

export function TemplateGallery({
  resume,
  onSelect,
}: {
  resume: Resume;
  onSelect: (resume: Resume) => void;
}) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { isRtl, locale } = useLanguage();
  const isArabic = locale === "ar";

  function selectTemplate(templateId: string) {
    // Warn the user if changing templates will discard existing fieldStates/templateData
    const hasExistingData =
      resume.templateId &&
      resume.templateId !== templateId &&
      (Object.keys(resume.templateData ?? {}).length > 0 ||
        Object.keys(resume.templateFieldStates ?? {}).length > 0);

    if (hasExistingData) {
      const confirmed = window.confirm(
        isArabic
          ? "تغيير القالب سيمسح بيانات التنسيق الحالية (مواقع الحقول، الألوان، التعديلات). هل تريد المتابعة؟"
          : "Changing templates will discard your current field positions, styles, and layout customizations. Continue?"
      );
      if (!confirmed) return;
    }

    onSelect({ ...resume, templateId, templateData: {}, templateFieldStates: {}, status: "Draft" });
    router.push("/dashboard/resume");
  }

  function scrollByCard(direction: "prev" | "next") {
    scrollerRef.current?.scrollBy({
      left: direction === "next" ? 360 : -360,
      behavior: "smooth",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="secondary" onClick={() => scrollByCard("prev")} aria-label="Previous template">
          <ChevronLeft className="size-4" />
        </Button>
        <Button size="sm" variant="secondary" onClick={() => scrollByCard("next")} aria-label="Next template">
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div
        ref={scrollerRef}
        dir="ltr"
        className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:thin] sm:gap-5"
      >
        {canvaResumeTemplates.map((template, index) => (
          <div key={template.id} className="w-[82vw] max-w-[340px] shrink-0 snap-start sm:w-[340px]" dir={isRtl ? "rtl" : "ltr"}>
            <CanvaTemplateCard
              template={template}
              selected={resume.templateId === template.id}
              onSelect={() => selectTemplate(template.id)}
              priority={index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
