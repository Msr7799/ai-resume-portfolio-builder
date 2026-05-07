"use client";

import { useRouter } from "next/navigation";
import { TemplateGallery } from "@/components/templates/template-gallery";
import { TemplateCard } from "@/components/dashboard/template-card";
import { SectionHeader } from "@/components/ui/section-header";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useResume } from "@/hooks/use-resume";
import { useLanguage } from "@/components/layout/language-provider";
import { portfolioTemplateRegistry } from "@/templates/portfolio-template-registry";

export default function TemplatesPage() {
  const router = useRouter();
  const { resume, setResume } = useResume();
  const { portfolio, setPortfolio } = usePortfolio();
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  function selectPortfolioTemplate(templateId: string) {
    setPortfolio({ ...portfolio, templateId });
    router.push("/dashboard/portfolio");
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow={isArabic ? "القوالب" : "Templates"}
        title={isArabic ? "معرض قوالب السيرة والبورتفوليو" : "Resume & Portfolio Templates"}
        description={
          isArabic
            ? "اختر قالب سيرة أو بورتفوليو — سيتم نقلك مباشرة للمحرر."
            : "Pick a resume or portfolio template — you'll be taken straight to the editor."
        }
      />

      <section>
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          {isArabic ? "قوالب السيرة الذاتية" : "Resume Templates"}
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {isArabic
            ? "اختر قالب ثم عدّل المحتوى مباشرة في المحرر."
            : "Choose a template then edit content directly in the editor."}
        </p>
        <div className="mt-4">
          <TemplateGallery resume={resume} onSelect={setResume} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          {isArabic ? "قوالب البورتفوليو" : "Portfolio Templates"}
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {isArabic
            ? "اختر ثيم لصفحة البورتفوليو العامة — كل قالب يغيّر الألوان والتخطيط."
            : "Choose a theme for your public portfolio page — each template changes colors and layout."}
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {portfolioTemplateRegistry.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={portfolio.templateId === template.id}
              onSelect={() => selectPortfolioTemplate(template.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
