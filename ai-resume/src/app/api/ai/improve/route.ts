import { NextResponse } from "next/server";
import { mockAIImprove } from "@/lib/ai";
import { buildResumeAIPrompt, cleanAIText } from "@/lib/ai/resume-ai";
import { completeWithOmniRouter } from "@/lib/ai/omni-router";
import type { AIImproveIntent, AIImproveRequest, Locale } from "@/types";

const intents: AIImproveIntent[] = [
  "improve-summary",
  "rewrite-bullet",
  "professional",
  "shorter",
  "ats",
  "project-description",
  "fit-template-space",
];

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AIImproveRequest>;
  const input = body.input ?? "";
  const intent = body.intent;
  const language: Locale = body.language === "ar" ? "ar" : "en";

  if (!intent || !intents.includes(intent)) {
    return NextResponse.json({ error: "Invalid AI intent." }, { status: 400 });
  }

  const requestBody: AIImproveRequest = {
    input,
    intent,
    language,
    fieldLabel: body.fieldLabel,
    maxChars: body.maxChars,
    maxLines: body.maxLines,
    templateName: body.templateName,
  };

  try {
    const completion = await completeWithOmniRouter(buildResumeAIPrompt(requestBody));
    return NextResponse.json({
      result: cleanAIText(completion.result, body.maxChars),
      route: completion.route,
      model: completion.model,
    });
  } catch {
    const result = cleanAIText(mockAIImprove(input, intent), body.maxChars);
    return NextResponse.json({
      result,
      route: "mock_fallback",
      model: "local-mock",
    });
  }
}
