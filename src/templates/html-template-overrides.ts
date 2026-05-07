import type { CanvaResumeTemplate, CanvaTemplateField } from "@/types/template";

const imageFieldOverrides: Record<string, Record<string, Partial<CanvaTemplateField>>> = {
  "template-1": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-2": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-3": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-4": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-5": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-6": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-7": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-8": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-9": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-10": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-11": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-12": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-13": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-14": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-15": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
  "template-16": { profileImage: { placeholderImage: "/placeholder-fram-bg.png", borderRadius: 0, placeholderEmbedded: true } },
};

export function getHtmlTemplateDefaultProfileImage(templateId?: string) {
  if (!templateId) return undefined;
  return imageFieldOverrides[templateId]?.profileImage?.placeholderImage;
}

export function applyHtmlTemplateOverrides(template: CanvaResumeTemplate): CanvaResumeTemplate {
  const templateNumber = template.id.replace("template-", "");
  const fieldOverrides = imageFieldOverrides[template.id] ?? {};

  return {
    ...template,
    backgroundImage: `/templates/html-bg-${templateNumber}.png`,
    fields: template.fields.map((field) => {
      const override = fieldOverrides[field.id];
      return override ? { ...field, ...override } : field;
    }),
  };
}
