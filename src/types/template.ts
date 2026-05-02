import type { AIImproveIntent } from "@/types";

export type CanvaTemplatePageSize = "A4";

export type CanvaTemplateCoordinateSystem = {
  unit: "percent";
  width: 100;
  height: 100;
};

export type CanvaTemplateFieldType =
  | "text"
  | "textarea"
  | "image"
  | "list"
  | "experience-list"
  | "education-list"
  | "project-list"
  | "language-list"
  | "email"
  | "phone"
  | "link"
  | "qr";

export type CanvaTemplateLinkType =
  | "email"
  | "phone"
  | "portfolio"
  | "github"
  | "linkedin"
  | "project"
  | "custom";

export type CanvaTemplateFieldSourceKey =
  | "profileImage"
  | "fullName"
  | "jobTitle"
  | "phone"
  | "email"
  | "location"
  | "about"
  | "workExperience"
  | "developerExperience"
  | "education"
  | "expertise"
  | "skills"
  | "languages"
  | "deployments"
  | "portfolioUrl"
  | "githubUrl"
  | "linkedinUrl"
  | "qr";

export type CanvaTemplateField = {
  id: string;
  label: string;
  type: CanvaTemplateFieldType;
  required: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  color: string;
  align?: "left" | "center" | "right" | "justify";
  maxChars?: number;
  maxLines?: number;
  aiMode?: AIImproveIntent | "fit-template-space";
  sourceKey: CanvaTemplateFieldSourceKey;
  linkType?: CanvaTemplateLinkType;
};

export type CanvaResumeTemplate = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  backgroundImage: string;
  pageSize: CanvaTemplatePageSize;
  coordinateSystem: CanvaTemplateCoordinateSystem;
  fields: CanvaTemplateField[];
};

export type CanvaTemplateValue = string | string[];

export type CanvaTemplateData = Partial<
  Record<CanvaTemplateFieldSourceKey, CanvaTemplateValue>
>;

export type CanvaTemplateValidationIssue = {
  fieldId: string;
  label: string;
  message: string;
};
