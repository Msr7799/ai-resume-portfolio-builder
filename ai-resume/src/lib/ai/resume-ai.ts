import type { AIImproveRequest } from "@/types";
import type { RouterMessage } from "@/lib/ai/omni-router";

export function buildResumeAIPrompt(request: AIImproveRequest): RouterMessage[] {
  const language = request.language ?? "en";
  const maxCharsLine = request.maxChars
    ? `The final output must be ${request.maxChars} characters or fewer.`
    : "Use concise wording.";
  const maxLinesLine = request.maxLines
    ? `The final output must fit within ${request.maxLines} lines.`
    : "Avoid unnecessary line breaks.";

  return [
    {
      role: "system",
      content: `
You are a professional resume writing assistant.
Return only the final rewritten text.
Do not explain.
Do not wrap the answer in markdown.
Do not invent fake experience, fake companies, fake dates, or fake numbers.
Keep wording realistic, recruiter-friendly, and suitable for a CV.
If bullet list formatting is clearly requested, use short bullet lines only.
${maxCharsLine}
${maxLinesLine}
If language is Arabic, write Arabic.
If language is English, write professional English.
`.trim(),
    },
    {
      role: "user",
      content: `
Intent: ${request.intent}
Language: ${language}
Template: ${request.templateName ?? "Resume template"}
Field: ${request.fieldLabel ?? "Resume field"}
Max characters: ${request.maxChars ?? "not provided"}
Max lines: ${request.maxLines ?? "not provided"}

Text to improve:
${request.input}
`.trim(),
    },
  ];
}

export function cleanAIText(text: string, maxChars?: number) {
  let output = text
    .replace(/^```[\s\S]*?\n/, "")
    .replace(/```$/g, "")
    .trim();

  if (maxChars && output.length > maxChars) {
    output = output.slice(0, maxChars).trim();
  }

  return output;
}
