import type { AIImproveIntent } from "@/types";

const fallbackResponses: Record<AIImproveIntent, string> = {
  "improve-summary":
    "Results-focused software developer with hands-on experience building accessible, responsive web applications. Skilled at translating product goals into clean interfaces, maintainable components, and measurable user improvements.",
  "rewrite-bullet":
    "Delivered a reusable component workflow that improved implementation speed, reduced UI inconsistencies, and strengthened accessibility across production screens.",
  professional:
    "Led the implementation of polished, maintainable user interfaces while collaborating closely with product and engineering stakeholders to improve delivery quality.",
  shorter:
    "Built accessible React interfaces and reusable components for production SaaS workflows.",
  ats:
    "Frontend Developer experienced in React, TypeScript, Tailwind CSS, responsive design, accessibility, REST API integration, Git workflows, and component-based architecture.",
  "project-description":
    "A production-minded web application that combines clean UX, typed data models, responsive layouts, and practical automation to solve a real user workflow.",
  "fit-template-space":
    "Concise, professional wording that fits the selected resume template space.",
};

export async function improveWithAI(
  input: string,
  intent: AIImproveIntent,
  options: {
    language?: "en" | "ar";
    fieldLabel?: string;
    maxChars?: number;
    maxLines?: number;
    templateName?: string;
  } = {},
) {
  const trimmed = input.trim();
  if (!trimmed) {
    return fallbackResponses[intent];
  }

  try {
    const response = await fetch("/api/ai/improve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: trimmed, intent, ...options }),
    });

    if (!response.ok) {
      return fallbackResponses[intent];
    }

    const data = (await response.json()) as { result?: string };
    return data.result ?? fallbackResponses[intent];
  } catch {
    return fallbackResponses[intent];
  }
}

export function mockAIImprove(input: string, intent: AIImproveIntent) {
  const base = fallbackResponses[intent];
  if (!input.trim()) return base;
  return `${base}\n\nBased on your draft: ${input.trim()}`;
}
