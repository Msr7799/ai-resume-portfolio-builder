import type { Resume } from "@/types";
import { getHtmlTemplateSeedData } from "@/templates/generated-html-templates";
import type {
  CanvaTemplateData,
  CanvaTemplateField,
  CanvaTemplateFieldSourceKey,
  CanvaTemplateFieldLayout,
  CanvaTemplateImageSettings,
  CanvaTemplateFieldState,
  CanvaTemplateFieldStyle,
  CanvaTemplateValue,
} from "@/types/template";

export const PROFILE_PLACEHOLDER = "/placeholder-fram-bg.png";

export function defaultTemplateDataFromResume(resume: Resume): CanvaTemplateData {
  return {
    profileImage: resume.templateId.startsWith("template-") ? "" : PROFILE_PLACEHOLDER,
    fullName: resume.personalInfo.fullName,
    jobTitle: resume.personalInfo.jobTitle,
    phone: resume.personalInfo.phone,
    email: resume.personalInfo.email,
    location: resume.personalInfo.location,
    contactTitle: "CONTACT ME",
    about: resume.personalInfo.summary,
    workExperience: resume.experience.map(
      (item) => `${item.company} - ${item.role}: ${item.bullets.join(" ")}`,
    ),
    developerExperience: resume.experience
      .flatMap((item) => item.technologies)
      .filter(Boolean)
      .join(", "),
    education: resume.education.map(
      (item) => `${item.startDate} - ${item.endDate}\n${item.degree} in ${item.field} - ${item.school}${item.description ? `\n${item.description}` : ""}`,
    ),
    expertise:
      resume.templateData?.expertise ??
      "A balanced skill set across technology and leadership. Technically, I specialize in full-stack development, automation, Git version control, cloud deployment, and database design.",
    skills: resume.skills.map((skill) => skill.name),
    certificates: resume.certificates.map((item) => `${item.name}${item.issuer ? ` - ${item.issuer}` : ""}${item.date ? ` (${item.date})` : ""}`),
    awards: resume.templateData?.awards ?? ["Outstanding project delivery", "Strong teamwork and leadership"],
    references: resume.templateData?.references ?? ["Available upon request"],
    languages: resume.languages.map((item) => `${item.language} - ${item.proficiency}`),
    deployments: resume.projects.map((project) => {
      const url = project.liveUrl || project.githubUrl;
      return `${project.name} - ${project.description}${url ? `\n${url}` : ""}`;
    }),
    portfolioUrl: resume.personalInfo.website,
    githubUrl: resume.personalInfo.github,
    linkedinUrl: resume.personalInfo.linkedin,
    qr: resume.personalInfo.website,
  };
}

export function getTemplateData(resume: Resume): CanvaTemplateData {
  const merged = {
    ...defaultTemplateDataFromResume(resume),
    ...getHtmlTemplateSeedData(resume.templateId),
    ...(resume.templateData ?? {}),
  };

  // HTML-derived templates already contain the original placeholder frame in their clean background.
  // Keep the image value empty until the user uploads a real photo, otherwise the placeholder is drawn twice.
  if (
    resume.templateId.startsWith("template-") &&
    (!resume.templateData?.profileImage || resume.templateData.profileImage === PROFILE_PLACEHOLDER)
  ) {
    merged.profileImage = "";
  }

  return merged;
}

export function getTemplateValue(data: CanvaTemplateData, key: CanvaTemplateFieldSourceKey) {
  const value = data[key];
  if (Array.isArray(value)) return value;
  return value ?? "";
}

export function setTemplateValue(
  resume: Resume,
  key: CanvaTemplateFieldSourceKey,
  value: CanvaTemplateValue,
) {
  return {
    ...resume,
    templateData: {
      ...getTemplateData(resume),
      [key]: value,
    },
  };
}

export function stringifyTemplateValue(value: CanvaTemplateValue | undefined) {
  if (Array.isArray(value)) return value.join("\n");
  return value ?? "";
}

