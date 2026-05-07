import type { AIImproveIntent } from "@/types";

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
): Promise<string> {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Please enter some text before using AI improvement.");
  }

  const response = await fetch("/api/ai/improve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: trimmed, intent, ...options }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(
      data.error || `AI service returned an error (${response.status}). Please try again.`,
    );
  }

  const data = (await response.json()) as { result?: string; error?: string };
  if (data.error) {
    throw new Error(data.error);
  }
  if (!data.result) {
    throw new Error("AI returned an empty result. Please try again.");
  }
  return data.result;
}

/**
 * @deprecated Mock fallback kept for backwards compatibility in tests.
 * The server API no longer calls this — it returns a proper error instead.
 */
export function mockAIImprove(input: string, intent: AIImproveIntent) {
  const fallbackResponses: Record<AIImproveIntent, string> = {
    "improve-summary":
      "Results-focused software developer with hands-on experience building accessible, responsive web applications.",
    "rewrite-bullet":
      "Delivered a reusable component workflow that improved implementation speed and reduced UI inconsistencies.",
    professional:
      "Led the implementation of polished, maintainable user interfaces while collaborating with stakeholders.",
    shorter:
      "Built accessible React interfaces and reusable components for production SaaS workflows.",
    ats:
      "Frontend Developer experienced in React, TypeScript, Tailwind CSS, responsive design, accessibility.",
    "project-description":
      "A production-minded web application combining clean UX, typed data models, and responsive layouts.",
    "fit-template-space":
      "Concise, professional wording that fits the selected resume template space.",
  };
  const base = fallbackResponses[intent];
  if (!input.trim()) return base;
  return `${base}\n\nBased on your draft: ${input.trim()}`;
}
