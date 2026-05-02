"use client";

import { DynamicTemplateForm } from "@/components/resume/dynamic-template-form";
import { ResumeForm } from "@/components/resume/resume-form";
import { SectionHeader } from "@/components/ui/section-header";
import { useResume } from "@/hooks/use-resume";
import { getCanvaResumeTemplate } from "@/templates/resume-template-registry";

export default function ResumeBuilderPage() {
  const { resume, setResume } = useResume();
  const canvaTemplate = getCanvaResumeTemplate(resume.templateId);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="المحرر"
        title={canvaTemplate ? "محرر سيرة قالب Canva" : "محرر السيرة الذاتية"}
        description={
          canvaTemplate
            ? "هذا النموذج يظهر فقط الحقول المطلوبة في قالب Canva المحدد."
            : "استخدم التبويبات لتنظيم التحرير، وستظهر المعاينة بجانب النموذج على الشاشات الكبيرة."
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