export function splitTemplateList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function linkHref(field: CanvaTemplateField, rawValue: string) {
  const value = rawValue.trim();
  if (!value) return "";

  if (field.linkType === "email" || field.type === "email") {
    return value.startsWith("mailto:") ? value : `mailto:${value}`;
  }

  if (field.linkType === "phone" || field.type === "phone") {
    return value.startsWith("tel:") ? value : `tel:${value.replace(/\s+/g, "")}`;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

export function exceedsLines(value: string, maxLines?: number) {
  if (!maxLines) return false;
  return value.split("\n").length > maxLines;
}

export function getTemplateFieldState(resume: Resume, field: CanvaTemplateField): CanvaTemplateFieldState {
  const stored = resume.templateFieldStates?.[field.id] ?? {};
  return {
    enabled: stored.enabled ?? field.defaultEnabled ?? true,
    label: stored.label ?? field.label,
    style: stored.style ?? {},
    layout: stored.layout ?? {},
    groupId: stored.groupId,
    linkOverride: stored.linkOverride,
    locked: stored.locked ?? false,
    richTextHtml: stored.richTextHtml,
    image: stored.image ?? {},
  };
}

export function isTemplateFieldEnabled(resume: Resume, field: CanvaTemplateField) {
  return getTemplateFieldState(resume, field).enabled !== false;
}

export function getEffectiveFieldLabel(resume: Resume, field: CanvaTemplateField) {
  return getTemplateFieldState(resume, field).label ?? field.label;
}

export function getEffectiveFieldStyle(resume: Resume, field: CanvaTemplateField): Required<CanvaTemplateFieldStyle> {
  const stateStyle = getTemplateFieldState(resume, field).style ?? {};
  return {
    fontSize: stateStyle.fontSize ?? field.fontSize,
    color: stateStyle.color ?? field.color,
    bold: stateStyle.bold ?? (field.fontWeight === "bold" || field.fontWeight === "semibold"),
    italic: stateStyle.italic ?? false,
    underline: stateStyle.underline ?? Boolean(field.linkType),
    bullets: stateStyle.bullets ?? isListLikeField(field),
    autoFit: stateStyle.autoFit ?? true,
    lineHeight: stateStyle.lineHeight ?? 1.14,
    fontFamily: stateStyle.fontFamily ?? field.fontFamily ?? "Open Sans",
    strike: stateStyle.strike ?? false,
    align: stateStyle.align ?? field.align ?? "left",
    textTransform: stateStyle.textTransform ?? "none",
    textDirection: stateStyle.textDirection ?? "ltr",
  };
}

export function getEffectiveFieldLayout(resume: Resume, field: CanvaTemplateField): Required<CanvaTemplateFieldLayout> {
  const layout = getTemplateFieldState(resume, field).layout ?? {};
  return {
    x: layout.x ?? field.x,
    y: layout.y ?? field.y,
    width: layout.width ?? field.width,
    height: layout.height ?? field.height,
    zIndex: layout.zIndex ?? field.zIndex ?? 1,
  };
}

export function getEffectiveFieldImageSettings(resume: Resume, field: CanvaTemplateField): Required<CanvaTemplateImageSettings> {
  const image = getTemplateFieldState(resume, field).image ?? {};
  return {
    borderRadius: image.borderRadius ?? field.borderRadius ?? 0,
    objectPositionX: image.objectPositionX ?? 50,
    objectPositionY: image.objectPositionY ?? 50,
    scale: image.scale ?? 1,
  };
}

export function setTemplateFieldState(
  resume: Resume,
  fieldId: string,
  patch: CanvaTemplateFieldState,
) {
  const currentState = resume.templateFieldStates?.[fieldId] ?? {};
  const shouldClearRichText = Boolean(patch.style) && !("richTextHtml" in patch);

  return {
    ...resume,
    templateFieldStates: {
      ...(resume.templateFieldStates ?? {}),
      [fieldId]: {
        ...currentState,
        ...patch,
        richTextHtml: shouldClearRichText ? undefined : patch.richTextHtml ?? currentState.richTextHtml,
        style: {
          ...(currentState.style ?? {}),
          ...(patch.style ?? {}),
        },
        layout: {
          ...(currentState.layout ?? {}),
          ...(patch.layout ?? {}),
        },
        image: {
          ...(currentState.image ?? {}),
          ...(patch.image ?? {}),
        },
      },
    },
  };
}

export function resetTemplateFieldState(resume: Resume, fieldId: string) {
  const nextStates = { ...(resume.templateFieldStates ?? {}) };
  delete nextStates[fieldId];
  return {
    ...resume,
    templateFieldStates: nextStates,
  };
}

export function getEffectiveFieldLink(resume: Resume, field: CanvaTemplateField, rawValue: string) {
  const override = getTemplateFieldState(resume, field).linkOverride?.trim();
  if (override) return linkHref({ ...field, linkType: field.linkType ?? "custom" }, override);
  return field.linkType ? linkHref(field, rawValue) : "";
}


export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function plainTextToHtml(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

export function sanitizeRichHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

export function htmlToPlainText(value: string) {
  return sanitizeRichHtml(value)
    .replace(/<br\s*\/?>(\s*)/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function getEffectiveFieldHtml(resume: Resume, field: CanvaTemplateField, value: CanvaTemplateValue) {
  const rich = getTemplateFieldState(resume, field).richTextHtml;
  if (rich) return sanitizeRichHtml(rich);
  return plainTextToHtml(stringifyTemplateValue(value));
}

export function clearTemplateFieldValue(resume: Resume, field: CanvaTemplateField) {
  if (field.type === "image") {
    return setTemplateValue(resume, field.sourceKey, field.placeholderImage ?? PROFILE_PLACEHOLDER);
  }
  if (field.type === "qr") {
    return setTemplateValue(resume, field.sourceKey, "");
  }
  if (isListLikeField(field)) {
    return setTemplateValue(resume, field.sourceKey, []);
  }
  return setTemplateValue(resume, field.sourceKey, "");
}

export function isListLikeField(field: CanvaTemplateField) {
  return ["list", "experience-list", "education-list", "project-list", "language-list"].includes(
    field.type,
  );
}
