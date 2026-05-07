"use client";

import { AlertTriangle, ExternalLink, Minus, MousePointer2, Plus, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/layout/language-provider";
import {
  getEffectiveFieldLabel,
  getEffectiveFieldLayout,
  getEffectiveFieldStyle,
  getTemplateData,
  getTemplateValue,
  isListLikeField,
  isTemplateFieldEnabled,
  PROFILE_PLACEHOLDER,
  splitTemplateList,
  stringifyTemplateValue,
} from "@/lib/template-data";
import { shouldRenderTemplateImageOverlay } from "@/lib/template-image";
import type { Resume } from "@/types";
import type { CanvaResumeTemplate, CanvaTemplateField, CanvaTemplateFieldLayout, CanvaTemplateValue } from "@/types/template";

const A4_PREVIEW_BASE_WIDTH = 720;
const A4_RATIO = 297 / 210;
const A4_PDF_WIDTH = 595.28;
const KONVA_CDN_URL = "https://cdn.jsdelivr.net/npm/konva@10/konva.min.js";

type RequiredLayout = Required<CanvaTemplateFieldLayout>;
type KonvaEvent = {
  target?: KonvaNode;
  cancelBubble?: boolean;
};
type KonvaNode = {
  add: (...nodes: KonvaNode[]) => void;
  batchDraw: () => void;
  destroy: () => void;
  height: () => number;
  moveToBottom: () => void;
  moveToTop: () => void;
  nodes: (nodes: KonvaNode[]) => void;
  on: (events: string, handler: (event: KonvaEvent) => void) => void;
  scaleX: (value?: number) => number;
  scaleY: (value?: number) => number;
  width: () => number;
  x: () => number;
  y: () => number;
};
type KonvaConstructor = new (config?: Record<string, unknown>) => KonvaNode;
type KonvaRuntime = {
  Group: KonvaConstructor;
  Image: KonvaConstructor;
  Layer: KonvaConstructor;
  Rect: KonvaConstructor;
  Stage: KonvaConstructor;
  Text: KonvaConstructor;
  Transformer: KonvaConstructor;
};

declare global {
  interface Window {
    Konva?: KonvaRuntime;
    __airpbKonvaLoader?: Promise<KonvaRuntime>;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundLayout(value: number) {
  return Number(value.toFixed(2));
}

function layoutToPixels(layout: RequiredLayout, width: number, height: number) {
  return {
    x: (layout.x / 100) * width,
    y: (layout.y / 100) * height,
    width: (layout.width / 100) * width,
    height: (layout.height / 100) * height,
  };
}

function pixelsToLayout(node: KonvaNode, stageWidth: number, stageHeight: number): RequiredLayout {
  const widthPx = Math.max(18, Number(node.width?.() ?? 18) * Number(node.scaleX?.() ?? 1));
  const heightPx = Math.max(12, Number(node.height?.() ?? 12) * Number(node.scaleY?.() ?? 1));
  const xPx = Number(node.x?.() ?? 0);
  const yPx = Number(node.y?.() ?? 0);

  return {
    x: roundLayout(clamp((xPx / stageWidth) * 100, 0, 100)),
    y: roundLayout(clamp((yPx / stageHeight) * 100, 0, 100)),
    width: roundLayout(clamp((widthPx / stageWidth) * 100, 2, 100)),
    height: roundLayout(clamp((heightPx / stageHeight) * 100, 1, 100)),
    zIndex: 1,
  };
}

function loadKonva() {
  if (typeof window === "undefined") return Promise.reject(new Error("Konva is browser-only."));
  if (window.Konva) return Promise.resolve(window.Konva);
  if (window.__airpbKonvaLoader) return window.__airpbKonvaLoader;

  window.__airpbKonvaLoader = new Promise<KonvaRuntime>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${KONVA_CDN_URL}"]`);
    const script = existing ?? document.createElement("script");
    script.src = KONVA_CDN_URL;
    script.async = true;
    script.onload = () => (window.Konva ? resolve(window.Konva) : reject(new Error("Konva loaded but did not expose window.Konva.")));
    script.onerror = () => reject(new Error("Could not load the free Konva editor library from CDN."));
    if (!existing) document.head.appendChild(script);
  });

  return window.__airpbKonvaLoader;
}

function textValue(value: CanvaTemplateValue, bullets: boolean) {
  const raw = stringifyTemplateValue(value);
  if (!bullets) return raw;
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith("•") ? line : `• ${line}`))
    .join("\n");
}

