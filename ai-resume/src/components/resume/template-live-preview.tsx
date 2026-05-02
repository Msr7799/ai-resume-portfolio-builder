"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { Badge } from "@/components/ui/badge";
import { createQrDataUrl } from "@/lib/qr";
import {
  exceedsLines,
  getTemplateData,
  getTemplateValue,
  linkHref,
  stringifyTemplateValue,
} from "@/lib/template-data";
import type { Resume } from "@/types";
import type { CanvaResumeTemplate, CanvaTemplateField } from "@/types/template";

function fieldText(resume: Resume, field: CanvaTemplateField) {
  return stringifyTemplateValue(getTemplateValue(getTemplateData(resume), field.sourceKey));
}

export function TemplateLivePreview({
  template,
  resume,
}: {
  template: CanvaResumeTemplate;
  resume: Resume;
}) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const data = useMemo(() => getTemplateData(resume), [resume]);
  const qrSource = stringifyTemplateValue(data.qr) || stringifyTemplateValue(data.portfolioUrl);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    let active = true;
    void createQrDataUrl(qrSource).then((url) => {
      if (active) setQrDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, [qrSource]);

  const warnings = template.fields.flatMap((field) => {
    const value = fieldText(resume, field);
    const fieldWarnings: string[] = [];
    if (field.required && !value.trim()) {
      fieldWarnings.push(
        isArabic ? `الحقل ${field.label} مطلوب` : `${field.label} is required`,
      );
    }
    if (field.maxChars && value.length > field.maxChars) {
      fieldWarnings.push(
        isArabic
          ? `الحقل ${field.label} تجاوز ${field.maxChars} حرف`
          : `${field.label} exceeds ${field.maxChars} chars`,
      );
    }
    if (exceedsLines(value, field.maxLines)) {
      fieldWarnings.push(
        isArabic
          ? `الحقل ${field.label} تجاوز ${field.maxLines} أسطر`
          : `${field.label} exceeds ${field.maxLines} lines`,
      );
    }
    return fieldWarnings;
  });

  return (
    <div className="space-y-3">
      {warnings.length ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-200">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="size-4" />
            {isArabic ? "تنبيهات القالب" : "Template warnings"}
          </div>
          <ul className="mt-2 list-disc ps-5">
            {warnings.slice(0, 5).map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : (
        <Badge>
          {isArabic
            ? "كل الحقول المطلوبة في القالب جاهزة"
            : "All required template fields look ready"}
        </Badge>
      )}

      <div className="relative mx-auto aspect-[210/297] w-full max-w-[720px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-white/10">
        <Image
          src={template.backgroundImage}
          alt={template.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 720px"
          priority
        />
        {template.fields.map((field) => {
          const value = getTemplateValue(data, field.sourceKey);
          const style = {
            left: `${field.x}%`,
            top: `${field.y}%`,
            width: `${field.width}%`,
            height: `${field.height}%`,
            fontSize: `clamp(7px, ${field.fontSize * 0.115}vw, ${field.fontSize * 1.65}px)`,
            color: field.color,
            textAlign: field.align ?? "left",
            fontWeight: field.fontWeight === "bold" ? 700 : field.fontWeight === "semibold" ? 600 : 400,
          } as const;

          if (field.type === "image") {
            const src = stringifyTemplateValue(value);
            return src ? (
              <img
                key={field.id}
                src={src}
                alt={field.label}
                className="absolute rounded-full object-cover"
                style={style}
              />
            ) : null;
          }

          if (field.type === "qr") {
            return qrDataUrl ? (
              <a
                key={field.id}
                className="absolute block"
                href={linkHref(field, qrSource)}
                style={style}
                target="_blank"
                rel="noreferrer"
              >
                <img src={qrDataUrl} alt="QR code" className="size-full object-contain" />
              </a>
            ) : null;
          }

          const text = stringifyTemplateValue(value);
          const content = Array.isArray(value)
            ? value.map((item) => (
                <span key={item} className="block leading-tight">
                  {item}
                </span>
              ))
            : text;
          const href = field.linkType ? linkHref(field, text) : "";

          if (href) {
            return (
              <a
                key={field.id}
                className="absolute overflow-hidden leading-tight underline-offset-2 hover:underline"
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                style={style}
              >
                {content}
              </a>
            );
          }

          return (
            <div
              key={field.id}
              className="absolute overflow-hidden whitespace-pre-line leading-tight"
              style={style}
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
