"use client";

import Image from "next/image";
import { GitBranch, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/layout/language-provider";
import { fetchGitHubProfile } from "@/lib/github";
import type { GitHubProfile } from "@/types";

export function GitHubConnectCard() {
  const [username, setUsername] = useState("vercel");
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  async function connect() {
    setLoading(true);
    setError("");
    setProfile(null);
    try {
      setProfile(await fetchGitHubProfile(username));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : isArabic
            ? "تعذر جلب بيانات GitHub."
            : "GitHub request failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="grid size-11 place-items-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          <GitBranch className="size-5" />
        </span>
        <div>
          <h2 className="font-bold text-slate-950 dark:text-white">
            {isArabic ? "ربط GitHub" : "Connect GitHub"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isArabic
              ? "اجلب البيانات العامة وحوّل المستودعات إلى مشاريع مقترحة للبورتفوليو."
              : "Fetch public data and turn repositories into suggested portfolio projects."}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder={isArabic ? "اسم مستخدم GitHub" : "GitHub username"}
        />
        <Button onClick={() => void connect()} disabled={loading}>
          <Search className="size-4" />
          {loading
            ? isArabic
              ? "جاري الربط..."
              : "Connecting..."
            : isArabic
              ? "جلب الملف"
              : "Fetch profile"}
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      {profile ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 dark:border-white/10">
            <Image
              src={profile.avatarUrl}
              alt={profile.login}
              width={64}
              height={64}
              className="rounded-full"
            />
            <div>
              <h3 className="font-bold text-slate-950 dark:text-white">
                {profile.name ?? profile.login}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{profile.bio}</p>
              <p className="mt-1 text-xs font-semibold text-cyan-600">
                {profile.publicRepos} {isArabic ? "مستودع عام" : "public repositories"}
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {profile.topRepositories.map((repo) => (
              <div key={repo.id} className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                <h4 className="font-semibold text-slate-950 dark:text-white">{repo.name}</h4>
                <p className="mt-2 min-h-10 text-sm text-slate-500 dark:text-slate-400">
                  {repo.description ??
                    (isArabic
                      ? "لا يوجد وصف بعد. أضف ملخصًا واضحًا للمشروع."
                      : "No description yet. Add a clear project summary.")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {repo.language ? <Badge>{repo.language}</Badge> : null}
                  <Badge>
                    {repo.stargazers_count} {isArabic ? "نجمة" : "stars"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
