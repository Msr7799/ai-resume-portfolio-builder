"use client";

import { ExternalLink } from "lucide-react";
import { PortfolioPreview } from "@/components/portfolio/portfolio-preview";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useResume } from "@/hooks/use-resume";

export default function PortfolioPreviewPage() {
  const { portfolio } = usePortfolio();
  const { resume } = useResume();

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="المعاينة"
        title="معاينة البورتفوليو"
        description="هكذا ستظهر صفحتك العامة قبل النشر أو المشاركة."
        action={
          <Button href={`/u/${portfolio.username}`} variant="secondary">
            <ExternalLink className="size-4" />
            الصفحة العامة
          </Button>
        }
      />
      <PortfolioPreview portfolio={portfolio} resume={resume} />
    </div>
  );
}
