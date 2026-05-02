"use client";

import { TemplateGallery } from "@/components/templates/template-gallery";
import { TemplateCard } from "@/components/dashboard/template-card";
import { SectionHeader } from "@/components/ui/section-header";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useResume } from "@/hooks/use-resume";
import { portfolioTemplates } from "@/lib/mock-data";

export default function TemplatesPage() {
  const { resume, setResume } = useResume();
  const { portfolio, setPortfolio } = usePortfolio();

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="القوالب"
        title="معرض قوالب السيرة من Canva"
        description="اختر صورة قالب PNG من Canva، ثم املأ فقط الحقول التي يستخدمها هذا التصميم."
      />

      <section>
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">قوالب CV من Canva</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          يحافظ التطبيق على تصميم Canva كخلفية، ثم يضع فوقه نصوصًا وروابط وصورًا وQR حقيقية
          عند تصدير PDF.
        </p>
        <div className="mt-4">
          <TemplateGallery resume={resume} onSelect={setResume} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">قوالب البورتفوليو</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {portfolioTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={portfolio.templateId === template.id}
              onSelect={() => setPortfolio({ ...portfolio, templateId: template.id })}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
