"use client";

import Image from "next/image";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlertTriangle,
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Bold,
  CaseSensitive,
  Group,
  Italic,
  Link as LinkIcon,
  List,
  Minus,
  Move,
  Plus,
  RotateCcw,
  Strikethrough,
  Trash2,
  Underline,
  Ungroup,
} from "lucide-react";
import type {
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/layout/language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createQrDataUrl } from "@/lib/qr";
import {
  exceedsLines,
  getEffectiveFieldLabel,
  getEffectiveFieldLayout,
  getEffectiveFieldLink,
  getEffectiveFieldStyle,
  getEffectiveFieldHtml,
  getTemplateData,
  getTemplateFieldState,
  getTemplateValue,
  isListLikeField,
  isTemplateFieldEnabled,
  linkHref,
  htmlToPlainText,
  PROFILE_PLACEHOLDER,
  sanitizeRichHtml,
  stringifyTemplateValue,
} from "@/lib/template-data";
import type { Resume } from "@/types";
import type {
  CanvaResumeTemplate,
  CanvaTemplateField,
  CanvaTemplateFieldLayout,
  CanvaTemplateFieldState,
  CanvaTemplateValue,
} from "@/types/template";

const A4_PREVIEW_BASE_WIDTH = 720;
const A4_PDF_WIDTH = 595.28;
const A4_RATIO = 297 / 210;

type RequiredLayout = Required<CanvaTemplateFieldLayout>;

type ContextMenuState = {
  x: number;
  y: number;
  fieldId: string;
} | null;

type SelectionBox = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
} | null;

