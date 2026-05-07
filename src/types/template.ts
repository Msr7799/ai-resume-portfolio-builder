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

// Custom Canva templates often need extra fields that do not map 1:1 to the
// standard resume model. Keep this as string so each template can define its
// own editable fields without changing TypeScript every time.
export type CanvaTemplateFieldSourceKey = string;

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
  fontFamily?: string;
  color: string;
  align?: "left" | "center" | "right" | "justify";
  maxChars?: number;
  maxLines?: number;
  aiMode?: AIImproveIntent | "fit-template-space";
  sourceKey: CanvaTemplateFieldSourceKey;
  linkType?: CanvaTemplateLinkType;

  // When true, the resume renders an editable section heading above the field
  // content. The user can rename or hide the whole section from the editor.
  showLabel?: boolean;
  defaultEnabled?: boolean;
  placeholderImage?: string;
  // True when the placeholder/profile frame is already baked into the clean HTML background.
  // In that case the editor uses the field only as an upload/selection target and does not draw the placeholder twice.
  placeholderEmbedded?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  zIndex?: number;
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
  /** True when this template has baked text in the background or too few editable fields.
   *  The UI should display a warning and may disable certain features. */
  needsCleanup?: boolean;
  /** Human-readable warning about known limitations of this template. */
  qualityWarning?: string;
};

export type CanvaTemplateValue = string | string[];

export type CanvaTemplateData = Partial<Record<CanvaTemplateFieldSourceKey, CanvaTemplateValue>>;

export type CanvaTemplateFieldStyle = {
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  bullets?: boolean;
  autoFit?: boolean;
  lineHeight?: number;
  fontFamily?: string;
  strike?: boolean;
  align?: "left" | "center" | "right" | "justify";
  textTransform?: "none" | "uppercase" | "lowercase";
  textDirection?: "ltr" | "rtl";
};

export type CanvaTemplateImageSettings = {
  borderRadius?: number;
  objectPositionX?: number;
  objectPositionY?: number;
  scale?: number;
};

export type CanvaTemplateFieldLayout = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
};

export type CanvaTemplateFieldState = {
  enabled?: boolean;
  label?: string;
  style?: CanvaTemplateFieldStyle;
  layout?: CanvaTemplateFieldLayout;
  groupId?: string;
  linkOverride?: string;
  locked?: boolean;
  richTextHtml?: string;
  image?: CanvaTemplateImageSettings;
};

export type CanvaTemplateFieldStates = Record<string, CanvaTemplateFieldState>;

export type CanvaTemplateValidationIssue = {
  fieldId: string;
  label: string;
  message: string;
};
