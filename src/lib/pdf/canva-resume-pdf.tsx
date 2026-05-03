/* eslint-disable jsx-a11y/alt-text */

import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  getEffectiveFieldLabel,
  getEffectiveFieldHtml,
  getEffectiveFieldLayout,
  getEffectiveFieldLink,
  getEffectiveFieldStyle,
  getTemplateData,
  getTemplateValue,
  isListLikeField,
  htmlToPlainText,
  isTemplateFieldEnabled,
  linkHref,
  PROFILE_PLACEHOLDER,
  stringifyTemplateValue,
} from "@/lib/template-data";
import type { Resume } from "@/types";
import type {
  CanvaResumeTemplate,
  CanvaTemplateField,
  CanvaTemplateFieldLayout,
  CanvaTemplateValue,
} from "@/types/template";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

const styles = StyleSheet.create({
  page: {
    position: "relative",
    width: A4_WIDTH,
    height: A4_HEIGHT,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  background: {
    position: "absolute",
    left: 0,
    top: 0,
    width: A4_WIDTH,
    height: A4_HEIGHT,
  },
});

function imageSource(path: string) {
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

function firstUrl(value: string) {
  return value.match(/https?:\/\/[^\s)]+/)?.[0] ?? "";
}

function toLines(value: CanvaTemplateValue, bullets: boolean) {
  const lines = Array.isArray(value)
    ? value.flatMap((item) => item.split("\n"))
    : stringifyTemplateValue(value).split("\n");

  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (bullets && !line.startsWith("•") ? `• ${line}` : line));
}

function estimateWrappedLines(lines: string[], boxWidth: number, fontSize: number) {
  const avgCharWidth = Math.max(fontSize * 0.52, 3);
  const charsPerLine = Math.max(4, Math.floor(boxWidth / avgCharWidth));
  return lines.reduce((total, line) => total + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
}

function fitPdfFontSize({
  value,
  field,
  layout,
  baseFontSize,
  lineHeight,
  bullets,
}: {
  value: CanvaTemplateValue;
  field: CanvaTemplateField;
  layout: Required<CanvaTemplateFieldLayout>;
  baseFontSize: number;
  lineHeight: number;
  bullets: boolean;
}) {
  const boxWidth = Math.max((layout.width / 100) * A4_WIDTH, 20);
  const boxHeight = Math.max((layout.height / 100) * A4_HEIGHT, 20);
  const headingReserve = field.showLabel ? baseFontSize * 1.75 : 0;
  const availableHeight = Math.max(boxHeight - headingReserve, 12);
  const lines = toLines(value, bullets || isListLikeField(field));
  if (!lines.length) return baseFontSize;

  let fontSize = baseFontSize;
  while (fontSize > 4.2) {
    const visualLines = estimateWrappedLines(lines, boxWidth, fontSize);
    if (visualLines * fontSize * lineHeight <= availableHeight) return fontSize;
    fontSize -= 0.3;
  }
  return Math.max(4.2, fontSize);
}

function absoluteFieldStyle(resume: Resume, field: CanvaTemplateField, value: CanvaTemplateValue) {
  const styleState = getEffectiveFieldStyle(resume, field);
  const layout = getEffectiveFieldLayout(resume, field);
  const fontSize = styleState.autoFit
    ? fitPdfFontSize({
        value,
        field,
        layout,
        baseFontSize: styleState.fontSize,
        lineHeight: styleState.lineHeight,
        bullets: styleState.bullets,
      })
    : styleState.fontSize;

  return {
    position: "absolute" as const,
    left: (layout.x / 100) * A4_WIDTH,
    top: (layout.y / 100) * A4_HEIGHT,
    width: (layout.width / 100) * A4_WIDTH,
    height: (layout.height / 100) * A4_HEIGHT,
    fontSize,
    color: styleState.color,
    textAlign: styleState.align,
    fontWeight: styleState.bold ? 700 : 400,
    fontStyle: styleState.italic ? "italic" : "normal",
    textDecoration: `${styleState.underline ? "underline" : ""} ${styleState.strike ? "line-through" : ""}`.trim() || "none",
    fontFamily: styleState.fontFamily === "Times New Roman" ? "Times-Roman" : "Helvetica",
    lineHeight: styleState.lineHeight,
    textTransform: styleState.textTransform,
    overflow: "hidden" as const,
    zIndex: layout.zIndex,
  };
}

function renderTextValue(value: CanvaTemplateValue, field: CanvaTemplateField, bullets: boolean) {
  const lines = toLines(value, bullets || isListLikeField(field));
  if (lines.length === 0) return null;

  return lines.map((item) => {
    const url = firstUrl(item);
    if (url || field.linkType) {
      return (
        <Link key={item} src={url || linkHref(field, item)}>
          {item}
        </Link>
      );
    }
    return <Text key={item}>{item}</Text>;
  });
}

function renderFieldContent(resume: Resume, field: CanvaTemplateField, value: CanvaTemplateValue) {
  const styleState = getEffectiveFieldStyle(resume, field);
  const content = renderTextValue(value, field, styleState.bullets);

  if (!field.showLabel) return content;

  return (
    <View style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <Text
        style={{
          alignSelf: "flex-start",
          marginBottom: 3,
          paddingHorizontal: 7,
          paddingVertical: 2,
          borderRadius: 4,
          backgroundColor: "#e5e7eb",
          color: "#374151",
          fontSize: Math.max(5, styleState.fontSize + 1.3),
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        {getEffectiveFieldLabel(resume, field)}
      </Text>
      <View style={{ flexGrow: 1, overflow: "hidden" }}>{content}</View>
    </View>
  );
}

export function CanvaResumePdf({
  template,
  resume,
  qrDataUrl,
}: {
  template: CanvaResumeTemplate;
  resume: Resume;
  qrDataUrl: string;
}) {
  const data = getTemplateData(resume);
  const qrSource =
    stringifyTemplateValue(data.qr) || stringifyTemplateValue(data.portfolioUrl) || "";

  return (
    <Document title={`${resume.personalInfo.fullName || "Resume"} - ${template.name}`}>
      <Page size="A4" style={styles.page}>
        <Image src={imageSource(template.backgroundImage)} style={styles.background} />

        {[...template.fields]
          .filter((field) => isTemplateFieldEnabled(resume, field))
          .sort((a, b) => getEffectiveFieldLayout(resume, a).zIndex - getEffectiveFieldLayout(resume, b).zIndex)
          .map((field) => {
          const rawValue = getTemplateValue(data, field.sourceKey);
          const richPlainText = htmlToPlainText(getEffectiveFieldHtml(resume, field, rawValue));
          const value = richPlainText ? richPlainText : rawValue;
          const style = absoluteFieldStyle(resume, field, value);

          if (field.type === "image") {
            const src = stringifyTemplateValue(value) || field.placeholderImage || PROFILE_PLACEHOLDER;
            return <Image key={field.id} src={imageSource(src)} style={style} />;
          }

          if (field.type === "qr") {
            if (!qrDataUrl) return null;
            const href = getEffectiveFieldLink(resume, field, qrSource) || linkHref(field, qrSource);
            return (
              <Link key={field.id} src={href} style={style}>
                <Image src={qrDataUrl} style={{ width: "100%", height: "100%" }} />
              </Link>
            );
          }

          const rawText = stringifyTemplateValue(value);
          const href = getEffectiveFieldLink(resume, field, rawText);

          if (href) {
            return (
              <Link key={field.id} src={href} style={style}>
                {rawText}
              </Link>
            );
          }

          return (
            <View key={field.id} style={style}>
              {renderFieldContent(resume, field, value)}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
