"use client";

import { DynamicTemplateForm } from "@/components/resume/dynamic-template-form";
import { ResumeForm } from "@/components/resume/resume-form";
import { useLanguage } from "@/components/layout/language-provider";
import { SectionHeader } from "@/components/ui/section-header";
import { useResume } from "@/hooks/use-resume";
import { getCanvaResumeTemplate } from "@/templates/resume-template-registry";

export default function ResumeBuilderPage() {
  const { resume, setResume } = useResume();
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const canvaTemplate = getCanvaResumeTemplate(resume.templateId);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={isArabic ? "المحرر" : "Editor"}
        title={canvaTemplate ? (isArabic ? "محرر سيرة قالب Canva" : "Canva resume template editor") : isArabic ? "محرر السيرة الذاتية" : "Resume editor"}
        description={
          canvaTemplate
            ? isArabic
              ? "هذا النموذج يظهر فقط الحقول المطلوبة في قالب Canva المحدد."
              : "This editor shows only the fields used by the selected Canva template."
            : isArabic
              ? "استخدم التبويبات لتنظيم التحرير، وستظهر المعاينة بجانب النموذج على الشاشات الكبيرة."
              : "Use the guided sections to organize the resume. The preview appears beside the form on large screens."
        }
      />
      {canvaTemplate ? (
        <DynamicTemplateForm template={canvaTemplate} resume={resume} onChange={setResume} />
      ) : (
        <ResumeForm resume={resume} onChange={setResume} />
      )}
    </div>
  );
}
