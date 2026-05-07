import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

export type ResumeRoute = {
  name: string;
  description: string;
  primary_model: string;
  fallback_models?: string[];
};

export type RouterMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type RoutedCompletion = {
  result: string;
  route: string;
  model: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
  message?: string;
};

const ROUTER_FAILURE = "arch_router_failure";
const HF_ROUTER_BASE_URL = "https://router.huggingface.co/v1";
const DEFAULT_ROUTE = "casual_conversation";
const DEFAULT_FALLBACK_MODEL = "Qwen/Qwen2.5-7B-Instruct";

let cachedRoutes: ResumeRoute[] | null = null;

function env(name: string, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

function routesPath() {
  const configured = env("LLM_ROUTER_ROUTES_PATH", "./config/resume-routes.json");
  return path.isAbsolute(configured)
    ? configured
    : path.join(/*turbopackIgnore: true*/ process.cwd(), configured);
}

function trimMiddle(content: string, maxLength: number) {
  if (content.length <= maxLength) return content;
  const indicator = "...";
  const available = Math.max(0, maxLength - indicator.length);
  const startLength = Math.ceil(available * 0.6);
  const endLength = available - startLength;
  if (endLength <= 0) return content.slice(0, available) + indicator;
  return content.slice(0, startLength) + indicator + content.slice(-endLength);
}

export async function getResumeRoutes() {
  if (cachedRoutes) return cachedRoutes;

  const raw = await readFile(routesPath(), "utf8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Routes config must be a flat array.");
  }

  const seen = new Set<string>();
  const routes = parsed.map((entry) => {
    if (!entry || typeof entry !== "object") {
      throw new Error("Invalid route entry.");
    }

    const route = entry as Partial<ResumeRoute>;
    if (!route.name || !route.description || !route.primary_model) {
      throw new Error(`Invalid route entry: ${JSON.stringify(entry)}`);
    }

    if (seen.has(route.name)) {
      throw new Error(`Duplicate route name: ${route.name}`);
    }
    seen.add(route.name);

    return {
      name: route.name,
      description: route.description,
      primary_model: route.primary_model,
      fallback_models: Array.isArray(route.fallback_models) ? route.fallback_models : [],
    };
  });

  cachedRoutes = routes;
  return routes;
}

function parseRouteName(text: string) {
  if (!text.trim()) return undefined;

  try {
    const parsed = JSON.parse(text) as { route?: unknown };
    if (typeof parsed.route === "string" && parsed.route.trim()) {
      return parsed.route.trim();
    }
  } catch {}

  const match = text.match(/["']route["']\s*:\s*["']([^"']+)["']/);
  return match?.[1]?.trim();
}

function buildRoutePrompt(messages: RouterMessage[], routes: ResumeRoute[]) {
  const simpleRoutes = routes.map((route) => ({
    name: route.name,
    description: route.description,
  }));

  const maxAssistantLength = Number(env("LLM_ROUTER_MAX_ASSISTANT_LENGTH", "1000"));
  const maxPrevUserLength = Number(env("LLM_ROUTER_MAX_PREV_USER_LENGTH", "1000"));
  const lastUserIndex = messages.findLastIndex((message) => message.role === "user");

  const trimmedMessages = messages.slice(-16).map((message, index) => {
    if (message.role === "assistant") {
      return { ...message, content: trimMiddle(message.content, maxAssistantLength) };
    }
    if (message.role === "user" && index !== lastUserIndex) {
      return { ...message, content: trimMiddle(message.content, maxPrevUserLength) };
    }
    return message;
  });

  return `
You are a route selector. Choose the best route for the latest user request.

<routes>
${JSON.stringify(simpleRoutes)}
</routes>

<conversation>
${JSON.stringify(trimmedMessages)}
</conversation>

Rules:
1. Return only valid JSON.
2. Use an exact route name from <routes>.
3. If no route fits, return {"route":"other"}.

Response shape:
{"route":"route_name"}
`.trim();
}

async function postChatCompletion({
  baseUrl,
  model,
  messages,
  maxTokens,
  temperature,
  signal,
}: {
  baseUrl: string;
  model: string;
  messages: RouterMessage[];
  maxTokens: number;
  temperature: number;
  signal?: AbortSignal;
}) {
  const apiKey = env("LLM_API_KEY");
  if (!apiKey) {
    throw new Error("LLM_API_KEY is not configured.");
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
    signal,
  });

  const data = (await response.json().catch(() => ({}))) as ChatCompletionResponse;

  if (!response.ok) {
    const message = data.error?.message ?? data.message ?? `Router request failed: ${response.status}`;
    throw new Error(message);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Router returned an empty response.");
  }

  return content;
}

export async function selectResumeRoute(messages: RouterMessage[]) {
  const routes = await getResumeRoutes();
  const baseUrl = env("LLM_ROUTER_ARCH_BASE_URL");
  const model = env("LLM_ROUTER_ARCH_MODEL", "katanemo/Arch-Router-1.5B");
  const timeoutMs = Number(env("LLM_ROUTER_ARCH_TIMEOUT_MS", "10000"));

  if (!baseUrl || !env("LLM_API_KEY")) {
    return heuristicRoute(messages.at(-1)?.content ?? "");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const content = await postChatCompletion({
      baseUrl,
      model,
      messages: [{ role: "user", content: buildRoutePrompt(messages, routes) }],
      maxTokens: 24,
      temperature: 0,
      signal: controller.signal,
    });
    const parsed = parseRouteName(content);
    const otherRoute = env("LLM_ROUTER_OTHER_ROUTE", DEFAULT_ROUTE);
    const routeName = parsed === "other" ? otherRoute : parsed ?? otherRoute;
    const exists = routes.some((route) => route.name === routeName);
    return exists ? routeName : otherRoute;
  } catch {
    return ROUTER_FAILURE;
  } finally {
    clearTimeout(timeout);
  }
}

function heuristicRoute(text: string) {
  const lower = text.toLowerCase();
  if (/[ء-ي]/.test(text) || lower.includes("arabic") || lower.includes("translate")) {
    return "arabic_english";
  }
  if (lower.includes("ats") || lower.includes("keyword")) return "ats_optimization";
  if (lower.includes("fit") || lower.includes("shorten") || lower.includes("max")) {
    return "template_fit";
  }
  if (lower.includes("project") || lower.includes("github") || lower.includes("deployment")) {
    return "project_description";
  }
  if (lower.includes("resume") || lower.includes("cv") || lower.includes("summary")) {
    return "resume_writing";
  }
  return DEFAULT_ROUTE;
}

function resolveCandidates(routeName: string, routes: ResumeRoute[]) {
  const fallbackModel = env("LLM_ROUTER_FALLBACK_MODEL", DEFAULT_FALLBACK_MODEL);
  if (routeName === ROUTER_FAILURE) return [fallbackModel];

  const route =
    routes.find((candidate) => candidate.name === routeName) ??
    routes.find((candidate) => candidate.name === DEFAULT_ROUTE);

  if (!route) return [fallbackModel];
  return [route.primary_model, ...(route.fallback_models ?? [])];
}

export async function completeWithOmniRouter(messages: RouterMessage[]): Promise<RoutedCompletion> {
  const routes = await getResumeRoutes();
  const route = await selectResumeRoute(messages);
  const candidates = resolveCandidates(route, routes);
  const baseUrl = HF_ROUTER_BASE_URL;

  let lastError: unknown;
  for (const model of candidates) {
    try {
      const result = await postChatCompletion({
        baseUrl,
        model,
        messages,
        maxTokens: 700,
        temperature: 0.3,
      });
      return { result, route, model };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All router candidates failed.");
}
