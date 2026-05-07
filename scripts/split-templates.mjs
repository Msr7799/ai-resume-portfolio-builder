#!/usr/bin/env node

/**
 * Split the monolithic generated-html-templates.ts into per-template JSON files.
 * Usage: node scripts/split-templates.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SRC_TEMPLATES = join(ROOT, "src", "templates");
const DATA_DIR = join(SRC_TEMPLATES, "data");
const SOURCE_FILE = join(SRC_TEMPLATES, "generated-html-templates.ts");

const source = readFileSync(SOURCE_FILE, "utf-8");

function extractBracketBlock(src, startMarker, openChar, closeChar) {
  const startIdx = src.indexOf(startMarker);
  if (startIdx < 0) return null;
  let depth = 0;
  let i = startIdx + startMarker.length - 1;
  for (; i < src.length; i++) {
    if (src[i] === openChar) depth++;
    if (src[i] === closeChar) depth--;
    if (depth === 0) break;
  }
  return src.substring(startIdx + startMarker.length, i);
}

function splitJsonObjects(content) {
  const results = [];
  const re = /\{\s*"id"\s*:\s*"(template-\d+)"/g;
  const starts = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    starts.push({ id: m[1], index: m.index });
  }
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].index;
    const end = i + 1 < starts.length ? starts[i + 1].index : content.length;
    let block = content.substring(start, end).trim().replace(/[\s,]+$/, "");
    try {
      const obj = JSON.parse(block);
      results.push({ id: starts[i].id, data: obj });
    } catch (e) {
      console.warn("  Warning: could not parse " + starts[i].id + ": " + e.message.substring(0, 60));
    }
  }
  return results;
}

// Extract template array
const arrayStr = extractBracketBlock(source, "export const htmlGeneratedTemplates = [", "[", "]");
if (!arrayStr) {
  console.error("Could not extract template array.");
  process.exit(1);
}

const templates = splitJsonObjects(arrayStr);
console.log("Extracted " + templates.length + " template definitions.");

// Extract seed data
const seedMarker = "const htmlTemplateSeedData: Record<string, CanvaTemplateData> = {";
const seedStr = extractBracketBlock(source, seedMarker, "{", "}");
let seedMap = {};
if (seedStr) {
  try {
    seedMap = JSON.parse("{" + seedStr + "}");
    console.log("Extracted seed data for " + Object.keys(seedMap).length + " templates.");
  } catch (e) {
    console.warn("Could not parse seed data: " + e.message.substring(0, 80));
  }
}

// Write per-template JSON files
mkdirSync(DATA_DIR, { recursive: true });

for (const { id, data: tmpl } of templates) {
  const seed = seedMap[id] || {};
  const outPath = join(DATA_DIR, id + ".json");
  writeFileSync(outPath, JSON.stringify({ template: tmpl, seedData: seed }, null, 2) + "\n");
  const fieldCount = tmpl.fields ? tmpl.fields.length : 0;
  const seedCount = Object.keys(seed).length;
  console.log("  OK " + id + ".json - " + fieldCount + " fields, " + seedCount + " seed values");
}

// Generate thin TypeScript loader
const importLines = templates.map(function (t) {
  const v = t.id.replace(/-/g, "_");
  return 'import ' + v + ' from "@/templates/data/' + t.id + '.json";';
}).join("\n");

const entries = templates.map(function (t) {
  return "  " + t.id.replace(/-/g, "_") + " as TemplateJsonData,";
}).join("\n");

const loader = [
  'import type { CanvaResumeTemplate } from "@/types/template";',
  'import type { CanvaTemplateData } from "@/types/template";',
  "",
  importLines,
  "",
  "type TemplateJsonData = {",
  "  template: CanvaResumeTemplate;",
  "  seedData: CanvaTemplateData;",
  "};",
  "",
  "const allTemplateData: TemplateJsonData[] = [",
  entries,
  "];",
  "",
  "export const htmlGeneratedTemplates: CanvaResumeTemplate[] = allTemplateData.map(",
  "  (d) => d.template,",
  ");",
  "",
  "const seedDataMap: Record<string, CanvaTemplateData> = {};",
  "for (const d of allTemplateData) {",
  "  seedDataMap[d.template.id] = d.seedData;",
  "}",
  "",
  "export function getHtmlTemplateSeedData(templateId?: string): CanvaTemplateData {",
  '  if (!templateId) return {};',
  "  return seedDataMap[templateId] ?? {};",
  "}",
  "",
].join("\n");

writeFileSync(join(SRC_TEMPLATES, "generated-html-templates.ts"), loader);
console.log("\nWrote new thin loader: generated-html-templates.ts");
console.log("Done! Run 'pnpm build' to verify.");
