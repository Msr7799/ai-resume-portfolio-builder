"use client";

import { ImagePlus, Save, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { TemplateLivePreview } from "@/components/resume/template-live-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/layout/language-provider";
import { improveWithAI } from "@/lib/ai";
import {
  getTemplateData,
  getTemplateValue,
  setTemplateValue,
  splitTemplateList,
  stringifyTemplateValue,
} from "@/lib/template-data";
import type { Resume, AIImproveIntent } from "@/types";
import type { CanvaResumeTemplate, CanvaTemplateField, CanvaTemplateValue } from "@/types/template";

const textAIButtons: { label: string; arLabel: string; intent: AIImproveIntent }[] = [
  { label: "Improve", arLabel: "تحسين", intent: "improve-summary" },
  { label: "Professional", arLabel: "صياغة احترافية", intent: "professional" },
  { label: "ATS-friendly", arLabel: "مناسب للـ ATS", intent: "ats" },
  { label: "Shorter", arLabel: "اختصار", intent: "shorter" },
  { label: "Fit space", arLabel: "ملاءمة المساحة", intent: "fit-template-space" },
];

export function DynamicTemplateForm({
  template,
  resume,
  onChange,
}: {
  template: CanvaResumeTemplate;
  resume: Resume;
  onChange: (resume: Resume) => void;
}) {
  const [draft, setDraft] = useState<Resume>(() => ({
    ...resume,
    templateData: getTemplateData(resume),
  }));
  const [message, setMessage] = useState("");
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const data = useMemo(() => getTemplateData(draft), [draft]);

  function updateField(field: CanvaTemplateField, value: CanvaTemplateValue) {
    setDraft((current) => setTemplateValue(current, field.sourceKey, value));
  }

  function save() {
    onChange({ ...draft, templateId: template.id, status: "Ready" });
    setMessage(isArabic ? "تم حفظ سيرة القالب محليًا." : "Template resume saved locally.");
    window.setTimeout(() => setMessage(""), 2400);
  }

  async function runAI(field: CanvaTemplateField, intent: AIImproveIntent) {
    const value = stringifyTemplateValue(getTemplateValue(data, field.sourceKey));
    if (!value.trim()) return;

    setLoadingField(`${field.id}:${intent}`);
    const improved = await improveWithAI(value, intent, {
      language: locale,
      fieldLabel: field.label,
      maxChars: intent === "fit-template-space" ? field.maxChars : undefined,
      maxLines: intent === "fit-template-space" ? field.maxLines : undefined,
      templateName: template.name,
    });

    updateField(
      field,
      isListField(field) ? splitTemplateList(improved) : improved,
    );
    setLoadingField(null);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
      <div className="space-y-4">
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                {template.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isArabic
                  ? "تظهر هنا فقط الحقول التي يستخدمها قالب Canva المحدد."
                  : "Only fields used by this Canva template are shown."}
              </p>
            </div>
            <Button onClick={save}>
              <Save className="size-4" />
              {isArabic ? "حفظ" : "Save"}
            </Button>
          </div>
          {message ? <p className="mt-3 text-sm font-medium text-emerald-600">{message}</p> : null}
        </Card>

        {template.fields.map((field) => (
          <Card key={field.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {translateTemplateFieldLabel(field.label, locale)}
                {field.required ? <span className="text-rose-500"> *</span> : null}
              </label>
              <span className="text-xs text-slate-400">
                {field.maxChars ? `${field.maxChars} ${isArabic ? "حرف" : "chars"}` : ""}
                {field.maxLines ? ` · ${field.maxLines} ${isArabic ? "أسطر" : "lines"}` : ""}
              </span>
            </div>
            <TemplateFieldInput
              field={field}
              value={getTemplateValue(data, field.sourceKey)}
              onChange={(value) => updateField(field, value)}
              locale={locale}
            />
            {isAIField(field) ? (
              <div className="flex flex-wrap gap-2">
                {textAIButtons.map((button) => (
                  <Button
                    key={button.intent}
                    size="sm"
                    variant="secondary"
                    onClick={() => void runAI(field, button.intent)}
                    disabled={loadingField !== null}
                  >
                    <Sparkles className="size-3.5" />
                    {loadingField === `${field.id}:${button.intent}`
                      ? isArabic
                        ? "جاري العمل..."
                        : "Working..."
                      : isArabic
                        ? button.arLabel
                        : button.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </Card>
        ))}
      </div>
      <div className="xl:sticky xl:top-24 xl:self-start">
        <TemplateLivePreview template={template} resume={draft} />
      </div>
    </div>
  );
}

function TemplateFieldInput({
  field,
  value,
  onChange,
  locale,
}: {
  field: CanvaTemplateField;
  value: CanvaTemplateValue;
  onChange: (value: CanvaTemplateValue) => void;
  locale: "en" | "ar";
}) {
  const stringValue = stringifyTemplateValue(value);
  const label = translateTemplateFieldLabel(field.label, locale);
  const isArabic = locale === "ar";

  if (field.type === "image") {
    return (
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 transition hover:border-cyan-500 dark:border-white/10">
        <ImagePlus className="mb-2 size-6" />
        {isArabic ? "رفع الصورة الشخصية" : "Upload profile image"}
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => onChange(String(reader.result ?? ""));
            reader.readAsDataURL(file);
          }}
        />
      </label>
    );
  }

  if (field.type === "textarea" || isListField(field)) {
    return (
      <Textarea
        value={stringValue}
        onChange={(event) =>
          onChange(isListField(field) ? splitTemplateList(event.target.value) : event.target.value)
        }
        placeholder={field.type.includes("list") ? (isArabic ? "عنصر واحد في كل سطر" : "One item per line") : label}
      />
    );
  }

  return (
    <Input
      value={stringValue}
      onChange={(event) => onChange(event.target.value)}
      type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
      placeholder={label}
    />
  );
}

function translateTemplateFieldLabel(label: string, locale: "en" | "ar") {
  if (locale !== "ar") return label;
  const labels: Record<string, string> = {
    "Full name": "الاسم الكامل",
    "Profile image": "الصورة الشخصية",
    Phone: "الهاتف",
    Email: "البريد الإلكتروني",
    Location: "الموقع",
    "About me": "نبذة عني",
    "Work experience": "الخبرات العملية",
    "Developer experience": "خبرة التطوير",
    Education: "التعليم",
    Expertise: "الخبرات",
    Skills: "المهارات",
    Languages: "اللغات",
    Deployments: "النشر والمشاريع",
    Portfolio: "رابط البورتفوليو",
    GitHub: "رابط GitHub",
    LinkedIn: "رابط LinkedIn",
    QR: "رمز QR",
    "Job title": "المسمى الوظيفي",
  };
  return labels[label] ?? label;
}

function isListField(field: CanvaTemplateField) {
  return [
    "list",
    "experience-list",
    "education-list",
    "project-list",
    "language-list",
  ].includes(field.type);
}

function isAIField(field: CanvaTemplateField) {
  return !["image", "qr", "email", "phone", "link"].includes(field.type);
}
