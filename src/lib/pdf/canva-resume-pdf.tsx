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
  getTemplateData,
  getTemplateValue,
  linkHref,
  stringifyTemplateValue,
} from "@/lib/template-data";
import type { Resume } from "@/types";
import type { CanvaResumeTemplate, CanvaTemplateField, CanvaTemplateValue } from "@/types/template";

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

function absoluteFieldStyle(field: CanvaTemplateField) {
  return {
    position: "absolute" as const,
    left: (field.x / 100) * A4_WIDTH,
    top: (field.y / 100) * A4_HEIGHT,
    width: (field.width / 100) * A4_WIDTH,
    height: (field.height / 100) * A4_HEIGHT,
    fontSize: field.fontSize,
    color: field.color,
    textAlign: field.align ?? "left",
    fontWeight: field.fontWeight === "bold" ? 700 : field.fontWeight === "semibold" ? 600 : 400,
    lineHeight: 1.16,
  };
}

function imageSource(path: string) {
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

function firstUrl(value: string) {
  return value.match(/https?:\/\/[^\s)]+/)?.[0] ?? "";
}

function renderTextValue(value: CanvaTemplateValue, field: CanvaTemplateField) {
  if (Array.isArray(value)) {
    return value.map((item) => {
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

  return stringifyTemplateValue(value);
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

        {template.fields.map((field) => {
          const value = getTemplateValue(data, field.sourceKey);
          const style = absoluteFieldStyle(field);

          if (field.type === "image") {
            const src = stringifyTemplateValue(value);
            return src ? <Image key={field.id} src={src} style={style} /> : null;
          }

          if (field.type === "qr") {
            if (!qrDataUrl) return null;
            const href = linkHref(field, qrSource);
            return (
              <Link key={field.id} src={href} style={style}>
                <Image src={qrDataUrl} style={{ width: "100%", height: "100%" }} />
              </Link>
            );
          }

          const rawText = stringifyTemplateValue(value);
          const href = field.linkType ? linkHref(field, rawText) : "";

          if (href) {
            return (
              <Link key={field.id} src={href} style={style}>
                {rawText}
              </Link>
            );
          }

          return (
            <View key={field.id} style={style}>
              {renderTextValue(value, field)}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
