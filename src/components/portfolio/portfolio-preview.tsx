"use client";

import Image from "next/image";
import { useLanguage } from "@/components/layout/language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Portfolio, Resume } from "@/types";

export function PortfolioPreview({
  portfolio,
  resume,
  publicMode = false,
}: {
  portfolio: Portfolio;
  resume: Resume;
  publicMode?: boolean;
}) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const projects = resume.projects.filter((project) =>
    portfolio.featuredProjectIds.includes(project.id),
  );

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-white">
      <section className="relative border-b border-slate-200 px-5 py-12 dark:border-white/10 md:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_35%)]" />
        <div className="relative max-w-3xl">
          <Badge>
            {portfolio.published
              ? isArabic
                ? "ملف منشور"
                : "Published profile"
              : isArabic
                ? "مسودة"
                : "Draft profile"}
          </Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
            {portfolio.headline}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            {portfolio.subheadline}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href={`mailto:${resume.personalInfo.email}`}>
              {isArabic ? "راسلني" : "Email me"}
            </Button>
            <Button href={resume.personalInfo.github} variant="secondary">
              GitHub
            </Button>
            <Button href={resume.personalInfo.linkedin} variant="ghost">
              LinkedIn
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-8 px-5 py-10 md:grid-cols-[0.8fr_1.2fr] md:px-10">
        <div>
          <h2 className="text-xl font-bold">{isArabic ? "نبذة" : "About"}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {portfolio.about}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <Badge key={skill.id}>{skill.name}</Badge>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <h2 className="text-xl font-bold">
            {isArabic ? "المشاريع المميزة" : "Featured projects"}
          </h2>
          {projects.map((project) => (
            <article
              key={project.id}
              className="overflow-hidden rounded-lg border border-slate-200 dark:border-white/10"
            >
              <div className="relative h-48">
                <Image
                  src={project.imageUrl}
                  alt={project.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 560px"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold">{project.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {project.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 border-t border-slate-200 px-5 py-10 dark:border-white/10 md:grid-cols-2 md:px-10">
        <div>
          <h2 className="text-xl font-bold">{isArabic ? "الخبرات" : "Experience"}</h2>
          {resume.experience.map((experience) => (
            <div key={experience.id} className="mt-4">
              <p className="font-semibold">{experience.role}</p>
              <p className="text-sm text-slate-500">
                {experience.company} · {experience.startDate} -{" "}
                {experience.current ? (isArabic ? "حتى الآن" : "Present") : experience.endDate}
              </p>
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-xl font-bold">{isArabic ? "التعليم" : "Education"}</h2>
          {resume.education.map((education) => (
            <div key={education.id} className="mt-4">
              <p className="font-semibold">
                {education.degree} · {education.field}
              </p>
              <p className="text-sm text-slate-500">{education.school}</p>
            </div>
          ))}
        </div>
      </section>

      {publicMode ? (
        <footer className="border-t border-slate-200 px-5 py-6 text-sm text-slate-500 dark:border-white/10 md:px-10">
          {isArabic
            ? "بني باستخدام منشئ السيرة والبورتفوليو بالذكاء الاصطناعي."
            : "Built with AI Resume & Portfolio Builder."}
        </footer>
      ) : null}
    </div>
  );
}
