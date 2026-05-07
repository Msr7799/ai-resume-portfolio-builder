"use client";

import { Printer } from "lucide-react";
import { DownloadTemplatePdfButton } from "@/components/resume/download-template-pdf-button";
import { ResumePreview } from "@/components/resume/resume-preview";
import { TemplateLivePreview } from "@/components/resume/template-live-preview";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { useResume } from "@/hooks/use-resume";
import { getCanvaResumeTemplate } from "@/templates/resume-template-registry";

export default function ResumePreviewPage() {
  const { resume } = useResume();
  const canvaTemplate = getCanvaResumeTemplate(resume.templateId);

  return (
    <div className="space-y-6">
      <div className="no-print">
        <SectionHeader
          eyebrow="المعاينة"
          title={canvaTemplate ? "معاينة قالب Canva" : "سيرة جاهزة للطباعة"}
          description={
            canvaTemplate
              ? "حمّل PDF تكون فيه صورة Canva خلفية فقط، بينما النصوص والروابط والصورة الشخصية وQR عناصر حقيقية داخل الملف."
              : "استخدم نافذة الطباعة في المتصفح واحفظ الملف كـ PDF. ستخفي أنماط الطباعة عناصر التطبيق."
          }
          action={
            canvaTemplate ? (
              <DownloadTemplatePdfButton template={canvaTemplate} resume={resume} />
            ) : (
              <Button onClick={() => window.print()}>
                <Printer className="size-4" />
                تحميل / طباعة PDF
              </Button>
            )
          }
        />
      </div>
      {canvaTemplate ? (
        <TemplateLivePreview template={canvaTemplate} resume={resume} />
      ) : (
        <ResumePreview resume={resume} />
      )}
    </div>
  );
}
