"use client";

import { ArrowRight, CheckCircle2, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useResume } from "@/hooks/use-resume";

const steps = ["الملف", "الخبرة", "القالب", "الإطلاق"];

export default function OnboardingPage() {
  const { resume, setResume } = useResume();
  const [step, setStep] = useState(0);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button href="/" variant="ghost">منشئ السيرة</Button>
          <div className="flex gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <Card className="mt-8">
          <div className="flex flex-wrap gap-2">
            {steps.map((item, index) => (
              <div
                key={item}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                  index <= step ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-200" : "bg-slate-100 text-slate-500 dark:bg-white/5"
                }`}
              >
                {index < step ? <CheckCircle2 className="size-4" /> : <span>{index + 1}</span>}
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <UserRound className="size-10 text-cyan-600" />
              <h1 className="mt-4 text-3xl font-bold">جهّز مساحة ملفك المهني</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                خطوات قصيرة تملأ لوحة التحكم والسيرة والبورتفوليو ببيانات عملية قابلة للتعديل لاحقًا.
              </p>
            </div>
            <div className="space-y-4">
              {step === 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    value={resume.personalInfo.fullName}
                    onChange={(event) =>
                      setResume({
                        ...resume,
                        personalInfo: { ...resume.personalInfo, fullName: event.target.value },
                      })
                    }
                    placeholder="الاسم الكامل"
                  />
                  <Input
                    value={resume.personalInfo.jobTitle}
                    onChange={(event) =>
                      setResume({
                        ...resume,
                        personalInfo: { ...resume.personalInfo, jobTitle: event.target.value },
                      })
                    }
                    placeholder="المسمى الوظيفي"
                  />
                  <Input
                    value={resume.personalInfo.email}
                    onChange={(event) =>
                      setResume({
                        ...resume,
                        personalInfo: { ...resume.personalInfo, email: event.target.value },
                      })
                    }
                    placeholder="البريد الإلكتروني"
                  />
                  <Input
                    value={resume.personalInfo.location}
                    onChange={(event) =>
                      setResume({
                        ...resume,
                        personalInfo: { ...resume.personalInfo, location: event.target.value },
                      })
                    }
                    placeholder="الموقع"
                  />
                </div>
              ) : null}
              {step === 1 ? (
                <Textarea
                  value={resume.personalInfo.summary}
                  onChange={(event) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, summary: event.target.value },
                    })
                  }
                  placeholder="ملخص مهني قصير"
                />
              ) : null}
              {step === 2 ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {["مطور عصري", "طالب مرتب", "احترافي بسيط"].map((template) => (
                    <div key={template} className="rounded-lg border border-slate-200 p-4 text-sm font-semibold dark:border-white/10">
                      {template}
                    </div>
                  ))}
                </div>
              ) : null}
              {step === 3 ? (
                <div className="rounded-lg bg-emerald-500/10 p-5 text-emerald-700 dark:text-emerald-300">
                  مساحة العمل التجريبية جاهزة. انتقل إلى لوحة التحكم لإكمال التفاصيل.
                </div>
              ) : null}
              <div className="flex justify-end gap-2 pt-4">
                {step > 0 ? (
                  <Button variant="secondary" onClick={() => setStep(step - 1)}>
                    رجوع
                  </Button>
                ) : null}
                {step < steps.length - 1 ? (
                  <Button onClick={() => setStep(step + 1)}>
                    متابعة
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </Button>
                ) : (
                  <Button href="/dashboard">الذهاب إلى لوحة التحكم</Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
