import type { CanvaTemplateField } from "@/types/template";

export type FieldGroup = {
  id: string;
  labelEn: string;
  labelAr: string;
  fields: CanvaTemplateField[];
};

/**
 * Groups template fields into semantic sections for a cleaner editing UI.
 * The grouping is based on field type, sourceKey, and label heuristics.
 */
export function groupTemplateFields(fields: CanvaTemplateField[]): FieldGroup[] {
  const groups: Record<string, CanvaTemplateField[]> = {
    identity: [],
    contact: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    links: [],
    other: [],
  };

  for (const field of fields) {
    const key = field.sourceKey;
    const type = field.type;
    const label = field.label.toLowerCase();

    if (type === "image" || key === "fullName" || key === "jobTitle" || label.includes("name") || label.includes("job title")) {
      groups.identity.push(field);
    } else if (type === "phone" || type === "email" || key === "phone" || key === "email" || key === "location" || key === "contactTitle" || label.includes("contact")) {
      groups.contact.push(field);
    } else if (key === "about" || label.includes("about") || label.includes("summary") || label.includes("profile") || label.includes("objective")) {
      groups.summary.push(field);
    } else if (type === "experience-list" || key === "workExperience" || key === "developerExperience" || label.includes("experience") || label.includes("work")) {
      groups.experience.push(field);
    } else if (type === "education-list" || key === "education" || label.includes("education") || label.includes("certificate") || key === "certificates") {
      groups.education.push(field);
    } else if (type === "list" || key === "skills" || key === "expertise" || key === "languages" || type === "language-list" || label.includes("skill") || label.includes("language") || label.includes("expertise")) {
      groups.skills.push(field);
    } else if (type === "link" || type === "qr" || key === "portfolioUrl" || key === "githubUrl" || key === "linkedinUrl" || key === "qr" || type === "project-list" || key === "deployments" || label.includes("url") || label.includes("link") || label.includes("portfolio") || label.includes("github") || label.includes("deploy")) {
      groups.links.push(field);
    } else {
      groups.other.push(field);
    }
  }

  const groupMeta: { id: string; labelEn: string; labelAr: string }[] = [
    { id: "identity", labelEn: "Personal Info", labelAr: "المعلومات الشخصية" },
    { id: "contact", labelEn: "Contact", labelAr: "التواصل" },
    { id: "summary", labelEn: "About / Summary", labelAr: "نبذة عني" },
    { id: "experience", labelEn: "Work Experience", labelAr: "الخبرات العملية" },
    { id: "education", labelEn: "Education & Certificates", labelAr: "التعليم والشهادات" },
    { id: "skills", labelEn: "Skills & Languages", labelAr: "المهارات واللغات" },
    { id: "links", labelEn: "Links & Projects", labelAr: "الروابط والمشاريع" },
    { id: "other", labelEn: "Other Fields", labelAr: "حقول أخرى" },
  ];

  return groupMeta
    .map((meta) => ({
      ...meta,
      fields: groups[meta.id] ?? [],
    }))
    .filter((group) => group.fields.length > 0);
}