type SavedTextSelection = {
  fieldId: string;
  start: number;
  end: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundLayout(value: number) {
  return Number(value.toFixed(2));
}

function fieldText(resume: Resume, field: CanvaTemplateField) {
  return stringifyTemplateValue(
    getTemplateValue(getTemplateData(resume), field.sourceKey),
  );
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

function firstUrl(value: string) {
  return value.match(/https?:\/\/[^\s)]+/)?.[0] ?? "";
}

function estimateWrappedLines(
  lines: string[],
  boxWidthPx: number,
  fontSizePx: number,
) {
  const avgCharWidth = Math.max(fontSizePx * 0.52, 3);
  const charsPerLine = Math.max(4, Math.floor(boxWidthPx / avgCharWidth));
  return lines.reduce(
    (total, line) => total + Math.max(1, Math.ceil(line.length / charsPerLine)),
    0,
  );
}

function fitFontSize({
  value,
  field,
  layout,
  baseFontSize,
  previewWidth,
  lineHeight,
  bullets,
}: {
  value: CanvaTemplateValue;
  field: CanvaTemplateField;
  layout: RequiredLayout;
  baseFontSize: number;
  previewWidth: number;
  lineHeight: number;
  bullets: boolean;
}) {
  const boxWidthPx = Math.max((layout.width / 100) * previewWidth, 20);
  const boxHeightPx = Math.max(
    (layout.height / 100) * previewWidth * A4_RATIO,
    20,
  );
  const headingReserve = field.showLabel ? baseFontSize * 1.65 : 0;
  const availableHeight = Math.max(boxHeightPx - headingReserve, 12);
  const lines = toLines(value, bullets || isListLikeField(field));
  if (!lines.length) return baseFontSize;

  let fontSize = baseFontSize;
  while (fontSize > 4.5) {
    const visualLines = estimateWrappedLines(lines, boxWidthPx, fontSize);
    if (visualLines * fontSize * lineHeight <= availableHeight) return fontSize;
    fontSize -= 0.35;
  }
  return Math.max(4.5, fontSize);
}

function renderContent(
  value: CanvaTemplateValue,
  field: CanvaTemplateField,
  bullets: boolean,
) {
  const lines = toLines(value, bullets || isListLikeField(field));
  if (lines.length <= 1 && !bullets) {
    const text = stringifyTemplateValue(value);
    const url = firstUrl(text);
    return url ? (
      <a href={url} target="_blank" rel="noreferrer" className="underline">
        {text}
      </a>
    ) : (
      text
    );
  }
  return lines.map((line) => {
    const url = firstUrl(line);
    return url ? (
      <a
        key={line}
        href={url}
        target="_blank"
        rel="noreferrer"
        className="block underline"
      >
        {line}
      </a>
    ) : (
      <span key={line} className="block">
        {line}
      </span>
    );
  });
}

function rectsIntersect(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function selectionBoxToRect(box: NonNullable<SelectionBox>) {
  const x = Math.min(box.startX, box.endX);
  const y = Math.min(box.startY, box.endY);
  return {
    x,
    y,
    width: Math.abs(box.endX - box.startX),
    height: Math.abs(box.endY - box.startY),
  };
}

function eventToPercent(event: MouseEvent | ReactMouseEvent, rect: DOMRect) {
  return {
    x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
    y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

const TEXT_FIELD_TYPES = new Set([
  "text",
  "textarea",
  "list",
  "experience-list",
  "education-list",
  "project-list",
  "language-list",
  "email",
  "phone",
  "link",
]);

const FONT_FAMILIES = [
  "Open Sans",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Tajawal",
];

function isTextEditableField(field: CanvaTemplateField) {
  return TEXT_FIELD_TYPES.has(field.type);
}

function textNodesIn(root: HTMLElement) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walker.nextNode();
  }
  return nodes;
}

function nodeOffsetToTextOffset(root: HTMLElement, node: Node, offset: number) {
  try {
    const preRange = document.createRange();
    preRange.selectNodeContents(root);
    preRange.setEnd(node, offset);
    return preRange.toString().length;
  } catch {
    return 0;
  }
}

function rangeToTextOffsets(root: HTMLElement, range: Range) {
  const start = nodeOffsetToTextOffset(
    root,
    range.startContainer,
    range.startOffset,
  );
  const end = nodeOffsetToTextOffset(root, range.endContainer, range.endOffset);
  return { start: Math.min(start, end), end: Math.max(start, end) };
}

function setSelectionByTextOffsets(
  root: HTMLElement,
  start: number,
  end: number,
) {
  const selection = window.getSelection();
  if (!selection) return false;
  const nodes = textNodesIn(root);
  if (!nodes.length) return false;

  let current = 0;
  let startNode: Text | null = null;
  let endNode: Text | null = null;
  let startOffset = 0;
  let endOffset = 0;

  for (const node of nodes) {
    const length = node.textContent?.length ?? 0;
    const next = current + length;

    if (!startNode && start >= current && start <= next) {
      startNode = node;
      startOffset = Math.max(0, Math.min(length, start - current));
    }

    if (!endNode && end >= current && end <= next) {
      endNode = node;
      endOffset = Math.max(0, Math.min(length, end - current));
      break;
    }

    current = next;
  }

  if (!startNode) {
    startNode = nodes[0];
    startOffset = 0;
  }
  if (!endNode) {
    endNode = nodes[nodes.length - 1];
    endOffset = endNode.textContent?.length ?? 0;
  }

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

type TextNodeSegment = {
  node: Text;
  start: number;
  end: number;
};

function textSegmentsForOffsets(root: HTMLElement, start: number, end: number) {
  const nodes = textNodesIn(root);
  const segments: TextNodeSegment[] = [];
  let current = 0;

  for (const node of nodes) {
    const length = node.textContent?.length ?? 0;
    const nodeStart = current;
    const nodeEnd = current + length;
    const from = Math.max(start, nodeStart);
    const to = Math.min(end, nodeEnd);

    if (to > from) {
      segments.push({
        node,
        start: from - nodeStart,
        end: to - nodeStart,
      });
    }

    current = nodeEnd;
  }

  return segments;
}

function applyStyleToTextOffsets(
  root: HTMLElement,
  start: number,
  end: number,
  style: CSSProperties,
) {
  if (start === end) return false;
  const segments = textSegmentsForOffsets(root, start, end);
  if (!segments.length) return false;

  // Mutate from the end to the beginning so splitting one text node does not
  // change offsets for the segments that still need to be wrapped.
  for (const segment of [...segments].reverse()) {
    const originalText = segment.node.textContent ?? "";
    if (!originalText) continue;

    let selectedNode: Text = segment.node;
    if (segment.end < originalText.length) selectedNode.splitText(segment.end);
    if (segment.start > 0) selectedNode = selectedNode.splitText(segment.start);

    const parent = selectedNode.parentNode;
    if (!parent) continue;

    const wrapper = document.createElement("span");
    Object.entries(
      style as Record<string, string | number | undefined>,
    ).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      (wrapper.style as unknown as Record<string, string>)[key] = String(value);
    });
    parent.insertBefore(wrapper, selectedNode);
    wrapper.appendChild(selectedNode);
  }

  return true;
}

function wrapTextOffsetsWithElement(
  root: HTMLElement,
  start: number,
  end: number,
  elementFactory: () => HTMLElement,
) {
  if (start === end) return false;
  const segments = textSegmentsForOffsets(root, start, end);
  if (!segments.length) return false;

  for (const segment of [...segments].reverse()) {
    const originalText = segment.node.textContent ?? "";
    if (!originalText) continue;

    let selectedNode: Text = segment.node;
    if (segment.end < originalText.length) selectedNode.splitText(segment.end);
    if (segment.start > 0) selectedNode = selectedNode.splitText(segment.start);

    const parent = selectedNode.parentNode;
    if (!parent) continue;

    const wrapper = elementFactory();
    parent.insertBefore(wrapper, selectedNode);
    wrapper.appendChild(selectedNode);
  }

  return true;
}

function normalizeEditorHtml(html: string) {
  return sanitizeRichHtml(html)
    .replace(/<div><br><\/div>/g, "<br>")
    .replace(/<div>/g, "<br>")
    .replace(/<\/div>/g, "");
}

function selectionInside(element: HTMLElement | null): element is HTMLElement {
  if (!element) return false;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  return element.contains(range.commonAncestorContainer);
}

function preventToolbarBlur(event: ReactMouseEvent) {
  event.preventDefault();
}

function clearBrowserSelection() {
  const selection = window.getSelection?.();
  if (selection && selection.rangeCount > 0) selection.removeAllRanges();
}

export function TemplateLivePreview({
  template,
  resume,
  onFieldLayoutChange,
  onFieldStateChange,
  onFieldValueClear,
  onFieldValueChange,
}: {
  template: CanvaResumeTemplate;
  resume: Resume;
  onFieldLayoutChange?: (
    field: CanvaTemplateField,
    layout: RequiredLayout,
  ) => void;
  onFieldStateChange?: (
    field: CanvaTemplateField,
    patch: CanvaTemplateFieldState,
  ) => void;
  onFieldValueClear?: (field: CanvaTemplateField) => void;
  onFieldValueChange?: (
    field: CanvaTemplateField,
    value: CanvaTemplateValue,
  ) => void;
}) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const data = useMemo(() => getTemplateData(resume), [resume]);
  const qrSource =
    stringifyTemplateValue(data.qr) ||
    stringifyTemplateValue(data.portfolioUrl);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [zoom, setZoom] = useState(0.82);
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<SelectionBox>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [activeRichFieldId, setActiveRichFieldId] = useState<string | null>(
    null,
  );
  const [textEditFieldId, setTextEditFieldId] = useState<string | null>(null);
  const [toolbarFontSize, setToolbarFontSize] = useState(12);
  const editorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const savedSelectionRef = useRef<SavedTextSelection | null>(null);
  const [interaction, setInteraction] = useState<{
    field: CanvaTemplateField;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    startLayouts: Record<string, RequiredLayout>;
    selectedIds: string[];
  } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewWidth = Math.round(A4_PREVIEW_BASE_WIDTH * zoom);
  const fontScale = previewWidth / A4_PDF_WIDTH;
  const editable = Boolean(onFieldLayoutChange);

  function activeTextFieldIds() {
    const ids = selectedFieldIds.filter((id) => {
      const field = fieldsById[id];
      return field ? isTextEditableField(field) : false;
    });
    if (ids.length > 0) return ids;
    return activeRichFieldId && fieldsById[activeRichFieldId]
      ? [activeRichFieldId]
      : [];
  }

  function patchSelectedFieldStyle(patch: NonNullable<CanvaTemplateFieldState["style"]>) {
    if (!onFieldStateChange) return;
    activeTextFieldIds().forEach((id) => {
      const field = fieldsById[id];
      if (!field) return;
      onFieldStateChange(field, {
        style: patch,
        richTextHtml: undefined,
      });
    });
  }

  const enabledFields = useMemo(
    () =>
      template.fields.filter((field) => isTemplateFieldEnabled(resume, field)),
    [template.fields, resume],
  );

  const fieldsById = useMemo(
    () =>
      Object.fromEntries(
        template.fields.map((field) => [field.id, field]),
      ) as Record<string, CanvaTemplateField>,
    [template.fields],
  );

  function getFieldGroupIds(field: CanvaTemplateField) {
    const groupId = getTemplateFieldState(resume, field).groupId;
    if (!groupId) return [field.id];
    return enabledFields
      .filter(
        (candidate) =>
          getTemplateFieldState(resume, candidate).groupId === groupId,
      )
      .map((candidate) => candidate.id);
  }

  function selectField(field: CanvaTemplateField, event: ReactMouseEvent) {
    if (!editable) return;

    // Single click = layout selection mode. Text editing is intentionally disabled
    // until the user double-clicks a text box, similar to Canva/Figma behavior.
    if (textEditFieldId !== field.id) {
      setTextEditFieldId(null);
      setActiveRichFieldId(null);
      savedRangeRef.current = null;
      savedSelectionRef.current = null;
      clearBrowserSelection();
    }

    const groupIds = getFieldGroupIds(field);
    const additive = event.ctrlKey || event.metaKey;

    setSelectedFieldIds((current) => {
      if (!additive) return groupIds;
      const alreadySelected = groupIds.every((id) => current.includes(id));
      return alreadySelected
        ? current.filter((id) => !groupIds.includes(id))
        : unique([...current, ...groupIds]);
    });
  }

  function enterTextEditMode(
    field: CanvaTemplateField,
    event?: ReactMouseEvent,
  ) {
    if (!editable || !isTextEditableField(field)) return;
    event?.preventDefault();
    event?.stopPropagation();
    setContextMenu(null);
    setSelectedFieldIds(getFieldGroupIds(field));
    setTextEditFieldId(field.id);
    setActiveRichFieldId(field.id);
    window.setTimeout(() => {
      const editor = editorRefs.current[field.id];
      editor?.focus();
      saveCurrentSelection(field.id);
    }, 0);
  }

  function leaveTextEditMode() {
    setTextEditFieldId(null);
    setActiveRichFieldId(null);
    savedRangeRef.current = null;
    savedSelectionRef.current = null;
  }

  function selectAllEditorText(fieldId: string) {
    const editor = editorRefs.current[fieldId];
    if (!editor) return;
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();
    savedSelectionRef.current = {
      fieldId,
      start: 0,
      end: editor.textContent?.length ?? 0,
    };
  }

  function updateSelectedZ(action: "front" | "forward" | "backward" | "back") {
    if (!onFieldStateChange || selectedFieldIds.length === 0) return;
    const layouts = enabledFields.map((field) =>
      getEffectiveFieldLayout(resume, field),
    );
    const maxZ = Math.max(...layouts.map((layout) => layout.zIndex), 1);
    const minZ = Math.min(...layouts.map((layout) => layout.zIndex), 1);

    selectedFieldIds.forEach((id, index) => {
      const field = fieldsById[id];
      if (!field) return;
      const layout = getEffectiveFieldLayout(resume, field);
      const nextZ =
        action === "front"
          ? maxZ + 1 + index
          : action === "back"
            ? Math.max(1, minZ - 1 - index)
            : action === "forward"
              ? layout.zIndex + 1
              : Math.max(1, layout.zIndex - 1);
      onFieldStateChange(field, { layout: { zIndex: nextZ } });
    });
  }

  function groupSelection() {
    if (!onFieldStateChange || selectedFieldIds.length < 2) return;
    const groupId = `group-${Date.now()}`;
    selectedFieldIds.forEach((id) => {
      const field = fieldsById[id];
      if (field) onFieldStateChange(field, { groupId });
    });
  }

  function ungroupSelection() {
    if (!onFieldStateChange || selectedFieldIds.length === 0) return;
    selectedFieldIds.forEach((id) => {
      const field = fieldsById[id];
      if (field) onFieldStateChange(field, { groupId: undefined });
    });
  }

  function editSelectedFieldLink() {
    if (!onFieldStateChange || selectedFieldIds.length !== 1) return;
    const field = fieldsById[selectedFieldIds[0]];
    if (!field) return;
    const current = getTemplateFieldState(resume, field).linkOverride ?? "";
    const next = window.prompt(
      isArabic
        ? "أدخل الرابط الذي تريد ربط هذا القسم به في PDF"
        : "Enter the hyperlink for this section in the PDF",
      current,
    );
    if (next === null) return;
    onFieldStateChange(field, { linkOverride: next.trim() || undefined });
  }

  function clearSelectedContent() {
    if (!onFieldValueClear) return;
    selectedFieldIds.forEach((id) => {
      const field = fieldsById[id];
      if (field) {
        onFieldValueClear(field);
        onFieldStateChange?.(field, { richTextHtml: undefined });
      }
    });
  }

  function activeEditor() {
    return activeRichFieldId
      ? (editorRefs.current[activeRichFieldId] ?? null)
      : null;
  }

  function saveCurrentSelection(fieldId = activeRichFieldId) {
    if (!fieldId) return;
    const editor = editorRefs.current[fieldId];
    if (!selectionInside(editor)) return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editor) {
      const range = selection.getRangeAt(0);
      savedRangeRef.current = range.cloneRange();
      savedSelectionRef.current = {
        fieldId,
        ...rangeToTextOffsets(editor, range),
      };
    }
  }

  function restoreCurrentSelection() {
    const editor = activeEditor();
    if (!editor || !activeRichFieldId) return false;
    const selection = window.getSelection();
    if (!selection) return false;

    editor.focus({ preventScroll: true });

    // First try the durable text-offset selection. This survives toolbar focus,
    // input/select focus, and React re-renders better than a DOM Range because
    // a Range points to old text nodes after the editor updates.
    const savedSelection = savedSelectionRef.current;
    if (savedSelection?.fieldId === activeRichFieldId) {
      const ok = setSelectionByTextOffsets(
        editor,
        savedSelection.start,
        savedSelection.end,
      );
      if (ok) {
        const restored = window.getSelection();
        if (restored?.rangeCount) {
          savedRangeRef.current = restored.getRangeAt(0).cloneRange();
        }
        return true;
      }
    }

    if (savedRangeRef.current) {
      try {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current.cloneRange());
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  function persistEditorHtml(field: CanvaTemplateField) {
    const editor = editorRefs.current[field.id];
    if (!editor || !onFieldStateChange) return;
    const html = normalizeEditorHtml(editor.innerHTML);
    onFieldStateChange(field, { richTextHtml: html || undefined });
    onFieldValueChange?.(
      field,
      isListLikeField(field)
        ? htmlToPlainText(html).split("\n").filter(Boolean)
        : htmlToPlainText(html),
    );
  }

  function saveSelectionAfterMutation(field: CanvaTemplateField) {
    const editor = editorRefs.current[field.id];
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    savedRangeRef.current = range.cloneRange();
    savedSelectionRef.current = {
      fieldId: field.id,
      ...rangeToTextOffsets(editor, range),
    };
  }

  function selectionPayload() {
    const field = activeRichFieldId ? fieldsById[activeRichFieldId] : undefined;
    const editor = activeEditor();
    const saved = savedSelectionRef.current;

    if (!field || !editor || !saved || saved.fieldId !== field.id) return null;
    const start = Math.min(saved.start, saved.end);
    const end = Math.max(saved.start, saved.end);
    if (start === end) return null;

    return { field, editor, start, end };
  }

  function runEditorCommand(command: string, value?: string) {
    const field = activeRichFieldId ? fieldsById[activeRichFieldId] : undefined;
    if (!field) return;

    const inlineStyles: Record<string, CSSProperties> = {
      bold: { fontWeight: "700" },
      italic: { fontStyle: "italic" },
      underline: { textDecoration: "underline" },
      strikeThrough: { textDecoration: "line-through" },
    };

    if (inlineStyles[command]) {
      applyInlineStyle(inlineStyles[command]);
      return;
    }

    if (!restoreCurrentSelection()) return;
    document.execCommand(command, false, value);
    saveSelectionAfterMutation(field);
    persistEditorHtml(field);
  }

  function applyInlineStyle(style: CSSProperties) {
    const payload = selectionPayload();
    if (!payload) return;

    const applied = applyStyleToTextOffsets(
      payload.editor,
      payload.start,
      payload.end,
      style,
    );
    if (!applied) return;

    setSelectionByTextOffsets(payload.editor, payload.start, payload.end);
    saveSelectionAfterMutation(payload.field);
    persistEditorHtml(payload.field);
  }

  function transformSelectedText() {
    const field = activeRichFieldId ? fieldsById[activeRichFieldId] : undefined;
    if (!field || !restoreCurrentSelection()) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
      return;
    const current = selection.toString();
    const replacement =
      current === current.toUpperCase()
        ? current.toLowerCase()
        : current.toUpperCase();
    document.execCommand("insertText", false, replacement);
    saveSelectionAfterMutation(field);
    persistEditorHtml(field);
  }

  function editSelectedTextLink() {
    const payload = selectionPayload();
    if (!payload) return;
    const href = window.prompt(
      isArabic ? "أدخل الرابط للنص المحدد" : "Enter link for selected text",
      "https://",
    );
    if (!href) return;

    const applied = wrapTextOffsetsWithElement(
      payload.editor,
      payload.start,
      payload.end,
      () => {
        const link = document.createElement("a");
        link.href = href.trim();
        link.target = "_blank";
        link.rel = "noreferrer";
        link.style.textDecoration = "underline";
        return link;
      },
    );
    if (!applied) return;

    setSelectionByTextOffsets(payload.editor, payload.start, payload.end);
    saveSelectionAfterMutation(payload.field);
    persistEditorHtml(payload.field);
  }

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
    function onSelectionChange() {
      if (!activeRichFieldId) return;
      const editor = editorRefs.current[activeRichFieldId];
      if (!selectionInside(editor)) return;
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        savedRangeRef.current = range.cloneRange();
        savedSelectionRef.current = {
          fieldId: activeRichFieldId,
          ...rangeToTextOffsets(editor, range),
        };
      }
    }

    document.addEventListener("selectionchange", onSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", onSelectionChange);
  }, [activeRichFieldId]);

  useEffect(() => {
    if (!interaction || !previewRef.current || !onFieldLayoutChange) return;
    const activeInteraction = interaction;
    const applyLayoutChange = onFieldLayoutChange;

    function onMove(event: MouseEvent) {
      const rect = previewRef.current?.getBoundingClientRect();
      if (!rect) return;
      const deltaX =
        ((event.clientX - activeInteraction.startX) / rect.width) * 100;
      const deltaY =
        ((event.clientY - activeInteraction.startY) / rect.height) * 100;

      if (activeInteraction.mode === "move") {
        activeInteraction.selectedIds.forEach((id) => {
          const field = fieldsById[id];
          const start = activeInteraction.startLayouts[id];
          if (!field || !start) return;
          const nextLayout = {
            ...start,
            x: roundLayout(clamp(start.x + deltaX, 0, 100 - start.width)),
            y: roundLayout(clamp(start.y + deltaY, 0, 100 - start.height)),
          };
          applyLayoutChange(field, nextLayout);
        });
        return;
      }

      const start = activeInteraction.startLayouts[activeInteraction.field.id];
      if (!start) return;
      const nextLayout = {
        ...start,
        width: roundLayout(clamp(start.width + deltaX, 3, 100 - start.x)),
        height: roundLayout(clamp(start.height + deltaY, 2, 100 - start.y)),
      };
      applyLayoutChange(activeInteraction.field, nextLayout);
    }

    function onUp() {
      setInteraction(null);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [fieldsById, interaction, onFieldLayoutChange]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = Boolean(
        target?.closest("input, textarea, select, [contenteditable='true']"),
      );
      if (typing) return;

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedFieldIds.length > 0
      ) {
        event.preventDefault();
        clearSelectedContent();
      }
      if (event.key === "Escape") {
        setSelectedFieldIds([]);
        leaveTextEditMode();
        setContextMenu(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedFieldIds]);

  useEffect(() => {
    function closeMenu() {
      setContextMenu(null);
    }
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const warnings = template.fields.flatMap((field) => {
    if (!isTemplateFieldEnabled(resume, field)) return [];
    const value = fieldText(resume, field);
    const fieldWarnings: string[] = [];
    if (field.required && !value.trim()) {
      fieldWarnings.push(
        isArabic
          ? `الحقل ${getEffectiveFieldLabel(resume, field)} مطلوب`
          : `${getEffectiveFieldLabel(resume, field)} is required`,
      );
    }
    if (field.maxChars && value.length > field.maxChars) {
      fieldWarnings.push(
        isArabic
          ? `الحقل ${getEffectiveFieldLabel(resume, field)} تجاوز ${field.maxChars} حرف`
          : `${getEffectiveFieldLabel(resume, field)} exceeds ${field.maxChars} chars`,
      );
    }
    if (exceedsLines(value, field.maxLines)) {
      fieldWarnings.push(
        isArabic
          ? `الحقل ${getEffectiveFieldLabel(resume, field)} تجاوز ${field.maxLines} أسطر`
          : `${getEffectiveFieldLabel(resume, field)} exceeds ${field.maxLines} lines`,
      );
    }
    return fieldWarnings;
  });

  function startInteraction(
    mode: "move" | "resize",
    field: CanvaTemplateField,
    event: ReactMouseEvent,
  ) {
    if (!editable) return;
    event.preventDefault();
    event.stopPropagation();
    setContextMenu(null);
    if (textEditFieldId !== field.id) clearBrowserSelection();

    if (!selectedFieldIds.includes(field.id)) {
      selectField(field, event);
    }

    const nextSelected = selectedFieldIds.includes(field.id)
      ? selectedFieldIds
      : getFieldGroupIds(field);
    const startLayouts = Object.fromEntries(
      nextSelected.map((id) => {
        const selectedField = fieldsById[id];
        return [
          id,
          selectedField
            ? getEffectiveFieldLayout(resume, selectedField)
            : getEffectiveFieldLayout(resume, field),
        ];
      }),
    ) as Record<string, RequiredLayout>;

    setInteraction({
      field,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startLayouts,
      selectedIds: mode === "move" ? nextSelected : [field.id],
    });
  }

  function onPreviewMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (!editable || event.button !== 0 || !previewRef.current) return;
    if (event.shiftKey) {
      event.preventDefault();
      const rect = previewRef.current.getBoundingClientRect();
      const point = eventToPercent(event, rect);
      setSelectionBox({
        startX: point.x,
        startY: point.y,
        endX: point.x,
        endY: point.y,
      });
      setSelectedFieldIds([]);
      return;
    }
    if (event.target === previewRef.current) {
      setSelectedFieldIds([]);
      leaveTextEditMode();
      setContextMenu(null);
    }
  }

  useEffect(() => {
    if (!selectionBox || !previewRef.current) return;
    const activeSelectionBox = selectionBox;

    function onMove(event: MouseEvent) {
      const rect = previewRef.current?.getBoundingClientRect();
      if (!rect) return;
      const point = eventToPercent(event, rect);
      const nextBox = { ...activeSelectionBox, endX: point.x, endY: point.y };
      const selectionRect = selectionBoxToRect(nextBox);
      setSelectionBox(nextBox);
      setSelectedFieldIds(
        enabledFields
          .filter((field) =>
            rectsIntersect(
              getEffectiveFieldLayout(resume, field),
              selectionRect,
            ),
          )
          .map((field) => field.id),
      );
    }

    function onUp() {
      setSelectionBox(null);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [enabledFields, resume, selectionBox]);

  const sortedFields = [...enabledFields].sort(
    (a, b) =>
      getEffectiveFieldLayout(resume, a).zIndex -
      getEffectiveFieldLayout(resume, b).zIndex,
  );
  const canGroup = selectedFieldIds.length > 1;
  const selectedRichField =
    selectedFieldIds.map((id) => fieldsById[id]).find((field) => field && isTextEditableField(field)) ??
    (activeRichFieldId ? fieldsById[activeRichFieldId] : undefined);
  const selectedRichStyle = selectedRichField
    ? getEffectiveFieldStyle(resume, selectedRichField)
    : undefined;
  const selectedHasGroup = selectedFieldIds.some((id) => {
    const field = fieldsById[id];
    return Boolean(field && getTemplateFieldState(resume, field).groupId);
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white/90 p-2 shadow-sm dark:border-white/10 dark:bg-zinc-950/80">
        {warnings.length ? (
          <div className="min-w-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-200">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4" />
              {isArabic ? "تنبيهات القالب" : "Template warnings"}
            </div>
            <ul className="mt-1 list-disc ps-5">
              {warnings.slice(0, 3).map((warning) => (
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

        <div className="flex items-center gap-2">
          {editable ? (
            <span className="hidden items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold text-cyan-700 dark:text-cyan-200 sm:inline-flex">
              <Move className="size-3" />
              {isArabic
                ? "Click: تحديد · Ctrl: متعدد · Shift+Drag: مربع تحديد"
                : "Click: select · Ctrl: multi-select · Shift+drag: marquee"}
            </span>
          ) : null}
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              setZoom((value) =>
                Math.max(0.45, Number((value - 0.1).toFixed(2))),
              )
            }
          >
            <Minus className="size-3.5" />
          </Button>
          <span className="min-w-14 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              setZoom((value) =>
                Math.min(1.8, Number((value + 0.1).toFixed(2))),
              )
            }
          >
            <Plus className="size-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setZoom(0.82)}>
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </div>

      {editable &&
      selectedRichField &&
      isTextEditableField(selectedRichField) ? (
        <div
          ref={toolbarRef}
          className="sticky top-0 z-[1200] flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur dark:border-white/10 dark:bg-zinc-950/95"
          onMouseDownCapture={(event) => {
            // Save the user's text selection before any toolbar control receives
            // focus. Buttons should not steal focus, while inputs/selects are
            // allowed to open normally and the saved range is restored on action.
            if (activeRichFieldId) saveCurrentSelection(activeRichFieldId);
            const target = event.target as HTMLElement;
            if (!target.closest("input, select")) event.preventDefault();
          }}
        >
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
            value={selectedRichStyle?.fontFamily ?? "Open Sans"}
            onChange={(event) =>
              patchSelectedFieldStyle({ fontFamily: event.target.value })
            }
            title={isArabic ? "نوع الخط" : "Font family"}
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
          <div className="flex h-9 items-center overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
            <button
              type="button"
              className="px-3 text-lg"
              onMouseDown={preventToolbarBlur}
              onClick={() => {
                const next = Math.max(5, (selectedRichStyle?.fontSize ?? 12) - 1);
                setToolbarFontSize(next);
                patchSelectedFieldStyle({ fontSize: next });
              }}
            >
              −
            </button>
            <input
              className="h-full w-14 border-x border-slate-200 bg-transparent text-center text-sm font-semibold outline-none dark:border-white/10"
              type="number"
              min={5}
              max={72}
              value={selectedRichStyle?.fontSize ?? toolbarFontSize}
              onChange={(event) => {
                const next = Number(event.target.value) || 12;
                setToolbarFontSize(next);
                patchSelectedFieldStyle({ fontSize: next });
              }}
              title={isArabic ? "حجم الخط للنص المحدد" : "Selected text size"}
            />
            <button
              type="button"
              className="px-3 text-lg"
              onMouseDown={preventToolbarBlur}
              onClick={() => {
                const next = Math.min(72, (selectedRichStyle?.fontSize ?? 12) + 1);
                setToolbarFontSize(next);
                patchSelectedFieldStyle({ fontSize: next });
              }}
            >
              +
            </button>
          </div>
          <label
            className="flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2 dark:border-white/10"
            title={isArabic ? "لون النص المحدد" : "Selected text color"}
          >
            <span className="font-black underline decoration-2">A</span>
            <input
              type="color"
              className="h-6 w-7 cursor-pointer bg-transparent"
              value={selectedRichStyle?.color ?? "#111827"}
              onChange={(event) =>
                patchSelectedFieldStyle({ color: event.target.value })
              }
            />
          </label>
          <ToolbarButton title="Bold" active={Boolean(selectedRichStyle?.bold)} onClick={() => patchSelectedFieldStyle({ bold: !selectedRichStyle?.bold })}>
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Italic"
            active={Boolean(selectedRichStyle?.italic)}
            onClick={() => patchSelectedFieldStyle({ italic: !selectedRichStyle?.italic })}
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Underline"
            active={Boolean(selectedRichStyle?.underline)}
            onClick={() => patchSelectedFieldStyle({ underline: !selectedRichStyle?.underline })}
          >
            <Underline className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Strike"
            active={Boolean(selectedRichStyle?.strike)}
            onClick={() => patchSelectedFieldStyle({ strike: !selectedRichStyle?.strike })}
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Uppercase / lowercase"
            active={selectedRichStyle?.textTransform === "uppercase"}
            onClick={() =>
                patchSelectedFieldStyle({
                  textTransform:
                    selectedRichStyle?.textTransform === "uppercase"
                      ? "none"
                      : "uppercase",
                })
              }
          >
            <CaseSensitive className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Align left"
            active={selectedRichStyle?.align === "left"}
            onClick={() => patchSelectedFieldStyle({ align: "left" })}
          >
            <AlignLeft className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Align center"
            active={selectedRichStyle?.align === "center"}
            onClick={() => patchSelectedFieldStyle({ align: "center" })}
          >
            <AlignCenter className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Align right"
            active={selectedRichStyle?.align === "right"}
            onClick={() => patchSelectedFieldStyle({ align: "right" })}
          >
            <AlignRight className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Justify"
            active={selectedRichStyle?.align === "justify"}
            onClick={() => patchSelectedFieldStyle({ align: "justify" })}
          >
            <AlignJustify className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Bullets"
            active={Boolean(selectedRichStyle?.bullets)}
            onClick={() => patchSelectedFieldStyle({ bullets: !selectedRichStyle?.bullets })}
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Edit selected text link"
            onClick={editSelectedTextLink}
          >
            <LinkIcon className="size-4" />
          </ToolbarButton>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isArabic
              ? "اختر مربعًا ثم استخدم هذا الشريط لتعديل نفس الحقل في اللوحة الجانبية"
              : "Select a box, then use this toolbar to style the same field shown in the side editor"}
          </span>
        </div>
      ) : null}

      <div className="max-h-[calc(100vh-12rem)] overflow-auto rounded-xl border border-slate-200 bg-stone-100 p-5 shadow-inner dark:border-white/10 dark:bg-zinc-950">
        <div className="mx-auto" style={{ width: `${previewWidth}px` }}>
          <div
            ref={previewRef}
            className="relative aspect-[210/297] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-white/10"
            onMouseDown={onPreviewMouseDown}
          >
            <Image
              src={template.backgroundImage}
              alt={template.name}
              fill
              className="pointer-events-none select-none object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
              priority
            />
            {sortedFields.map((field) => {
              const value = getTemplateValue(data, field.sourceKey);
              const styleState = getEffectiveFieldStyle(resume, field);
              const layout = getEffectiveFieldLayout(resume, field);
              const baseFontSize = Math.max(
                4.5,
                styleState.fontSize * fontScale,
              );
              const fontSize = styleState.autoFit
                ? fitFontSize({
                    value,
                    field,
                    layout,
                    baseFontSize,
                    previewWidth,
                    lineHeight: styleState.lineHeight,
                    bullets: styleState.bullets,
                  })
                : baseFontSize;
              const isSelected = selectedFieldIds.includes(field.id);
              const isTextEditing = textEditFieldId === field.id;
              const boxStyle = {
                left: `${layout.x}%`,
                top: `${layout.y}%`,
                width: `${layout.width}%`,
                height: `${layout.height}%`,
                fontSize: `${fontSize}px`,
                color: styleState.color,
                textAlign: styleState.align,
                fontWeight: styleState.bold ? 700 : 400,
                fontStyle: styleState.italic ? "italic" : "normal",
                textDecoration:
                  `${styleState.underline ? "underline" : ""} ${styleState.strike ? "line-through" : ""}`.trim() ||
                  "none",
                lineHeight: styleState.lineHeight,
                textTransform: styleState.textTransform,
                zIndex: layout.zIndex,
              } as const;

              const selectionClass = editable
                ? isSelected
                  ? "ring-2 ring-cyan-500"
                  : "ring-0 hover:ring-1 hover:ring-cyan-400/70"
                : "";

              const sharedEvents = {
                onMouseDown: (event: ReactMouseEvent) => {
                  if (isTextEditing) return;
                  startInteraction("move", field, event);
                },
                onClick: (event: ReactMouseEvent) => {
                  event.stopPropagation();
                  selectField(field, event);
                },
                onDoubleClick: (event: ReactMouseEvent) =>
                  enterTextEditMode(field, event),
                onContextMenu: (event: ReactMouseEvent) => {
                  if (!editable) return;
                  event.preventDefault();
                  event.stopPropagation();
                  if (!selectedFieldIds.includes(field.id))
                    setSelectedFieldIds(getFieldGroupIds(field));
                  setContextMenu({
                    x: event.clientX,
                    y: event.clientY,
                    fieldId: field.id,
                  });
                },
              };

              const selectionDots =
                editable && isSelected && !isTextEditing ? (
                  <>
                    <span className="pointer-events-none absolute -left-1 -top-1 size-2 rounded-full border border-white bg-cyan-600 shadow" />
                    <span className="pointer-events-none absolute -right-1 -top-1 size-2 rounded-full border border-white bg-cyan-600 shadow" />
                    <span className="pointer-events-none absolute -bottom-1 -left-1 size-2 rounded-full border border-white bg-cyan-600 shadow" />
                    <button
                      type="button"
                      className="absolute -bottom-1.5 -right-1.5 size-3 cursor-nwse-resize rounded-full border border-white bg-cyan-600 shadow"
                      onMouseDown={(event) =>
                        startInteraction("resize", field, event)
                      }
                      aria-label="Resize field"
                    />
                  </>
                ) : null;

              if (field.type === "image") {
                const src =
                  stringifyTemplateValue(value) ||
                  field.placeholderImage ||
                  PROFILE_PLACEHOLDER;
                return (
                  <div
                    key={field.id}
                    className={`absolute select-none ${editable ? "cursor-move" : ""} ${selectionClass}`}
                    style={boxStyle}
                    {...sharedEvents}
                  >
                    <img
                      src={src}
                      alt={field.label}
                      className="size-full rounded-full object-cover"
                    />
                    {selectionDots}
                  </div>
                );
              }

              if (field.type === "qr") {
                return qrDataUrl ? (
                  <div
                    key={field.id}
                    className={`absolute select-none ${editable ? "cursor-move" : ""} ${selectionClass}`}
                    style={boxStyle}
                    {...sharedEvents}
                  >
                    <a
                      className="block size-full"
                      href={
                        getEffectiveFieldLink(resume, field, qrSource) ||
                        linkHref(field, qrSource)
                      }
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => editable && event.preventDefault()}
                    >
                      <img
                        src={qrDataUrl}
                        alt="QR code"
                        className="size-full object-contain"
                      />
                    </a>
                    {selectionDots}
                  </div>
                ) : null;
              }

              const text = stringifyTemplateValue(value);
              const href = getEffectiveFieldLink(resume, field, text);
              const richHtml = getEffectiveFieldHtml(resume, field, value);
              const editableText = editable && isTextEditableField(field);
              const content =
                href && !editableText
                  ? stringifyTemplateValue(value)
                  : renderContent(value, field, styleState.bullets);

              const editorCommon = {
                ref: (node: HTMLDivElement | null) => {
                  editorRefs.current[field.id] = node;
                },
                suppressContentEditableWarning: true,
                onFocus: () => {
                  setActiveRichFieldId(field.id);
                  setSelectedFieldIds(getFieldGroupIds(field));
                  window.setTimeout(() => saveCurrentSelection(field.id), 0);
                },
                onMouseDown: (event: ReactMouseEvent) => {
                  event.stopPropagation();
                  setActiveRichFieldId(field.id);
                },
                onClick: (event: ReactMouseEvent) => {
                  event.stopPropagation();
                  if (event.detail >= 3) {
                    window.setTimeout(() => selectAllEditorText(field.id), 0);
                  } else {
                    window.setTimeout(() => saveCurrentSelection(field.id), 0);
                  }
                },
                onMouseUp: () => saveCurrentSelection(field.id),
                onKeyUp: () => saveCurrentSelection(field.id),
                onInput: () => saveCurrentSelection(field.id),
                onBlur: (event: ReactFocusEvent<HTMLDivElement>) => {
                  const nextFocus = event.relatedTarget as Node | null;
                  if (nextFocus && toolbarRef.current?.contains(nextFocus)) {
                    saveCurrentSelection(field.id);
                    return;
                  }
                  persistEditorHtml(field);
                },
              };

              const body = field.showLabel ? (
                <div className="flex h-full flex-col overflow-hidden">
                  <span className="mb-[0.18em] inline-flex w-fit rounded-md bg-slate-200/85 px-[0.55em] py-[0.15em] text-[1.03em] font-bold leading-none text-slate-700">
                    {getEffectiveFieldLabel(resume, field)}
                  </span>
                  {isTextEditing ? (
                    <div
                      className="min-h-0 flex-1 cursor-text overflow-hidden whitespace-pre-wrap break-words leading-[inherit] outline-none [user-select:text]"
                      contentEditable
                      {...editorCommon}
                      dangerouslySetInnerHTML={{ __html: richHtml }}
                    />
                  ) : editableText ? (
                    <span
                      className="min-h-0 flex-1 overflow-hidden whitespace-pre-wrap break-words leading-[inherit]"
                      dangerouslySetInnerHTML={{ __html: richHtml }}
                    />
                  ) : (
                    <span className="min-h-0 flex-1 overflow-hidden whitespace-pre-wrap break-words leading-[inherit]">
                      {content}
                    </span>
                  )}
                </div>
              ) : isTextEditing ? (
                <div
                  className="size-full cursor-text overflow-hidden whitespace-pre-wrap break-words leading-[inherit] outline-none [user-select:text]"
                  contentEditable
                  {...editorCommon}
                  dangerouslySetInnerHTML={{ __html: richHtml }}
                />
              ) : editableText ? (
                <span
                  className="block size-full overflow-hidden whitespace-pre-wrap break-words leading-[inherit]"
                  dangerouslySetInnerHTML={{ __html: richHtml }}
                />
              ) : (
                <span className="whitespace-pre-wrap break-words leading-[inherit]">
                  {content}
                </span>
              );

              return (
                <div
                  key={field.id}
                  className={`absolute overflow-hidden ${isTextEditing ? "cursor-text select-text" : "select-none"} ${editable && !isTextEditing ? "cursor-move" : "cursor-text"} ${selectionClass}`}
                  style={{
                    ...boxStyle,
                    fontFamily: styleState.fontFamily,
                    textDecoration:
                      `${styleState.underline ? "underline" : ""} ${styleState.strike ? "line-through" : ""}`.trim() ||
                      "none",
                  }}
                  {...(isTextEditing
                    ? {
                        onContextMenu: sharedEvents.onContextMenu,
                      }
                    : sharedEvents)}
                >
                  {href && !editableText ? (
                    <a
                      className="block size-full underline-offset-2 hover:underline"
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      onClick={(event) => editable && event.preventDefault()}
                    >
                      {body}
                    </a>
                  ) : (
                    body
                  )}
                  {selectionDots}
                </div>
              );
            })}

            {selectionBox ? (
              <div
                className="absolute z-[999] border border-cyan-500 bg-cyan-400/10"
                style={{
                  left: `${selectionBoxToRect(selectionBox).x}%`,
                  top: `${selectionBoxToRect(selectionBox).y}%`,
                  width: `${selectionBoxToRect(selectionBox).width}%`,
                  height: `${selectionBoxToRect(selectionBox).height}%`,
                }}
              />
            ) : null}
          </div>
        </div>
      </div>

      {contextMenu ? (
        <div
          className="fixed z-[1000] w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 text-sm shadow-2xl dark:border-white/10 dark:bg-zinc-950"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <MenuItem
            icon={<Trash2 className="size-4" />}
            label={isArabic ? "مسح المحتوى" : "Clear content"}
            onClick={clearSelectedContent}
          />
          {canGroup ? (
            <MenuItem
              icon={<Group className="size-4" />}
              label={isArabic ? "Group" : "Group"}
              onClick={groupSelection}
            />
          ) : null}
          {selectedHasGroup ? (
            <MenuItem
              icon={<Ungroup className="size-4" />}
              label={isArabic ? "Ungroup" : "Ungroup"}
              onClick={ungroupSelection}
            />
          ) : null}
          <div className="my-1 h-px bg-slate-100 dark:bg-white/10" />
          <MenuItem
            icon={<ArrowUpToLine className="size-4" />}
            label={isArabic ? "Bring to front" : "Bring to front"}
            onClick={() => updateSelectedZ("front")}
          />
          <MenuItem
            icon={<ArrowUp className="size-4" />}
            label={isArabic ? "Bring forward" : "Bring forward"}
            onClick={() => updateSelectedZ("forward")}
          />
          <MenuItem
            icon={<ArrowDown className="size-4" />}
            label={isArabic ? "Send backward" : "Send backward"}
            onClick={() => updateSelectedZ("backward")}
          />
          <MenuItem
            icon={<ArrowDownToLine className="size-4" />}
            label={isArabic ? "Send to back" : "Send to back"}
            onClick={() => updateSelectedZ("back")}
          />
          {selectedFieldIds.length === 1 ? (
            <>
              <div className="my-1 h-px bg-slate-100 dark:bg-white/10" />
              <MenuItem
                icon={<LinkIcon className="size-4" />}
                label={isArabic ? "Edit link" : "Edit link"}
                onClick={editSelectedFieldLink}
              />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ToolbarButton({
  title,
  active = false,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-bold transition ${
        active
          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:hover:bg-white/10"
      }`}
      onClick={onClick}
      onMouseDown={preventToolbarBlur}
    >
      {children}
    </button>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
      onClick={() => onClick()}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
