"use client";

import {
  Bold,
  Eye,
  EyeOff,
  ImagePlus,
  Italic,
  List,
  Maximize2,
  Move,
  Palette,
  RotateCcw,
  Save,
  Sparkles,
  Type,
  Underline,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { TemplateLivePreview } from "@/components/resume/template-live-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/layout/language-provider";
import { improveWithAI } from "@/lib/ai";
import {
  clearTemplateFieldValue,
  getEffectiveFieldLabel,
  getEffectiveFieldLayout,
  getEffectiveFieldStyle,
  getTemplateData,
  getTemplateFieldState,
  getTemplateValue,
  isListLikeField,
  isTemplateFieldEnabled,
  PROFILE_PLACEHOLDER,
  resetTemplateFieldState,
  setTemplateFieldState,
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

const FONT_FAMILIES = [
  "Open Sans",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Tajawal",
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

  function updateFieldState(field: CanvaTemplateField, patch: Parameters<typeof setTemplateFieldState>[2]) {
    setDraft((current) => setTemplateFieldState(current, field.id, patch));
  }

  function updateFieldLayout(
    field: CanvaTemplateField,
    layout: NonNullable<Parameters<typeof setTemplateFieldState>[2]["layout"]>,
  ) {
    updateFieldState(field, { layout });
  }

  function save() {
    onChange({ ...draft, templateId: template.id, status: "Ready" });
    setMessage(isArabic ? "تم حفظ السيرة والقالب والتنسيقات محليًا." : "Resume, template, and formatting saved locally.");
    window.setTimeout(() => setMessage(""), 2400);
  }

  async function runAI(field: CanvaTemplateField, intent: AIImproveIntent) {
    const value = stringifyTemplateValue(getTemplateValue(data, field.sourceKey));
    if (!value.trim()) return;

    const effectiveLabel = getEffectiveFieldLabel(draft, field);
    setLoadingField(`${field.id}:${intent}`);
    const improved = await improveWithAI(value, intent, {
      language: locale,
      fieldLabel: effectiveLabel,
      maxChars: intent === "fit-template-space" ? field.maxChars : undefined,
      maxLines: intent === "fit-template-space" ? field.maxLines : undefined,
      templateName: template.name,
    });

    updateField(field, isListLikeField(field) ? splitTemplateList(improved) : improved);
    setLoadingField(null);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[500px_minmax(0,1fr)]">
      <div className="space-y-4">
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">{template.name}</h2>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {isArabic
                  ? "اختر ما يظهر في القالب، غيّر العناوين، عدّل اللون والحجم والنمط، ثم حمّل PDF بروابط حقيقية."
                  : "Choose visible sections, rename headings, adjust style, then export a PDF with real links."}
              </p>
            </div>
            <Button onClick={save}>
              <Save className="size-4" />
              {isArabic ? "حفظ" : "Save"}
            </Button>
          </div>
          {message ? <p className="mt-3 text-sm font-medium text-emerald-600">{message}</p> : null}
        </Card>

        {template.fields.map((field) => {
          const enabled = isTemplateFieldEnabled(draft, field);
          const state = getTemplateFieldState(draft, field);
          const effectiveStyle = getEffectiveFieldStyle(draft, field);
          const effectiveLayout = getEffectiveFieldLayout(draft, field);

          return (
            <Card key={field.id} className={enabled ? "space-y-3" : "space-y-3 opacity-70"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {translateTemplateFieldLabel(field.label, locale)}
                    {field.required ? <span className="text-rose-500"> *</span> : null}
                  </label>
                  <p className="mt-1 text-xs text-slate-400">
                    {field.maxChars ? `${field.maxChars} ${isArabic ? "حرف" : "chars"}` : ""}
                    {field.maxLines ? ` · ${field.maxLines} ${isArabic ? "أسطر" : "lines"}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={enabled ? "secondary" : "primary"}
                    onClick={() => updateFieldState(field, { enabled: !enabled })}
                    title={enabled ? (isArabic ? "إخفاء القسم" : "Hide section") : isArabic ? "إظهار القسم" : "Show section"}
                  >
                    {enabled ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    {enabled ? (isArabic ? "إخفاء" : "Hide") : isArabic ? "إظهار" : "Show"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDraft((current) => resetTemplateFieldState(current, field.id))}
                    title={isArabic ? "إرجاع إعدادات القسم" : "Reset field settings"}
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                </div>
              </div>

              {!enabled ? (
                <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500 dark:border-white/10">
                  {isArabic ? "هذا القسم مخفي ولن يظهر في المعاينة أو PDF." : "This section is hidden from preview and PDF."}
                </p>
              ) : (
                <>
                  {field.showLabel ? (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">
                        {isArabic ? "عنوان القسم داخل القالب" : "Section heading in template"}
                      </label>
                      <Input
                        value={state.label ?? field.label}
                        onChange={(event) => updateFieldState(field, { label: event.target.value })}
                      />
                    </div>
                  ) : null}

                  <TemplateFieldInput
                    field={field}
                    value={getTemplateValue(data, field.sourceKey)}
                    onChange={(value) => updateField(field, value)}
                    locale={locale}
                  />

                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 dark:border-cyan-400/20 dark:bg-cyan-400/5">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
                      <Move className="size-3.5" />
                      {isArabic ? "مكان وحجم المربع" : "Box position and size"}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <NumberControl
                        label="X"
                        value={effectiveLayout.x}
                        onChange={(value) => updateFieldLayout(field, { x: value })}
                      />
                      <NumberControl
                        label="Y"
                        value={effectiveLayout.y}
                        onChange={(value) => updateFieldLayout(field, { y: value })}
                      />
                      <NumberControl
                        label={isArabic ? "العرض" : "Width"}
                        value={effectiveLayout.width}
                        onChange={(value) => updateFieldLayout(field, { width: value })}
                      />
                      <NumberControl
                        label={isArabic ? "الارتفاع" : "Height"}
                        value={effectiveLayout.height}
                        onChange={(value) => updateFieldLayout(field, { height: value })}
                      />
                      <NumberControl
                        label="Z"
                        value={effectiveLayout.zIndex}
                        onChange={(value) => updateFieldLayout(field, { zIndex: value })}
                      />
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                      {isArabic
                        ? "تقدر أيضًا تسحب المربع من المعاينة، أو تمسك النقطة الزرقاء لتغيير حجمه. زيادة العرض تقلل الأسطر، وتقليل العرض يزيد التفاف النص."
                        : "You can also drag the box in the preview, or use the blue handle to resize it. Wider boxes reduce wrapping; narrower boxes increase wrapping."}
                    </p>
                  </div>

                  <div className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-white/10">
                    <label className="text-xs font-semibold text-slate-500">
                      {isArabic ? "رابط عند الضغط على هذا القسم داخل PDF" : "Clickable PDF link for this section"}
                    </label>
                    <Input
                      value={state.linkOverride ?? ""}
                      onChange={(event) => updateFieldState(field, { linkOverride: event.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>

                  {field.type !== "qr" && field.type !== "image" ? (
                    <div className="rounded-lg border border-slate-200 p-3 dark:border-white/10">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Type className="size-3.5" />
                        {isArabic ? "تنسيق هذا الحقل" : "Field styling"}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="space-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-2"><Type className="size-3.5" />{isArabic ? "نوع الخط" : "Font family"}</span>
                          <select
                            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                            value={effectiveStyle.fontFamily}
                            onChange={(event) => updateFieldState(field, { style: { fontFamily: event.target.value } })}
                          >
                            {FONT_FAMILIES.map((font) => (
                              <option key={font} value={font}>
                                {font}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-500">
                          <Type className="size-3.5" />
                          <span>{isArabic ? "حجم الخط" : "Font size"}</span>
                          <Input
                            className="h-8"
                            type="number"
                            min={5}
                            max={36}
                            value={effectiveStyle.fontSize}
                            onChange={(event) =>
                              updateFieldState(field, { style: { fontSize: Number(event.target.value) || field.fontSize } })
                            }
                          />
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-500">
                          <Palette className="size-3.5" />
                          <span>{isArabic ? "اللون" : "Color"}</span>
                          <input
                            type="color"
                            value={effectiveStyle.color}
                            onChange={(event) => updateFieldState(field, { style: { color: event.target.value } })}
                            className="h-8 w-12 rounded border border-slate-200 bg-transparent dark:border-white/10"
                          />
                        </label>
                        <label className="space-y-1 text-xs text-slate-500">
                          <span>{isArabic ? "المحاذاة" : "Alignment"}</span>
                          <select
                            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                            value={effectiveStyle.align}
                            onChange={(event) =>
                              updateFieldState(field, {
                                style: { align: event.target.value as "left" | "center" | "right" | "justify" },
                              })
                            }
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                            <option value="justify">Justify</option>
                          </select>
                        </label>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <label className="flex items-center gap-2 text-xs text-slate-500">
                          <Maximize2 className="size-3.5" />
                          <span>{isArabic ? "ارتفاع السطر" : "Line height"}</span>
                          <Input
                            className="h-8"
                            type="number"
                            min={0.9}
                            max={1.8}
                            step={0.05}
                            value={effectiveStyle.lineHeight}
                            onChange={(event) =>
                              updateFieldState(field, { style: { lineHeight: Number(event.target.value) || 1.14 } })
                            }
                          />
                        </label>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <ToggleStyleButton active={effectiveStyle.bold} onClick={() => updateFieldState(field, { style: { bold: !effectiveStyle.bold } })}>
                          <Bold className="size-3.5" />
                          B
                        </ToggleStyleButton>
                        <ToggleStyleButton active={effectiveStyle.italic} onClick={() => updateFieldState(field, { style: { italic: !effectiveStyle.italic } })}>
                          <Italic className="size-3.5" />
                          I
                        </ToggleStyleButton>
                        <ToggleStyleButton active={effectiveStyle.underline} onClick={() => updateFieldState(field, { style: { underline: !effectiveStyle.underline } })}>
                          <Underline className="size-3.5" />
                          U
                        </ToggleStyleButton>
                        <ToggleStyleButton active={effectiveStyle.strike} onClick={() => updateFieldState(field, { style: { strike: !effectiveStyle.strike } })}>
                          S
                        </ToggleStyleButton>
                        <ToggleStyleButton active={effectiveStyle.bullets} onClick={() => updateFieldState(field, { style: { bullets: !effectiveStyle.bullets } })}>
                          <List className="size-3.5" />
                          {isArabic ? "نقاط" : "Bullets"}
                        </ToggleStyleButton>
                        <ToggleStyleButton active={effectiveStyle.autoFit} onClick={() => updateFieldState(field, { style: { autoFit: !effectiveStyle.autoFit } })}>
                          <Maximize2 className="size-3.5" />
                          {isArabic ? "تكييف الخط" : "Auto fit"}
                        </ToggleStyleButton>
                      </div>
                    </div>
                  ) : null}

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
                </>
              )}
            </Card>
          );
        })}
      </div>
      <div className="xl:sticky xl:top-24 xl:self-start">
        <TemplateLivePreview
          template={template}
          resume={draft}
          onFieldLayoutChange={(field, layout) => updateFieldLayout(field, layout)}
          onFieldStateChange={(field, patch) => updateFieldState(field, patch)}
          onFieldValueClear={(field) => setDraft((current) => clearTemplateFieldValue(current, field))}
          onFieldValueChange={(field, value) => updateField(field, value)}
        />
      </div>
    </div>
  );
}

function ToggleStyleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button size="sm" variant={active ? "primary" : "secondary"} onClick={onClick}>
      {children}
    </Button>
  );
}

function NumberControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="space-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      <span>{label}</span>
      <Input
        className="h-8"
        type="number"
        min={0}
        max={100}
        step={0.25}
        value={Number(value.toFixed(2))}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
      />
    </label>
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
    const src = stringValue || field.placeholderImage || PROFILE_PLACEHOLDER;
    return (
      <div className="space-y-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Profile preview"
          className="mx-auto size-28 rounded-full border border-slate-200 object-cover dark:border-white/10"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 transition hover:border-cyan-500 dark:border-white/10">
            <ImagePlus className="mb-2 size-6" />
            {isArabic ? "رفع صورة بدل البليس هولدر" : "Upload image"}
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
          <Button variant="secondary" onClick={() => onChange(field.placeholderImage || PROFILE_PLACEHOLDER)}>
            {isArabic ? "استخدام البليس هولدر" : "Use placeholder"}
          </Button>
        </div>
      </div>
    );
  }

  if (field.type === "textarea" || isListLikeField(field)) {
    return (
      <Textarea
        value={stringValue}
        onChange={(event) =>
          onChange(isListLikeField(field) ? splitTemplateList(event.target.value) : event.target.value)
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
    "Contact me": "تواصل معي",
    Phone: "الهاتف",
    Email: "البريد الإلكتروني",
    Location: "الموقع",
    "About me": "نبذة عني",
    "ABOUT ME": "نبذة عني",
    "Work experience": "الخبرات العملية",
    "WORK EXPERIENCE": "الخبرات العملية",
    "Developer experience": "خبرة التطوير",
    Education: "التعليم",
    EDUCATION: "التعليم",
    Expertise: "الخبرات",
    EXPERTISE: "الخبرات",
    Skills: "المهارات",
    Languages: "اللغات",
    LANGUAGES: "اللغات",
    Deployments: "النشر والمشاريع",
    DEPLOYMENT: "النشر والمشاريع",
    Portfolio: "رابط البورتفوليو",
    "Portfolio URL": "رابط البورتفوليو",
    GitHub: "رابط GitHub",
    "GitHub URL": "رابط GitHub",
    LinkedIn: "رابط LinkedIn",
    "LinkedIn URL": "رابط LinkedIn",
    QR: "رمز QR",
    "QR source URL": "رابط QR",
    "Job title": "المسمى الوظيفي",
  };
  return labels[label] ?? label;
}

function isAIField(field: CanvaTemplateField) {
  return !["image", "qr", "email", "phone", "link"].includes(field.type);
}
