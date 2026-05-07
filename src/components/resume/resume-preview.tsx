"use client";

import { useLanguage } from "@/components/layout/language-provider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatList } from "@/lib/utils";
import type { Resume } from "@/types";

export function ResumePreview({ resume }: { resume: Resume }) {
  const { personalInfo } = resume;
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  return (
    <Card className="resume-print mx-auto max-w-4xl bg-white p-0 text-slate-950 shadow-xl dark:bg-white dark:text-slate-950">
      <div className="grid gap-0 md:grid-cols-[0.78fr_1.22fr]">
        <aside className="space-y-6 bg-slate-950 p-7 text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">
              {isArabic ? "السيرة الذاتية" : "Resume"}
            </p>
            <h2 className="mt-3 text-3xl font-bold">{personalInfo.fullName}</h2>
            <p className="mt-2 text-cyan-100">{personalInfo.jobTitle}</p>
          </div>
          <div className="space-y-2 text-sm text-slate-200">
            <p>{personalInfo.email}</p>
            <p>{personalInfo.phone}</p>
            <p>{personalInfo.location}</p>
            <p>{personalInfo.website}</p>
            <p>{personalInfo.github}</p>
            <p>{personalInfo.linkedin}</p>
          </div>
          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">
              {isArabic ? "المهارات" : "Skills"}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span key={skill.id} className="rounded-md bg-white/10 px-2 py-1 text-xs">
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">
              {isArabic ? "اللغات" : "Languages"}
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              {resume.languages.map((language) => (
                <p key={language.id}>
                  {language.language} · {language.proficiency}
                </p>
              ))}
            </div>
          </section>
        </aside>

        <div className="space-y-7 p-7">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              {isArabic ? "الملخص المهني" : "Professional Summary"}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-700">{personalInfo.summary}</p>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              {isArabic ? "الخبرات" : "Experience"}
            </h3>
            <div className="mt-4 space-y-5">
              {resume.experience.map((experience) => (
                <div key={experience.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <h4 className="font-bold">{experience.role}</h4>
                      <p className="text-sm text-slate-600">
                        {experience.company} · {experience.location}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">
                      {experience.startDate} -{" "}
                      {experience.current ? (isArabic ? "حتى الآن" : "Present") : experience.endDate}
                    </p>
                  </div>
                  <ul className="mt-3 list-disc space-y-1 ps-5 text-sm leading-6 text-slate-700">
                    {experience.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {formatList(experience.technologies)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              {isArabic ? "المشاريع" : "Projects"}
            </h3>
            <div className="mt-4 space-y-4">
              {resume.projects.map((project) => (
                <div key={project.id} className="rounded-lg border border-slate-200 p-4">
                  <h4 className="font-bold">{project.name}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{project.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <Badge key={tech} className="border-slate-200 bg-slate-50 text-slate-700">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              {isArabic ? "التعليم" : "Education"}
            </h3>
            {resume.education.map((education) => (
              <div key={education.id} className="mt-3 text-sm">
                <p className="font-bold">
                  {education.degree} {isArabic ? "في" : "in"} {education.field}
                </p>
                <p className="text-slate-600">
                  {education.school} · {education.startDate} - {education.endDate}
                </p>
                <p className="mt-1 leading-6 text-slate-700">{education.description}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </Card>
  );
}
