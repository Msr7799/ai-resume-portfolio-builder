"use client";

import { PortfolioForm } from "@/components/portfolio/portfolio-form";
import { SectionHeader } from "@/components/ui/section-header";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useResume } from "@/hooks/use-resume";

export default function PortfolioBuilderPage() {
  const { portfolio, setPortfolio } = usePortfolio();
  const { resume } = useResume();

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="المحرر"
        title="محرر البورتفوليو"
        description="أنشئ صفحة عامة من بيانات السيرة ومشاريعك المميزة."
      />
      <PortfolioForm portfolio={portfolio} resume={resume} onChange={setPortfolio} />
    </div>
  );
}
