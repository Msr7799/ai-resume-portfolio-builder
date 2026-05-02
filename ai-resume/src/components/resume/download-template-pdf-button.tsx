"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CanvaResumePdf } from "@/lib/pdf/canva-resume-pdf";
import { useLanguage } from "@/components/layout/language-provider";
import { Button } from "@/components/ui/button";
import { createQrDataUrl } from "@/lib/qr";
import { getTemplateData, stringifyTemplateValue } from "@/lib/template-data";
import type { Resume } from "@/types";
import type { CanvaResumeTemplate } from "@/types/template";

export function DownloadTemplatePdfButton({
  template,
  resume,
}: {
  template: CanvaResumeTemplate;
  resume: Resume;
}) {
  const data = useMemo(() => getTemplateData(resume), [resume]);
  const qrSource = stringifyTemplateValue(data.qr) || stringifyTemplateValue(data.portfolioUrl);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  useEffect(() => {
    let active = true;
    void createQrDataUrl(qrSource).then((url) => {
      if (active) setQrDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, [qrSource]);

  if (!qrDataUrl) {
    return (
      <Button disabled>
        <Download className="size-4" />
        {isArabic ? "تجهيز PDF" : "Preparing PDF"}
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<CanvaResumePdf template={template} resume={resume} qrDataUrl={qrDataUrl} />}
      fileName={`${resume.personalInfo.fullName || "resume"}-${template.id}.pdf`}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
    >
      {({ loading }) => (
        <>
          <Download className="size-4" />
          {loading
            ? isArabic
              ? "تجهيز PDF"
              : "Preparing PDF"
            : isArabic
              ? "تحميل PDF"
              : "Download PDF"}
        </>
      )}
    </PDFDownloadLink>
  );
}
