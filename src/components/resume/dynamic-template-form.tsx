"use client";

import {
  Bold,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileImage,
  FileText,
  ImagePlus,
  Italic,
  List,
  Maximize2,
  Move,
  Palette,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
  Type,
  Underline,
  X,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toPng } from "html-to-image";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { TemplateLivePreview } from "@/components/resume/template-live-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/layout/language-provider";
import { improveWithAI } from "@/lib/ai";
import { CanvaResumePdf } from "@/lib/pdf/canva-resume-pdf";
import { createQrDataUrl } from "@/lib/qr";
import {
  clearTemplateFieldValue,
  getEffectiveFieldLabel,
  getEffectiveFieldImageSettings,
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
import { getTemplateImageBorderRadiusCss, getTemplateImageObjectStyle, isPlaceholderEmbedded, isTemplatePlaceholderImage } from "@/lib/template-image";
import type { Resume, AIImproveIntent } from "@/types";
import type { CanvaResumeTemplate, CanvaTemplateField, CanvaTemplateImageSettings, CanvaTemplateValue } from "@/types/template";
import { groupTemplateFields } from "@/lib/template-field-groups";

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

const HISTORY_LIMIT = 80;
const HISTORY_MERGE_MS = 900;

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cloneResumeSnapshot(value: Resume): Resume {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as Resume;
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

function safeFileName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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
  const [advancedMode, setAdvancedMode] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [historyPast, setHistoryPast] = useState<Resume[]>([]);
  const [historyFuture, setHistoryFuture] = useState<Resume[]>([]);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportingPng, setExportingPng] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const historyMergingRef = useRef(false);
  const historyMergeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exportNodeRef = useRef<HTMLDivElement | null>(null);
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const data = useMemo(() => getTemplateData(draft), [draft]);
  const qrSource = stringifyTemplateValue(data.qr) || stringifyTemplateValue(data.portfolioUrl);
  const fieldGroups = useMemo(() => groupTemplateFields(template.fields), [template.fields]);
  const exportFileName = `${safeFileName(draft.personalInfo.fullName || "resume") || "resume"}-${template.id}`;

  function toggleGroup(groupId: string) {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }

  function pushHistorySnapshot(snapshot: Resume, force = false) {
    if (!force && historyMergingRef.current) {
      setHistoryFuture([]);
      return;
    }

    if (historyMergeTimerRef.current) {
      clearTimeout(historyMergeTimerRef.current);
      historyMergeTimerRef.current = null;
    }
    historyMergingRef.current = !force;
    if (!force) {
      historyMergeTimerRef.current = setTimeout(() => {
        historyMergingRef.current = false;
        historyMergeTimerRef.current = null;
      }, HISTORY_MERGE_MS);
    }

    const clonedSnapshot = cloneResumeSnapshot(snapshot);
    setHistoryPast((current) => [
      ...current.slice(-(HISTORY_LIMIT - 1)),
      clonedSnapshot,
    ]);
    setHistoryFuture([]);
  }

  function commitDraft(
    updater: (current: Resume) => Resume,
    options: { history?: boolean; forceHistory?: boolean } = {},
  ) {
    const previous = draftRef.current;
    const next = updater(previous);
    if (next === previous) return;

    if (options.history !== false) {
      pushHistorySnapshot(previous, options.forceHistory);
    }

    draftRef.current = next;
    setDraft(next);
  }

  function undoTemplateChange() {
    setHistoryPast((currentPast) => {
      const previous = currentPast.at(-1);
      if (!previous) return currentPast;

      const currentDraft = cloneResumeSnapshot(draftRef.current);
      const restored = cloneResumeSnapshot(previous);
      draftRef.current = restored;
      setDraft(restored);
      setHistoryFuture((currentFuture) => [
        currentDraft,
        ...currentFuture.slice(0, HISTORY_LIMIT - 1),
      ]);
      historyMergingRef.current = false;
      return currentPast.slice(0, -1);
    });
  }

  function redoTemplateChange() {
    setHistoryFuture((currentFuture) => {
      const next = currentFuture[0];
      if (!next) return currentFuture;

      const currentDraft = cloneResumeSnapshot(draftRef.current);
      const restored = cloneResumeSnapshot(next);
      draftRef.current = restored;
      setDraft(restored);
      setHistoryPast((currentPast) => [
        ...currentPast.slice(-(HISTORY_LIMIT - 1)),
        currentDraft,
      ]);
      historyMergingRef.current = false;
      return currentFuture.slice(1);
    });
  }

  function updateField(field: CanvaTemplateField, value: CanvaTemplateValue) {
    commitDraft((current) => setTemplateValue(current, field.sourceKey, value));
  }

  function updateFieldState(field: CanvaTemplateField, patch: Parameters<typeof setTemplateFieldState>[2]) {
    commitDraft((current) => setTemplateFieldState(current, field.id, patch));
  }

  function updateFieldLayout(
    field: CanvaTemplateField,
    layout: NonNullable<Parameters<typeof setTemplateFieldState>[2]["layout"]>,
  ) {
    updateFieldState(field, { layout });
  }

  function save() {
    onChange({ ...draft, templateId: template.id, status: "Ready" });
    setSaveStatus("saved");
    setMessage(isArabic ? "تم حفظ السيرة والقالب والتنسيقات محليًا." : "Resume, template, and formatting saved locally.");
    window.setTimeout(() => setMessage(""), 2400);
  }

  async function exportPng() {
    const node = exportNodeRef.current;
    if (!node) return;

    setExportingPng(true);
    setExportMenuOpen(false);
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        filter: (domNode) =>
          !(
            domNode instanceof HTMLElement &&
            domNode.dataset.exportIgnore === "true"
          ),
      });
      downloadDataUrl(dataUrl, `${exportFileName}.png`);
      setMessage(isArabic ? "تم تصدير PNG." : "PNG exported.");
      window.setTimeout(() => setMessage(""), 2400);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "PNG export failed.";
      setMessage(`⚠️ ${errorMessage}`);
      window.setTimeout(() => setMessage(""), 5000);
    } finally {
      setExportingPng(false);
    }
  }

  // --- Autosave ---
  const [saveStatus, setSaveStatus] = useState<"idle" | "unsaved" | "saving" | "saved">("idle");
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef(draft);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const triggerAutosave = useCallback(() => {
    setSaveStatus("unsaved");
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      setSaveStatus("saving");
      onChange({ ...draftRef.current, templateId: template.id, status: "Ready" });
      setSaveStatus("saved");
    }, 2000);
  }, [onChange, template.id]);

  // Mark as unsaved whenever draft changes (skip initial render)
  const isInitialRender = useRef(true);
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    triggerAutosave();
  }, [draft, triggerAutosave]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      if (historyMergeTimerRef.current) clearTimeout(historyMergeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let active = true;
    void createQrDataUrl(qrSource).then((url) => {
      if (active) setQrDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, [qrSource]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const usesModifier = event.ctrlKey || event.metaKey;
      if (!usesModifier || event.altKey) return;

      const key = event.key.toLowerCase();
      const wantsUndo = key === "z" && !event.shiftKey;
      const wantsRedo = key === "y" || (key === "z" && event.shiftKey);
      if (!wantsUndo && !wantsRedo) return;

      event.preventDefault();
      if (wantsUndo) undoTemplateChange();
      if (wantsRedo) redoTemplateChange();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [historyFuture.length, historyPast.length]);

  async function runAI(field: CanvaTemplateField, intent: AIImproveIntent) {
    const value = stringifyTemplateValue(getTemplateValue(data, field.sourceKey));
    if (!value.trim()) return;

    const effectiveLabel = getEffectiveFieldLabel(draft, field);
    setLoadingField(`${field.id}:${intent}`);
    try {
      const improved = await improveWithAI(value, intent, {
        language: locale,
        fieldLabel: effectiveLabel,
        maxChars: intent === "fit-template-space" ? field.maxChars : undefined,
        maxLines: intent === "fit-template-space" ? field.maxLines : undefined,
        templateName: template.name,
      });

      updateField(field, isListLikeField(field) ? splitTemplateList(improved) : improved);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "AI improvement failed.";
      setMessage(`⚠️ ${errorMessage}`);
      window.setTimeout(() => setMessage(""), 5000);
    } finally {
      setLoadingField(null);
    }
  }

  return (
    <div className="relative">
      {sidePanelOpen ? (
        <div className="pointer-events-none fixed inset-0 z-[2000]">
          <aside
            className={`pointer-events-auto absolute top-0 h-full w-[min(92vw,520px)] ${isArabic ? "right-0 animate-[drawer-in-rtl_180ms_ease-out]" : "left-0 animate-[drawer-in-ltr_180ms_ease-out]"}`}
          >
            <div className="flex h-full flex-col border-slate-200 bg-[#fffefa] shadow-2xl dark:border-white/10 dark:bg-[#080808]">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10">
                <div>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">
                    {isArabic ? "حقول القالب" : "Template fields"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {template.name}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSidePanelOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
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
          <div className="mt-2 flex items-center gap-3">
            {saveStatus === "unsaved" ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <span className="inline-block size-1.5 rounded-full bg-amber-500" />
                {isArabic ? "تغييرات غير محفوظة" : "Unsaved changes"}
              </span>
            ) : saveStatus === "saving" ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-blue-500" />
                {isArabic ? "جاري الحفظ..." : "Saving..."}
              </span>
            ) : saveStatus === "saved" ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                {isArabic ? "تم حفظ جميع التغييرات" : "All changes saved"}
              </span>
            ) : null}
          </div>
          {message ? (
            <p className={`mt-2 text-sm font-medium ${message.startsWith("⚠️") ? "text-amber-600" : "text-emerald-600"}`}>
              {message}
            </p>
          ) : null}
          <button
            type="button"
            className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-800 dark:hover:text-slate-200"
            onClick={() => setAdvancedMode((v) => !v)}
          >
            <Settings2 className="size-3.5" />
            {isArabic ? "إعدادات متقدمة" : "Advanced controls"}
            {advancedMode ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          </button>
        </Card>

        {fieldGroups.map((group) => {
          const isGroupCollapsed = collapsedGroups[group.id] ?? false;
          return (
            <div key={group.id} className="space-y-3">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-200 dark:hover:bg-zinc-700"
                onClick={() => toggleGroup(group.id)}
              >
                <span>{isArabic ? group.labelAr : group.labelEn} ({group.fields.length})</span>
                {isGroupCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
              {!isGroupCollapsed ? group.fields.map((field) => {
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
                    onClick={() =>
                      commitDraft(
                        (current) => resetTemplateFieldState(current, field.id),
                        { forceHistory: true },
                      )
                    }
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
                    imageSettings={getEffectiveFieldImageSettings(draft, field)}
                    onImageChange={(image) => updateFieldState(field, { image })}
                    locale={locale}
                  />

                  {advancedMode ? (
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
                          ? "تقدر أيضًا تسحب المربع من المعاينة، أو تمسك النقطة الزرقاء لتغيير حجمه."
                          : "You can also drag the box in the preview, or use the blue handle to resize."}
                      </p>
                    </div>
                  ) : null}

                  {advancedMode ? (
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
                  ) : null}

                  {advancedMode && field.type !== "qr" && field.type !== "image" ? (
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
        }) : null}
            </div>
          );
        })}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
      <div className="xl:sticky xl:top-20 xl:self-start">
        <div className="mb-2 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-sm dark:border-white/10 dark:bg-zinc-950/80">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setSidePanelOpen((value) => !value)}>
              <ChevronDown className="size-3.5" />
              {isArabic ? "إظهار الحقول" : "Show fields"}
            </Button>
            <div className="relative">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setExportMenuOpen((value) => !value)}
              >
                <Download className="size-3.5" />
                {isArabic ? "تصدير" : "Export"}
                <ChevronDown className="size-3.5" />
              </Button>
              {exportMenuOpen ? (
                <div className="absolute end-0 top-full z-[1400] mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 text-sm shadow-xl dark:border-white/10 dark:bg-zinc-950">
                  {qrDataUrl ? (
                    <PDFDownloadLink
                      document={
                        <CanvaResumePdf
                          template={template}
                          resume={draft}
                          qrDataUrl={qrDataUrl}
                        />
                      }
                      fileName={`${exportFileName}.pdf`}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/10"
                      onClick={() => setExportMenuOpen(false)}
                    >
                      {({ loading }) => (
                        <>
                          <FileText className="size-4" />
                          {loading
                            ? isArabic
                              ? "تجهيز PDF"
                              : "Preparing PDF"
                            : "PDF"}
                        </>
                      )}
                    </PDFDownloadLink>
                  ) : (
                    <button
                      type="button"
                      className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 font-semibold text-slate-400"
                      disabled
                    >
                      <FileText className="size-4" />
                      {isArabic ? "تجهيز PDF" : "Preparing PDF"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-100 dark:hover:bg-white/10"
                    onClick={() => void exportPng()}
                    disabled={exportingPng}
                  >
                    <FileImage className="size-4" />
                    {exportingPng
                      ? isArabic
                        ? "تجهيز PNG"
                        : "Preparing PNG"
                      : "PNG"}
                  </button>
                </div>
              ) : null}
            </div>
            <Button size="sm" onClick={save}>
              <Save className="size-3.5" />
              {isArabic ? "حفظ" : "Save"}
            </Button>
          </div>
        </div>

        <TemplateLivePreview
          template={template}
          resume={draft}
          canUndo={historyPast.length > 0}
          canRedo={historyFuture.length > 0}
          onUndo={undoTemplateChange}
          onRedo={redoTemplateChange}
          exportRef={exportNodeRef}
          onFieldLayoutChange={(field, layout) => updateFieldLayout(field, layout)}
          onFieldStateChange={(field, patch) => updateFieldState(field, patch)}
          onFieldValueClear={(field) =>
            commitDraft(
              (current) => clearTemplateFieldValue(current, field),
              { forceHistory: true },
            )
          }
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
  imageSettings,
  onImageChange,
  locale,
}: {
  field: CanvaTemplateField;
  value: CanvaTemplateValue;
  onChange: (value: CanvaTemplateValue) => void;
  imageSettings: Required<CanvaTemplateImageSettings>;
  onImageChange: (image: CanvaTemplateImageSettings) => void;
  locale: "en" | "ar";
}) {
  const stringValue = stringifyTemplateValue(value);
  const label = translateTemplateFieldLabel(field.label, locale);
  const isArabic = locale === "ar";

  if (field.type === "image") {
    const src = stringValue || field.placeholderImage || PROFILE_PLACEHOLDER;
    const isPlaceholder = isTemplatePlaceholderImage(field, src);
    const placeholderIsEmbedded = isPlaceholderEmbedded(field);
    return (
      <div className="space-y-3">
        <div
          className="relative mx-auto size-28 overflow-hidden border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-zinc-900"
          style={{ borderRadius: getTemplateImageBorderRadiusCss(field, imageSettings) }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Profile preview"
            className={`absolute max-w-none ${isPlaceholder ? "object-contain" : "object-cover"}`}
            style={getTemplateImageObjectStyle(imageSettings)}
          />
        </div>
        {placeholderIsEmbedded && !stringValue ? (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            {isArabic
              ? "يظهر فريم البليس هولدر الافتراضي إلى أن ترفع صورة جديدة."
              : "The default placeholder frame stays visible until you upload a new picture."}
          </p>
        ) : null}
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
          <Button
            variant="secondary"
            onClick={() => onChange(placeholderIsEmbedded ? "" : field.placeholderImage || PROFILE_PLACEHOLDER)}
          >
            {isArabic ? "استخدام البليس هولدر" : "Use placeholder"}
          </Button>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 dark:border-white/10">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Maximize2 className="size-3.5" />
            {isArabic ? "فريم الصورة والبليس هولدر" : "Image frame and placeholder"}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>{isArabic ? "بوردر رديوس" : "Border radius"}</span>
              <Input
                className="h-8"
                type="number"
                min={0}
                max={50}
                step={1}
                value={Number(imageSettings.borderRadius.toFixed(2))}
                onChange={(event) =>
                  onImageChange({ borderRadius: clampNumber(Number(event.target.value) || 0, 0, 50) })
                }
              />
            </label>
            <label className="space-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>{isArabic ? "زوم الصورة" : "Image zoom"}</span>
              <Input
                className="h-8"
                type="number"
                min={1}
                max={3}
                step={0.05}
                value={Number(imageSettings.scale.toFixed(2))}
                onChange={(event) =>
                  onImageChange({ scale: clampNumber(Number(event.target.value) || 1, 1, 3) })
                }
              />
            </label>
            <label className="space-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>{isArabic ? "تحريك أفقي" : "Horizontal pan"}</span>
              <Input
                className="h-8"
                type="range"
                min={0}
                max={100}
                step={1}
                value={imageSettings.objectPositionX}
                onChange={(event) =>
                  onImageChange({ objectPositionX: clampNumber(Number(event.target.value) || 50, 0, 100) })
                }
              />
            </label>
            <label className="space-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>{isArabic ? "تحريك عمودي" : "Vertical pan"}</span>
              <Input
                className="h-8"
                type="range"
                min={0}
                max={100}
                step={1}
                value={imageSettings.objectPositionY}
                onChange={(event) =>
                  onImageChange({ objectPositionY: clampNumber(Number(event.target.value) || 50, 0, 100) })
                }
              />
            </label>
          </div>
          <Button
            className="mt-3 w-full"
            size="sm"
            variant="secondary"
            onClick={() => onImageChange({ borderRadius: 0, objectPositionX: 50, objectPositionY: 50, scale: 1 })}
          >
            <RotateCcw className="size-3.5" />
            {isArabic ? "إرجاع الفريم مربع" : "Reset square frame"}
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
