import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";
import { CanvaResumePdf } from "@/lib/pdf/canva-resume-pdf";
import { CleanResumePdf } from "@/lib/pdf/clean-resume-pdf";
import { createQrDataUrl } from "@/lib/qr";
import { getTemplateData, stringifyTemplateValue } from "@/lib/template-data";
import { getCanvaResumeTemplate } from "@/templates/resume-template-registry";
import type { Resume } from "@/types";

export async function renderResumePdfBuffer(resume: Resume) {
  const canvaTemplate = getCanvaResumeTemplate(resume.templateId);
  if (canvaTemplate) {
    const data = getTemplateData(resume);
    const qrSource = stringifyTemplateValue(data.qr) || stringifyTemplateValue(data.portfolioUrl);
    const qrDataUrl = await createQrDataUrl(qrSource);
    const pdf = await renderToBuffer(
      <CanvaResumePdf template={canvaTemplate} resume={resume} qrDataUrl={qrDataUrl} />,
    );
    return { pdf, qrDataUrl };
  }

  const pdf = await renderToBuffer(<CleanResumePdf resume={resume} />);
  return { pdf, qrDataUrl: "" };
}
