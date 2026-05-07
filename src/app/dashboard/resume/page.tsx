"use client";

import { DynamicTemplateForm } from "@/components/resume/dynamic-template-form";
import { ResumeForm } from "@/components/resume/resume-form";
import { useLanguage } from "@/components/layout/language-provider";
import { SectionHeader } from "@/components/ui/section-header";
import { LoadingState } from "@/components/ui/loading-state";
import { useResume } from "@/hooks/use-resume";
import { getCanvaResumeTemplate } from "@/templates/resume-template-registry";

export default function ResumeBuilderPage() {
  const { resume, setResume, ready } = useResume();
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  if (!ready) {
    return <LoadingState label={isArabic ? "جاري تحميل القالب والثيم..." : "Loading template and theme..."} />;
  }

  const canvaTemplate = getCanvaResumeTemplate(resume.templateId);

  if (canvaTemplate) {
    return (
      <DynamicTemplateForm
        key={resume.templateId}
        template={canvaTemplate}
        resume={resume}
        onChange={setResume}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={isArabic ? "المحرر" : "Editor"}
        title={isArabic ? "محرر السيرة الذاتية" : "Resume editor"}
        description={
          isArabic
            ? "استخدم التبويبات لتنظيم التحرير، وستظهر المعاينة بجانب النموذج على الشاشات الكبيرة."
            : "Use the guided sections to organize the resume. The preview appears beside the form on large screens."
        }
      />
      <ResumeForm resume={resume} onChange={setResume} />
    </div>
  );
}
