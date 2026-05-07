import { NextResponse } from "next/server";
import { buildResumeAIPrompt, cleanAIText } from "@/lib/ai/resume-ai";
import { completeWithOmniRouter } from "@/lib/ai/omni-router";
import { aiLimiter, getClientIp } from "@/lib/server/rate-limit";
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
  const ip = getClientIp(request);
  if (!aiLimiter.check(ip)) {
    return NextResponse.json(
      { error: "Too many AI requests. Please wait a moment and try again." },
      { status: 429 },
    );
  }

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
  } catch (error) {
    // Do NOT silently return mock/fallback text — surface the failure clearly.
    console.error("[AI improve] failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        error: "AI service is temporarily unavailable. Please try again later.",
        route: "error",
        model: "none",
      },
      { status: 503 },
    );
  }
}
