import type { Resume } from "@/types";
import type {
  CanvaTemplateData,
  CanvaTemplateField,
  CanvaTemplateFieldSourceKey,
  CanvaTemplateValue,
} from "@/types/template";

export function defaultTemplateDataFromResume(resume: Resume): CanvaTemplateData {
  return {
    profileImage: "",
    fullName: resume.personalInfo.fullName,
    jobTitle: resume.personalInfo.jobTitle,
    phone: resume.personalInfo.phone,
    email: resume.personalInfo.email,
    location: resume.personalInfo.location,
    about: resume.personalInfo.summary,
    workExperience: resume.experience.map(
      (item) => `${item.company} - ${item.role}: ${item.bullets.join(" ")}`,
    ),
    developerExperience: resume.experience
      .flatMap((item) => item.technologies)
      .filter(Boolean)
      .join(", "),
    education: resume.education.map(
      (item) => `${item.school} - ${item.degree} in ${item.field}, ${item.startDate}-${item.endDate}`,
    ),
    expertise: resume.skills.slice(0, 4).map((skill) => skill.category),
    skills: resume.skills.map((skill) => skill.name),
    languages: resume.languages.map((item) => `${item.language} - ${item.proficiency}`),
    deployments: resume.projects.map((project) => `${project.name} - ${project.description}`),
    portfolioUrl: resume.personalInfo.website,
    githubUrl: resume.personalInfo.github,
    linkedinUrl: resume.personalInfo.linkedin,
    qr: resume.personalInfo.website,
  };
}

export function getTemplateData(resume: Resume): CanvaTemplateData {
  return {
    ...defaultTemplateDataFromResume(resume),
    ...(resume.templateData ?? {}),
  };
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
