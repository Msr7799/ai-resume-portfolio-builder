import type { CanvaResumeTemplate } from "@/types/template";
import type { CanvaTemplateData } from "@/types/template";

import template_1 from "@/templates/data/template-1.json";
import template_2 from "@/templates/data/template-2.json";
import template_4 from "@/templates/data/template-4.json";
import template_5 from "@/templates/data/template-5.json";
import template_6 from "@/templates/data/template-6.json";
import template_7 from "@/templates/data/template-7.json";
import template_8 from "@/templates/data/template-8.json";
import template_9 from "@/templates/data/template-9.json";
import template_10 from "@/templates/data/template-10.json";
import template_11 from "@/templates/data/template-11.json";
import template_12 from "@/templates/data/template-12.json";
import template_13 from "@/templates/data/template-13.json";
import template_14 from "@/templates/data/template-14.json";
import template_15 from "@/templates/data/template-15.json";
import template_16 from "@/templates/data/template-16.json";

type TemplateJsonData = {
  template: CanvaResumeTemplate;
  seedData: CanvaTemplateData;
};

const allTemplateData: TemplateJsonData[] = [
  template_1 as TemplateJsonData,
  template_2 as TemplateJsonData,
  template_4 as TemplateJsonData,
  template_5 as TemplateJsonData,
  template_6 as TemplateJsonData,
  template_7 as TemplateJsonData,
  template_8 as TemplateJsonData,
  template_9 as TemplateJsonData,
  template_10 as TemplateJsonData,
  template_11 as TemplateJsonData,
  template_12 as TemplateJsonData,
  template_13 as TemplateJsonData,
  template_14 as TemplateJsonData,
  template_15 as TemplateJsonData,
  template_16 as TemplateJsonData,
];

export const htmlGeneratedTemplates: CanvaResumeTemplate[] = allTemplateData.map(
  (d) => d.template,
);

const seedDataMap: Record<string, CanvaTemplateData> = {};
for (const d of allTemplateData) {
  seedDataMap[d.template.id] = d.seedData;
}

export function getHtmlTemplateSeedData(templateId?: string): CanvaTemplateData {
  if (!templateId) return {};
  return seedDataMap[templateId] ?? {};
}
