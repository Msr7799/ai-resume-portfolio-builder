import type { CanvaTemplateField, CanvaTemplateImageSettings } from "@/types/template";

export function isTemplatePlaceholderImage(field: CanvaTemplateField, src?: string) {
  return Boolean(field.placeholderImage && src && src === field.placeholderImage);
}

export function isPlaceholderEmbedded(field: CanvaTemplateField) {
  return Boolean(field.placeholderEmbedded);
}

export function shouldRenderTemplateImageOverlay(field: CanvaTemplateField, value?: string) {
  if (!value) return true;
  return Boolean(value || !isPlaceholderEmbedded(field));
}

export function getTemplateImageBorderRadiusCss(field: CanvaTemplateField, image?: CanvaTemplateImageSettings) {
  const borderRadius = image?.borderRadius ?? field.borderRadius ?? 0;
  return `${Math.max(0, borderRadius)}%`;
}

export function getTemplateImageBorderRadiusPdf(field: CanvaTemplateField, image?: CanvaTemplateImageSettings) {
  const borderRadius = image?.borderRadius ?? field.borderRadius ?? 0;
  return borderRadius <= 0 ? 0 : borderRadius * 0.5;
}

export function getTemplateImageObjectStyle(image: Required<CanvaTemplateImageSettings>) {
  const scale = Math.max(1, image.scale);
  return {
    width: `${scale * 100}%`,
    height: `${scale * 100}%`,
    left: `${image.objectPositionX}%`,
    top: `${image.objectPositionY}%`,
    transform: `translate(-${image.objectPositionX}%, -${image.objectPositionY}%)`,
    objectPosition: `${image.objectPositionX}% ${image.objectPositionY}%`,
  };
}
