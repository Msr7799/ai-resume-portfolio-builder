"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { improveWithAI } from "@/lib/ai";
import type { AIImproveIntent } from "@/types";

const actions: { intent: AIImproveIntent; label: string }[] = [
  { intent: "improve-summary", label: "Improve summary" },
  { intent: "rewrite-bullet", label: "Rewrite experience bullet" },
  { intent: "professional", label: "Make it more professional" },
  { intent: "shorter", label: "Make it shorter" },
  { intent: "ats", label: "Make it ATS-friendly" },
  { intent: "project-description", label: "Generate project description" },
];

export function AIImprovePanel({
  sourceText,
  onApply,
}: {
  sourceText: string;
  onApply: (value: string) => void;
}) {
  const [draft, setDraft] = useState(sourceText);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState<AIImproveIntent | null>(null);

  async function run(intent: AIImproveIntent) {
    setLoading(intent);
    const improved = await improveWithAI(draft || sourceText, intent);
    setResult(improved);
    setLoading(null);
  }

  return (
    <Card className="space-y-4 border-cyan-500/20 bg-cyan-50/60 dark:bg-cyan-950/20">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-cyan-600 dark:text-cyan-300" />
        <div>
          <h3 className="font-semibold text-slate-950 dark:text-white">AI assistant</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Mock-safe today, ready for a real LLM provider later.
          </p>
        </div>
      </div>
      <Textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Paste a summary, bullet, or project idea..."
      />
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.intent}
            size="sm"
            variant="secondary"
            onClick={() => void run(action.intent)}
            disabled={loading !== null}
          >
            {loading === action.intent ? "Improving..." : action.label}
          </Button>
        ))}
      </div>
      {result ? (
        <div className="rounded-lg border border-cyan-500/20 bg-white p-3 text-sm leading-6 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
          <p>{result}</p>
          <Button className="mt-3" size="sm" onClick={() => onApply(result)}>
            Apply to summary
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
