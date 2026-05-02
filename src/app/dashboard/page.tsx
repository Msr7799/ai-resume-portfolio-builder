"use client";

import { Eye, FileText, FolderGit2, Globe2, Palette, WandSparkles } from "lucide-react";
import { DashboardStatsCard } from "@/components/dashboard/dashboard-stats-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useResume } from "@/hooks/use-resume";
import { profileCompletionScore } from "@/lib/utils";

export default function DashboardPage() {
  const { resume } = useResume();
  const { portfolio } = usePortfolio();
  const completion = profileCompletionScore(Object.values(resume.personalInfo));

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="مساحة العمل"
        title="لوحة التحكم"
        description="مركز إدارة السيرة الذاتية والبورتفوليو والقوالب وبيانات GitHub والنشر."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          icon={WandSparkles}
          label="اكتمال الملف"
          value={`${completion}%`}
          hint="محسوب من حقول المعلومات الشخصية."
        />
        <DashboardStatsCard
          icon={FolderGit2}
          label="المشاريع"
          value={String(resume.projects.length)}
          hint="تظهر داخل السيرة والبورتفوليو."
        />
        <DashboardStatsCard
          icon={Palette}
          label="المهارات"
          value={String(resume.skills.length)}
          hint="مصنفة حسب النوع والمستوى."
        />
        <DashboardStatsCard
          icon={Globe2}
          label="حالة البورتفوليو"
          value={portfolio.published ? "منشور" : "مسودة"}
          hint={`/u/${portfolio.username}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">إجراءات سريعة</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button href="/dashboard/resume">
              <FileText className="size-4" />
              تعديل السيرة
            </Button>
            <Button href="/dashboard/resume/preview" variant="secondary">
              <Eye className="size-4" />
              معاينة السيرة
            </Button>
            <Button href="/dashboard/portfolio" variant="secondary">
              <Globe2 className="size-4" />
              تعديل البورتفوليو
            </Button>
            <Button href={`/u/${portfolio.username}`} variant="secondary">
              عرض الصفحة العامة
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">آخر النشاط</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {[
              "تم اختيار قالب السيرة: Modern Developer",
              "تم حفظ البورتفوليو محليًا",
              "تم إنشاء اقتراح للملخص بالذكاء الاصطناعي",
              "اقتراحات GitHub جاهزة للاستيراد",
            ].map((activity) => (
              <div key={activity} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/5">
                {activity}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
