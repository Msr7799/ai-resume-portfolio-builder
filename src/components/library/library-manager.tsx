"use client";

import { Archive, Download, FolderClock, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useResume } from "@/hooks/use-resume";
import type { StoredPortfolio, StoredResume } from "@/types/auth";

type LibraryResponse = {
  resumes?: StoredResume[];
  portfolios?: StoredPortfolio[];
  error?: string;
};

export function LibraryManager() {
  const { resume } = useResume();
  const { portfolio } = usePortfolio();
  const [resumes, setResumes] = useState<StoredResume[]>([]);
  const [portfolios, setPortfolios] = useState<StoredPortfolio[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [resumeResponse, portfolioResponse] = await Promise.all([
      fetch("/api/library/resumes"),
      fetch("/api/library/portfolios"),
    ]);

    const resumeData = (await resumeResponse.json()) as LibraryResponse;
    const portfolioData = (await portfolioResponse.json()) as LibraryResponse;

    if (resumeResponse.ok) setResumes(resumeData.resumes ?? []);
    if (portfolioResponse.ok) setPortfolios(portfolioData.portfolios ?? []);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  async function saveResume() {
    setMessage("");
    setError("");
    const response = await fetch("/api/library/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: resume.title, resume }),
    });
    const data = (await response.json()) as LibraryResponse;
    if (!response.ok) {
      setError(data.error ?? "تعذر حفظ السيرة.");
      return;
    }
    setMessage("تم حفظ نسخة من السيرة في حسابك.");
    await load();
  }

  async function savePortfolio() {
    setMessage("");
    setError("");
    const response = await fetch("/api/library/portfolios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: portfolio.headline, portfolio }),
    });
    const data = (await response.json()) as LibraryResponse;
    if (!response.ok) {
      setError(data.error ?? "تعذر حفظ البورتفوليو.");
      return;
    }
    setMessage("تم حفظ نسخة من البورتفوليو في حسابك.");
    await load();
  }

  return (
    <Card className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="grid size-11 place-items-center rounded-lg bg-blue-500/10 text-blue-500">
          <Archive className="size-5" />
        </span>
        <div>
          <h2 className="font-bold text-slate-950 dark:text-white">محفوظات الحساب</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            احفظ نسخ سابقة من السيرة والبورتفوليو للرجوع إليها لاحقًا.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={saveResume}>
          <Save className="size-4" />
          حفظ السيرة الحالية
        </Button>
        <Button onClick={savePortfolio} variant="secondary">
          <Save className="size-4" />
          حفظ البورتفوليو الحالي
        </Button>
      </div>

      {message ? <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <HistoryList
          title="السير المحفوظة"
          items={resumes.map((item) => ({
            id: item.id,
            title: item.title,
            date: item.updatedAt,
            href: item.pdfAsset?.secureUrl,
          }))}
        />
        <HistoryList
          title="البورتفوليو المحفوظ"
          items={portfolios.map((item) => ({
            id: item.id,
            title: item.title,
            date: item.updatedAt,
            href: undefined,
          }))}
        />
      </div>
    </Card>
  );
}

function HistoryList({
  title,
  items,
}: {
  title: string;
  items: { id: string; title: string; date: string; href?: string }[];
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-zinc-800">
      <h3 className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
        <FolderClock className="size-4 text-emerald-500" />
        {title}
      </h3>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-zinc-950">
              <p className="font-medium text-slate-800 dark:text-zinc-200">{item.title}</p>
              <p className="text-xs text-slate-500">{new Date(item.date).toLocaleString()}</p>
              {item.href ? (
                <a
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:underline"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download className="size-3" />
                  فتح ملف PDF
                </a>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-zinc-400">لا توجد نسخ محفوظة بعد.</p>
        )}
      </div>
    </div>
  );
}