function isTextField(field: CanvaTemplateField) {
  return !["image", "qr"].includes(field.type);
}

export function FreeKonvaTemplateEditor({
  template,
  resume,
  onFieldLayoutChange,
  onFieldValueChange,
}: {
  template: CanvaResumeTemplate;
  resume: Resume;
  onFieldLayoutChange: (field: CanvaTemplateField, layout: RequiredLayout) => void;
  onFieldValueChange: (field: CanvaTemplateField, value: CanvaTemplateValue) => void;
}) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<KonvaNode | null>(null);
  const [konva, setKonva] = useState<KonvaRuntime | null>(null);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(0.82);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const data = useMemo(() => getTemplateData(resume), [resume]);
  const previewWidth = Math.round(A4_PREVIEW_BASE_WIDTH * zoom);
  const previewHeight = Math.round(previewWidth * A4_RATIO);
  const fontScale = previewWidth / A4_PDF_WIDTH;
  const enabledFields = useMemo(
    () => template.fields.filter((field) => isTemplateFieldEnabled(resume, field)),
    [resume, template.fields],
  );
  const fieldsById = useMemo(
    () => Object.fromEntries(template.fields.map((field) => [field.id, field])) as Record<string, CanvaTemplateField>,
    [template.fields],
  );
  const sortedFields = useMemo(
    () => [...enabledFields].sort((a, b) => getEffectiveFieldLayout(resume, a).zIndex - getEffectiveFieldLayout(resume, b).zIndex),
    [enabledFields, resume],
  );

  useEffect(() => {
    let active = true;
    void loadKonva()
      .then((runtime) => {
        if (active) setKonva(runtime);
      })
      .catch((reason: unknown) => {
        const message = reason instanceof Error ? reason.message : "Could not load Konva.";
        if (active) setError(message);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!konva || !containerRef.current) return;

    const Konva = konva;
    const container = containerRef.current;
    container.innerHTML = "";

    const stage = new Konva.Stage({ container, width: previewWidth, height: previewHeight });
    const layer = new Konva.Layer();
    const transformer = new Konva.Transformer({
      rotateEnabled: false,
      keepRatio: false,
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right", "top-center", "bottom-center"],
      anchorFill: "#06b6d4",
      anchorStroke: "#ffffff",
      borderStroke: "#06b6d4",
      borderDash: [4, 4],
    });

    stage.add(layer);

    const background = new window.Image();
    background.onload = () => {
      const bg = new Konva.Image({ image: background, x: 0, y: 0, width: previewWidth, height: previewHeight, listening: false });
      layer.add(bg);
      bg.moveToBottom();
      layer.batchDraw();
    };
    background.src = template.backgroundImage;

    const nodesByFieldId: Record<string, KonvaNode> = {};

    function commitLayout(field: CanvaTemplateField, node: KonvaNode) {
      const current = getEffectiveFieldLayout(resume, field);
      const next = pixelsToLayout(node, previewWidth, previewHeight);
      node.scaleX?.(1);
      node.scaleY?.(1);
      next.zIndex = current.zIndex;
      onFieldLayoutChange(field, next);
    }

    function select(field: CanvaTemplateField, node: KonvaNode) {
      setSelectedFieldId(field.id);
      transformer.nodes([node]);
      layer.batchDraw();
    }

    function makeSelectionFrame(rect: { width: number; height: number }) {
      return new Konva.Rect({
        x: 0,
        y: 0,
        width: rect.width,
        height: rect.height,
        stroke: "#06b6d4",
        strokeWidth: 1,
        dash: [3, 3],
        listening: false,
      });
    }

    sortedFields.forEach((field) => {
      const layout = getEffectiveFieldLayout(resume, field);
      const px = layoutToPixels(layout, previewWidth, previewHeight);
      const style = getEffectiveFieldStyle(resume, field);
      const value = getTemplateValue(data, field.sourceKey);
      const group = new Konva.Group({
        id: field.id,
        x: px.x,
        y: px.y,
        width: px.width,
        height: px.height,
        draggable: true,
      });

      const hitArea = new Konva.Rect({
        x: 0,
        y: 0,
        width: px.width,
        height: px.height,
        fill: "rgba(6,182,212,0.001)",
        stroke: selectedFieldId === field.id ? "#06b6d4" : "transparent",
        strokeWidth: selectedFieldId === field.id ? 1.5 : 0,
      });
      group.add(hitArea);

      if (field.type === "image") {
        const rawImageValue = stringifyTemplateValue(value);
        const imageSrc = rawImageValue || field.placeholderImage || PROFILE_PLACEHOLDER;
        const shouldDraw = shouldRenderTemplateImageOverlay(field, rawImageValue || undefined);
        if (shouldDraw) {
          const image = new window.Image();
          image.onload = () => {
            const imageNode = new Konva.Image({ image, x: 0, y: 0, width: px.width, height: px.height });
            group.add(imageNode);
            imageNode.moveToBottom();
            hitArea.moveToTop();
            layer.batchDraw();
          };
          image.src = imageSrc;
        } else {
          const placeholder = new Konva.Rect({ x: 0, y: 0, width: px.width, height: px.height, stroke: "#94a3b8", dash: [4, 4] });
          group.add(placeholder);
        }
      } else if (field.type === "qr") {
        group.add(
          new Konva.Rect({ x: 0, y: 0, width: px.width, height: px.height, fill: "#ffffff", stroke: "#111827", strokeWidth: 1 }),
        );
        group.add(
          new Konva.Text({ x: 0, y: px.height / 2 - 8, width: px.width, text: "QR", fontSize: Math.max(8, 12 * fontScale), align: "center", fill: "#111827" }),
        );
      } else {
        const labelOffset = field.showLabel ? Math.max(12, style.fontSize * fontScale * 1.35) : 0;
        if (field.showLabel) {
          group.add(
            new Konva.Text({
              x: 0,
              y: 0,
              width: px.width,
              height: labelOffset,
              text: getEffectiveFieldLabel(resume, field),
              fontSize: Math.max(5, style.fontSize * fontScale * 0.95),
              fontFamily: style.fontFamily,
              fontStyle: "bold",
              fill: style.color,
              listening: false,
            }),
          );
        }
        group.add(
          new Konva.Text({
            x: 0,
            y: labelOffset,
            width: px.width,
            height: Math.max(10, px.height - labelOffset),
            text: textValue(value, style.bullets || isListLikeField(field)),
            fontSize: Math.max(5, style.fontSize * fontScale),
            fontFamily: style.fontFamily,
            fontStyle: `${style.bold ? "bold" : "normal"}${style.italic ? " italic" : ""}`,
            textDecoration: `${style.underline ? "underline" : ""} ${style.strike ? "line-through" : ""}`.trim(),
            lineHeight: style.lineHeight,
            fill: style.color,
            align: style.align === "justify" ? "left" : style.align,
            wrap: "word",
            ellipsis: true,
            listening: false,
          }),
        );
      }

      if (selectedFieldId === field.id) group.add(makeSelectionFrame({ width: px.width, height: px.height }));

      group.on("mousedown touchstart", (event: KonvaEvent) => {
        event.cancelBubble = true;
        select(field, group);
      });
      group.on("dragend", () => commitLayout(field, group));
      group.on("transformend", () => commitLayout(field, group));
      group.on("dblclick dbltap", () => {
        if (!isTextField(field)) return;
        const current = stringifyTemplateValue(getTemplateValue(data, field.sourceKey));
        const next = window.prompt(isArabic ? "عدّل النص" : "Edit text", current);
        if (next === null) return;
        onFieldValueChange(field, isListLikeField(field) ? splitTemplateList(next) : next);
      });

      nodesByFieldId[field.id] = group;
      layer.add(group);
    });

    layer.add(transformer);
    if (selectedFieldId && nodesByFieldId[selectedFieldId]) {
      transformer.nodes([nodesByFieldId[selectedFieldId]]);
    }

    stage.on("mousedown touchstart", (event: KonvaEvent) => {
      if (event.target === stage) {
        setSelectedFieldId(null);
        transformer.nodes([]);
        layer.batchDraw();
      }
    });

    layer.batchDraw();
    stageRef.current = stage;

    return () => {
      stage.destroy();
      stageRef.current = null;
    };
  }, [data, fontScale, isArabic, konva, onFieldLayoutChange, onFieldValueChange, previewHeight, previewWidth, resume, selectedFieldId, sortedFields, template.backgroundImage]);

  const selectedField = selectedFieldId ? fieldsById[selectedFieldId] : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white/90 p-2 shadow-sm dark:border-white/10 dark:bg-zinc-950/80">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Badge>
            {isArabic ? "محرر Konva مجاني" : "Free Konva editor"}
          </Badge>
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold text-cyan-700 dark:text-cyan-200">
            <MousePointer2 className="size-3" />
            {isArabic ? "اسحب · كبّر · دبل كلك لتعديل النص" : "Drag · resize · double-click text"}
          </span>
          {selectedField ? (
            <span className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isArabic ? "المحدد:" : "Selected:"} {getEffectiveFieldLabel(resume, selectedField)}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setZoom((value) => Math.max(0.45, Number((value - 0.1).toFixed(2))))}>
            <Minus className="size-3.5" />
          </Button>
          <span className="min-w-14 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            {Math.round(zoom * 100)}%
          </span>
          <Button size="sm" variant="secondary" onClick={() => setZoom((value) => Math.min(1.8, Number((value + 0.1).toFixed(2))))}>
            <Plus className="size-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setZoom(0.82)}>
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-200">
          <div className="mb-1 flex items-center gap-2 font-bold">
            <AlertTriangle className="size-4" />
            {isArabic ? "لم يتم تحميل مكتبة Konva" : "Konva library did not load"}
          </div>
          <p>{error}</p>
          <p className="mt-1 text-xs">
            {isArabic
              ? "استخدم وضع HTML كبديل، أو اسمح بالوصول إلى CDN، أو ثبّت Konva محليًا لاحقًا."
              : "Use HTML mode as a fallback, allow the CDN, or self-host Konva later."}
          </p>
        </div>
      ) : null}

      <div className="max-h-[calc(100vh-12rem)] overflow-auto rounded-xl border border-slate-200 bg-stone-100 p-5 shadow-inner dark:border-white/10 dark:bg-zinc-950">
        {!konva && !error ? (
          <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-zinc-950 dark:text-slate-300">
            {isArabic ? "جاري تحميل محرر Konva المجاني..." : "Loading the free Konva editor..."}
          </div>
        ) : (
          <div className="mx-auto overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-white/10" style={{ width: previewWidth }}>
            <div ref={containerRef} />
          </div>
        )}
      </div>

      <p className="flex items-center gap-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
        <ExternalLink className="size-3.5" />
        {isArabic
          ? "Konva مكتبة Canvas مفتوحة المصدر وليست Polotno SDK المدفوع. التصدير النهائي PDF لا يزال يستخدم محرك القوالب الحالي."
          : "Konva is an open-source Canvas library, not the paid Polotno SDK. Final PDF export still uses the existing template renderer."}
      </p>
    </div>
  );
}
