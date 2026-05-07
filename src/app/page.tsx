"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  GitBranch,
  Globe2,
  LayoutDashboard,
  Palette,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useLanguage } from "@/components/layout/language-provider";
import { CanvaTemplateCard } from "@/components/templates/template-card";
import { canvaResumeTemplates } from "@/templates/resume-template-registry";

const features = [
  { icon: FileText, titleKey: "featureResumeTitle", textKey: "featureResumeText" },
  { icon: Sparkles, titleKey: "featureAiTitle", textKey: "featureAiText" },
  { icon: Globe2, titleKey: "featurePortfolioTitle", textKey: "featurePortfolioText" },
  { icon: GitBranch, titleKey: "featureGithubTitle", textKey: "featureGithubText" },
  { icon: Palette, titleKey: "featureTemplatesTitle", textKey: "featureTemplatesText" },
  { icon: LayoutDashboard, titleKey: "featureDashboardTitle", textKey: "featureDashboardText" },
] as const;

export default function Home() {
  const { t, locale, isRtl } = useLanguage();

  return (
    <main className="min-h-screen bg-[#faf9f6] text-slate-950 dark:bg-black dark:text-white">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#fffefa]/80 backdrop-blur dark:border-zinc-900 dark:bg-[#070707]/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-2.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-white sm:size-10">
              <Sparkles className="size-5" />
            </span>
            <span className="truncate text-sm font-bold sm:text-base">
              {locale === "ar" ? t("appName") : t("brandShort")}
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-zinc-400 md:flex">
            <a href="#features">{t("navFeatures")}</a>
            <a href="#templates">{t("navTemplates")}</a>
            <a href="#pricing">{t("navPricing")}</a>
          </nav>

          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <LanguageToggle />
            <Button href="/auth/sign-in" variant="secondary" className="hidden sm:inline-flex">
              {t("signIn")}
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-stone-200 dark:border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,115,232,0.22),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.18),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center text-center md:text-start"
          >
            <Badge className="mx-auto w-fit md:mx-0">{t("heroBadge")}</Badge>
            <h1 className="mt-6 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              {t("heroText")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Button href="/onboarding" size="lg">
                {t("startBuilding")}
                <ArrowRight className="size-5 rtl:rotate-180" />
              </Button>
              <Button href="/dashboard" size="lg" variant="secondary">
                {t("viewDashboard")}
              </Button>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
              {[t("localFirst"), t("noClientKeys"), t("arabicEnglish")].map((item) => (
                <div key={item} className="flex items-center justify-center gap-2 md:justify-start">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-lg border border-stone-200 bg-[#fffefa] p-4 shadow-2xl shadow-slate-900/10 dark:border-zinc-800 dark:bg-[#111111]"
          >
            <div className="rounded-lg bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-cyan-200">{t("liveResumePreview")}</p>
                  <h2 className="mt-2 text-2xl font-bold">Sara Ahmed</h2>
                </div>
                <span className="rounded-md bg-emerald-400/15 px-2 py-1 text-xs text-emerald-200">
                  {t("readyScore")}
                </span>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
                <div className="space-y-2">
                  <div className="h-3 rounded bg-white/30" />
                  <div className="h-3 w-2/3 rounded bg-white/20" />
                  <div className="h-3 w-4/5 rounded bg-white/20" />
                </div>
                <div className="space-y-3 rounded-lg bg-white p-4 text-slate-950">
                  <div className="h-3 w-32 rounded bg-slate-900" />
                  <div className="h-2 rounded bg-slate-200" />
                  <div className="h-2 w-5/6 rounded bg-slate-200" />
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="h-12 rounded bg-cyan-100" />
                    <div className="h-12 rounded bg-emerald-100" />
                    <div className="h-12 rounded bg-indigo-100" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-600">
            {t("productEyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{t("productTitle")}</h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.titleKey}>
                <Icon className="size-6 text-blue-600 dark:text-cyan-300" />
                <h3 className="mt-4 font-bold">{t(feature.titleKey)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {t(feature.textKey)}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        id="templates"
        className="border-y border-stone-200 bg-[#fffefa] py-14 dark:border-zinc-900 dark:bg-[#080808] sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-cyan-300">
                {t("templatesEyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{t("templatesTitle")}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-zinc-400">
                {t("templatesText")}
              </p>
            </div>
            <Button href="/dashboard/templates" variant="secondary">
              {t("openTemplatesGallery")}
            </Button>
          </div>

          <div
            className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:thin] sm:gap-5"
            dir="ltr"
          >
            {canvaResumeTemplates.map((template) => (
              <div
                key={template.id}
                className="w-[82vw] max-w-[340px] shrink-0 snap-start sm:w-[340px]"
                dir={isRtl ? "rtl" : "ltr"}
              >
                <CanvaTemplateCard
                  template={template}
                  selected={false}
                  actionLabel={t("useTemplate")}
                  onSelect={() => {
                    // Save template selection and go straight to the editor
                    const stored = localStorage.getItem("airpb:resume");
                    try {
                      const resume = stored ? JSON.parse(stored) : {};
                      resume.templateId = template.id;
                      resume.templateData = {};
                      resume.templateFieldStates = {};
                      resume.status = "Draft";
                      localStorage.setItem("airpb:resume", JSON.stringify(resume));
                    } catch {
                      // ignore parse errors
                    }
                    window.location.href = "/dashboard/resume";
                  }}
                />
              </div>
            ))}
            <div
              className="flex min-h-[360px] w-[82vw] max-w-[340px] shrink-0 snap-start items-center justify-center rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-slate-500 dark:border-zinc-800 dark:text-zinc-400 sm:w-[340px]"
              dir={isRtl ? "rtl" : "ltr"}
            >
              {t("addMoreTemplates")}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
            <ChevronLeft className="size-4" />
            {t("swipeTemplates")}
            <ChevronRight className="size-4" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-3 lg:px-8">
        {[
          [t("stepOne"), t("stepOneTitle")],
          [t("stepTwo"), t("stepTwoTitle")],
          [t("stepThree"), t("stepThreeTitle")],
        ].map(([step, title]) => (
          <Card key={step}>
            <p className="text-sm font-semibold text-cyan-600">{step}</p>
            <h3 className="mt-3 text-xl font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {t("stepText")}
            </p>
          </Card>
        ))}
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <Card className="flex flex-col gap-5 bg-slate-950 p-6 text-white dark:bg-white dark:text-slate-950 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-300 dark:text-cyan-600">
              {t("pricingEyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{t("pricingTitle")}</h2>
            <p className="mt-2 text-slate-300 dark:text-slate-600">{t("pricingText")}</p>
          </div>
          <Button href="/onboarding" variant="secondary">
            {t("startBuilding")}
          </Button>
        </Card>
      </section>
    </main>
  );
}
