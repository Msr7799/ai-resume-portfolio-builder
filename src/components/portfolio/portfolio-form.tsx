"use client";

import { Eye, Save } from "lucide-react";
import { useState } from "react";
import { PortfolioPreview } from "@/components/portfolio/portfolio-preview";
import { useLanguage } from "@/components/layout/language-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { portfolioTemplates } from "@/lib/mock-data";
import type { Portfolio, Resume } from "@/types";

export function PortfolioForm({
  portfolio,
  resume,
  onChange,
}: {
  portfolio: Portfolio;
  resume: Resume;
  onChange: (portfolio: Portfolio) => void;
}) {
  const [draft, setDraft] = useState(portfolio);
  const [message, setMessage] = useState("");
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  function save() {
    onChange(draft);
    setMessage(isArabic ? "تم حفظ البورتفوليو محليًا." : "Portfolio saved locally.");
    window.setTimeout(() => setMessage(""), 2200);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="space-y-4">
        <Field label={isArabic ? "اسم المستخدم العام" : "Public username"}>
          <Input
            value={draft.username}
            onChange={(event) => setDraft({ ...draft, username: event.target.value })}
          />
        </Field>
        <Field label={isArabic ? "العنوان الرئيسي" : "Headline"}>
          <Textarea
            value={draft.headline}
            onChange={(event) => setDraft({ ...draft, headline: event.target.value })}
          />
        </Field>
        <Field label={isArabic ? "الوصف المختصر" : "Subheadline"}>
          <Textarea
            value={draft.subheadline}
            onChange={(event) => setDraft({ ...draft, subheadline: event.target.value })}
          />
        </Field>
        <Field label={isArabic ? "نبذة" : "About"}>
          <Textarea
            value={draft.about}
            onChange={(event) => setDraft({ ...draft, about: event.target.value })}
          />
        </Field>
        <Field label={isArabic ? "قالب البورتفوليو" : "Portfolio template"}>
          <Select
            value={draft.templateId}
            onChange={(event) => setDraft({ ...draft, templateId: event.target.value })}
          >
            {portfolioTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
        </Field>
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-semibold dark:border-white/10">
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(event) => setDraft({ ...draft, published: event.target.checked })}
          />
          {isArabic ? "نشر الصفحة العامة" : "Publish public profile"}
        </label>
        {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button onClick={save}>
            <Save className="size-4" />
            {isArabic ? "حفظ" : "Save"}
          </Button>
          <Button href="/dashboard/portfolio/preview" variant="secondary">
            <Eye className="size-4" />
            {isArabic ? "معاينة" : "Preview"}
          </Button>
        </div>
      </Card>
      <PortfolioPreview portfolio={draft} resume={resume} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}
