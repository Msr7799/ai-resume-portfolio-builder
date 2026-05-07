"use client";

import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import { AIImprovePanel } from "@/components/ai/ai-improve-panel";
import { useLanguage } from "@/components/layout/language-provider";
import { ResumePreview } from "@/components/resume/resume-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { resumeTemplates } from "@/lib/mock-data";
import type { Resume } from "@/types";

const tabs = ["Personal", "Experience", "Education", "Projects", "Skills", "Extras"] as const;
type Tab = (typeof tabs)[number];
const tabLabels: Record<Tab, string> = {
  Personal: "الشخصية",
  Experience: "الخبرات",
  Education: "التعليم",
  Projects: "المشاريع",
  Skills: "المهارات",
  Extras: "إضافات",
};

export function ResumeForm({
  resume,
  onChange,
}: {
  resume: Resume;
  onChange: (resume: Resume) => void;
}) {
  const [draft, setDraft] = useState<Resume>(resume);
  const [tab, setTab] = useState<Tab>("Personal");
  const [message, setMessage] = useState("");
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  const completion = useMemo(() => {
    const fields = Object.values(draft.personalInfo).filter((value) => typeof value === "string");
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [draft.personalInfo]);

  function save() {
    onChange({ ...draft, status: completion > 80 ? "Ready" : "Draft" });
    setMessage(
      isArabic
        ? "تم حفظ التغييرات على هذا الجهاز."
        : "Changes saved on this device.",
    );
    window.setTimeout(() => setMessage(""), 2400);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_480px]">
      <div className="space-y-5">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                {isArabic ? "منشئ السيرة الذاتية" : "Resume builder"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isArabic ? "نسبة الاكتمال" : "Completion"}: {completion}%
              </p>
            </div>
            <Button onClick={save}>
              <Save className="size-4" />
              {isArabic ? "حفظ" : "Save"}
            </Button>
          </div>
          <div className="mt-5 h-2 rounded-full bg-slate-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          {message ? (
            <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {message}
            </p>
          ) : null}
        </Card>

        <Card className="p-2">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((item) => (
              <button
                key={item}
                className={`h-10 shrink-0 rounded-md px-3 text-sm font-semibold transition ${
                  tab === item
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                }`}
                onClick={() => setTab(item)}
              >
                {isArabic ? tabLabels[item] : item}
              </button>
            ))}
          </div>
        </Card>

        {tab === "Personal" ? (
          <Card className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={isArabic ? "الاسم الكامل" : "Full name"}>
                <Input
                  value={draft.personalInfo.fullName}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      personalInfo: { ...draft.personalInfo, fullName: event.target.value },
                    })
                  }
                />
              </Field>
              <Field label={isArabic ? "المسمى الوظيفي" : "Job title"}>
                <Input
                  value={draft.personalInfo.jobTitle}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      personalInfo: { ...draft.personalInfo, jobTitle: event.target.value },
                    })
                  }
                />
              </Field>
              <Field label={isArabic ? "البريد الإلكتروني" : "Email"}>
                <Input
                  value={draft.personalInfo.email}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      personalInfo: { ...draft.personalInfo, email: event.target.value },
                    })
                  }
                />
              </Field>
              <Field label={isArabic ? "الهاتف" : "Phone"}>
                <Input
                  value={draft.personalInfo.phone}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      personalInfo: { ...draft.personalInfo, phone: event.target.value },
                    })
                  }
                />
              </Field>
              <Field label={isArabic ? "الموقع" : "Location"}>
                <Input
                  value={draft.personalInfo.location}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      personalInfo: { ...draft.personalInfo, location: event.target.value },
                    })
                  }
                />
              </Field>
              <Field label={isArabic ? "الموقع الشخصي" : "Website"}>
                <Input
                  value={draft.personalInfo.website}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      personalInfo: { ...draft.personalInfo, website: event.target.value },
                    })
                  }
                />
              </Field>
              <Field label={isArabic ? "GitHub" : "GitHub"}>
                <Input
                  value={draft.personalInfo.github}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      personalInfo: { ...draft.personalInfo, github: event.target.value },
                    })
                  }
                />
              </Field>
              <Field label={isArabic ? "LinkedIn" : "LinkedIn"}>
                <Input
                  value={draft.personalInfo.linkedin}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      personalInfo: { ...draft.personalInfo, linkedin: event.target.value },
                    })
                  }
                />
              </Field>
            </div>
            <Field label={isArabic ? "ملخص قصير" : "Short summary"}>
              <Textarea
                value={draft.personalInfo.summary}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    personalInfo: { ...draft.personalInfo, summary: event.target.value },
                  })
                }
              />
            </Field>
            <AIImprovePanel
              sourceText={draft.personalInfo.summary}
              onApply={(value) =>
                setDraft({ ...draft, personalInfo: { ...draft.personalInfo, summary: value } })
              }
            />
          </Card>
        ) : null}

        {tab === "Experience" ? (
          <Card className="space-y-4">
            {draft.experience.map((experience, index) => (
              <div key={experience.id} className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={isArabic ? "الشركة" : "Company"}>
                    <Input
                      value={experience.company}
                      onChange={(event) => {
                        const next = [...draft.experience];
                        next[index] = { ...experience, company: event.target.value };
                        setDraft({ ...draft, experience: next });
                      }}
                    />
                  </Field>
                  <Field label={isArabic ? "الدور الوظيفي" : "Role"}>
                    <Input
                      value={experience.role}
                      onChange={(event) => {
                        const next = [...draft.experience];
                        next[index] = { ...experience, role: event.target.value };
                        setDraft({ ...draft, experience: next });
                      }}
                    />
                  </Field>
                </div>
                <Field label={isArabic ? "نقاط الوصف" : "Description bullets"}>
                  <Textarea
                    value={experience.bullets.join("\n")}
                    onChange={(event) => {
                      const next = [...draft.experience];
                      next[index] = {
                        ...experience,
                        bullets: event.target.value.split("\n").filter(Boolean),
                      };
                      setDraft({ ...draft, experience: next });
                    }}
                  />
                </Field>
              </div>
            ))}
          </Card>
        ) : null}

        {tab === "Education" ? (
          <Card className="space-y-4">
            {draft.education.map((education, index) => (
              <div key={education.id} className="grid gap-4 md:grid-cols-2">
                <Field label={isArabic ? "المدرسة / الجامعة" : "School / university"}>
                  <Input
                    value={education.school}
                    onChange={(event) => {
                      const next = [...draft.education];
                      next[index] = { ...education, school: event.target.value };
                      setDraft({ ...draft, education: next });
                    }}
                  />
                </Field>
                <Field label={isArabic ? "الدرجة العلمية" : "Degree"}>
                  <Input
                    value={education.degree}
                    onChange={(event) => {
                      const next = [...draft.education];
                      next[index] = { ...education, degree: event.target.value };
                      setDraft({ ...draft, education: next });
                    }}
                  />
                </Field>
                <Field label={isArabic ? "التخصص" : "Field"}>
                  <Input
                    value={education.field}
                    onChange={(event) => {
                      const next = [...draft.education];
                      next[index] = { ...education, field: event.target.value };
                      setDraft({ ...draft, education: next });
                    }}
                  />
                </Field>
                <Field label={isArabic ? "الوصف" : "Description"}>
                  <Input
                    value={education.description}
                    onChange={(event) => {
                      const next = [...draft.education];
                      next[index] = { ...education, description: event.target.value };
                      setDraft({ ...draft, education: next });
                    }}
                  />
                </Field>
              </div>
            ))}
          </Card>
        ) : null}

        {tab === "Projects" ? (
          <Card className="space-y-4">
            {draft.projects.map((project, index) => (
              <div key={project.id} className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                <Field label={isArabic ? "اسم المشروع" : "Project name"}>
                  <Input
                    value={project.name}
                    onChange={(event) => {
                      const next = [...draft.projects];
                      next[index] = { ...project, name: event.target.value };
                      setDraft({ ...draft, projects: next });
                    }}
                  />
                </Field>
                <Field label={isArabic ? "الوصف" : "Description"}>
                  <Textarea
                    value={project.description}
                    onChange={(event) => {
                      const next = [...draft.projects];
                      next[index] = { ...project, description: event.target.value };
                      setDraft({ ...draft, projects: next });
                    }}
                  />
                </Field>
                <Field label={isArabic ? "التقنيات المستخدمة" : "Tech stack"}>
                  <Input
                    value={project.techStack.join(", ")}
                    onChange={(event) => {
                      const next = [...draft.projects];
                      next[index] = {
                        ...project,
                        techStack: event.target.value.split(",").map((item) => item.trim()),
                      };
                      setDraft({ ...draft, projects: next });
                    }}
                  />
                </Field>
              </div>
            ))}
          </Card>
        ) : null}

        {tab === "Skills" ? (
          <Card className="space-y-4">
            {draft.skills.map((skill, index) => (
              <div key={skill.id} className="grid gap-4 md:grid-cols-3">
                <Field label={isArabic ? "الاسم" : "Name"}>
                  <Input
                    value={skill.name}
                    onChange={(event) => {
                      const next = [...draft.skills];
                      next[index] = { ...skill, name: event.target.value };
                      setDraft({ ...draft, skills: next });
                    }}
                  />
                </Field>
                <Field label={isArabic ? "الفئة" : "Category"}>
                  <Input
                    value={skill.category}
                    onChange={(event) => {
                      const next = [...draft.skills];
                      next[index] = { ...skill, category: event.target.value };
                      setDraft({ ...draft, skills: next });
                    }}
                  />
                </Field>
                <Field label={isArabic ? "المستوى" : "Level"}>
                  <Select
                    value={skill.level}
                    onChange={(event) => {
                      const next = [...draft.skills];
                      next[index] = {
                        ...skill,
                        level: event.target.value as typeof skill.level,
                      };
                      setDraft({ ...draft, skills: next });
                    }}
                  >
                    <option value="Beginner">{isArabic ? "مبتدئ" : "Beginner"}</option>
                    <option value="Intermediate">{isArabic ? "متوسط" : "Intermediate"}</option>
                    <option value="Advanced">{isArabic ? "متقدم" : "Advanced"}</option>
                    <option value="Expert">{isArabic ? "خبير" : "Expert"}</option>
                  </Select>
                </Field>
              </div>
            ))}
          </Card>
        ) : null}

        {tab === "Extras" ? (
          <Card className="space-y-4">
            <Field label={isArabic ? "قالب السيرة" : "Resume template"}>
              <Select
                value={draft.templateId}
                onChange={(event) => setDraft({ ...draft, templateId: event.target.value, templateData: {}, templateFieldStates: {} })}
              >
                {resumeTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </Field>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isArabic
                ? "الشهادات واللغات والروابط موجودة في بيانات التجربة وتظهر في المعاينة. نموذج البيانات جاهز لإضافة وحذف الصفوف في التحديث القادم."
                : "Certificates, languages, and links are included from the demo dataset and shown in the preview. The data model is ready for adding/removing rows in the next iteration."}
            </p>
          </Card>
        ) : null}
      </div>

      <div className="hidden xl:block">
        <div className="sticky top-24">
          <ResumePreview resume={draft} />
        </div>
      </div>
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
