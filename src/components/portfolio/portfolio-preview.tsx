"use client";

import Image from "next/image";
import { useLanguage } from "@/components/layout/language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPortfolioTheme } from "@/templates/portfolio-template-registry";
import { cn } from "@/lib/utils";
import type { Portfolio, Resume } from "@/types";

export function PortfolioPreview({
  portfolio,
  resume,
  publicMode = false,
}: {
  portfolio: Portfolio;
  resume?: Resume;
  publicMode?: boolean;
}) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const theme = getPortfolioTheme(portfolio.templateId);
  const personalInfo = resume?.personalInfo ?? { email: "", github: "", linkedin: "" } as Resume["personalInfo"];
  const skills = resume?.skills ?? [];
  const experience = resume?.experience ?? [];
  const education = resume?.education ?? [];
  const projects = (resume?.projects ?? []).filter((project) =>
    portfolio.featuredProjectIds.includes(project.id),
  );

  return (
    <div className={cn("overflow-hidden rounded-lg border shadow-sm", theme.pageBg, theme.borderColor)}>
      <section className={cn("relative border-b px-5 py-12 md:px-10", theme.borderColor)}>
        <div className={cn("absolute inset-0", theme.heroGradient)} />
        <div className="relative max-w-3xl">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold", theme.accentBg, theme.accentText)}>
            {portfolio.published
              ? isArabic
                ? "ملف منشور"
                : "Published profile"
              : isArabic
                ? "مسودة"
                : "Draft profile"}
          </span>
          <h1 className={cn("mt-5 text-4xl font-bold tracking-tight md:text-6xl", theme.textPrimary)}>
            {portfolio.headline}
          </h1>
          <p className={cn("mt-5 text-lg leading-8", theme.textSecondary)}>
            {portfolio.subheadline}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {personalInfo.email ? (
              <a href={`mailto:${personalInfo.email}`} className={cn("inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition", theme.buttonPrimary)}>
                {isArabic ? "راسلني" : "Email me"}
              </a>
            ) : null}
            {personalInfo.github ? (
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className={cn("inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition", theme.buttonSecondary)}>
                GitHub
              </a>
            ) : null}
            {personalInfo.linkedin ? (
              <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className={cn("inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition", theme.buttonSecondary)}>
                LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className={cn("grid gap-8 px-5 py-10 md:grid-cols-[0.8fr_1.2fr] md:px-10")}>
        <div>
          <h2 className={cn("text-xl font-bold", theme.textPrimary)}>{isArabic ? "نبذة" : "About"}</h2>
          <p className={cn("mt-3 text-sm leading-7", theme.textSecondary)}>
            {portfolio.about}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill.id} className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", theme.accentBg, theme.accentText)}>
                {skill.name}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <h2 className={cn("text-xl font-bold", theme.textPrimary)}>
            {isArabic ? "المشاريع المميزة" : "Featured projects"}
          </h2>
          {projects.map((project) => (
            <article
              key={project.id}
              className={cn("overflow-hidden rounded-lg border", theme.cardBg)}
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
                <h3 className={cn("font-bold", theme.textPrimary)}>{project.name}</h3>
                <p className={cn("mt-2 text-sm leading-6", theme.textSecondary)}>
                  {project.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span key={tech} className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs font-medium", theme.accentBg, theme.accentText)}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={cn("grid gap-6 border-t px-5 py-10 md:grid-cols-2 md:px-10", theme.borderColor)}>
        <div>
          <h2 className={cn("text-xl font-bold", theme.textPrimary)}>{isArabic ? "الخبرات" : "Experience"}</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mt-4">
              <p className={cn("font-semibold", theme.textPrimary)}>{exp.role}</p>
              <p className={cn("text-sm", theme.textSecondary)}>
                {exp.company} · {exp.startDate} -{" "}
                {exp.current ? (isArabic ? "حتى الآن" : "Present") : exp.endDate}
              </p>
            </div>
          ))}
        </div>
        <div>
          <h2 className={cn("text-xl font-bold", theme.textPrimary)}>{isArabic ? "التعليم" : "Education"}</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mt-4">
              <p className={cn("font-semibold", theme.textPrimary)}>
                {edu.degree} · {edu.field}
              </p>
              <p className={cn("text-sm", theme.textSecondary)}>{edu.school}</p>
            </div>
          ))}
        </div>
      </section>

      {publicMode ? (
        <footer className={cn("border-t px-5 py-6 text-sm", theme.borderColor, theme.textSecondary)}>
          {isArabic
            ? "بني باستخدام منشئ السيرة والبورتفوليو بالذكاء الاصطناعي."
            : "Built with AI Resume & Portfolio Builder."}
        </footer>
      ) : null}
    </div>
  );
}
