"use client";

import { LogIn, Sparkles } from "lucide-react";
import { useState } from "react";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthResponse = {
  error?: string;
};

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    if (!email.includes("@") || password.length < 8) {
      setError("اكتب إيميل صحيح وكلمة مرور لا تقل عن 8 أحرف.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json()) as AuthResponse;
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "تعذر تسجيل الدخول.");
      return;
    }

    window.location.href = "/dashboard/profile";
  }

  return (
    <AuthFrame title="تسجيل الدخول" subtitle="ادخل بحساب MongoDB المحفوظ في التطبيق.">
      <Card className="space-y-4">
        <Input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="البريد الإلكتروني"
        />
        <Input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="كلمة المرور"
          type="password"
        />
        {error ? <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
        <Button className="w-full" onClick={submit} disabled={loading}>
          <LogIn className="size-4" />
          {loading ? "جاري الدخول..." : "تسجيل الدخول"}
        </Button>
      </Card>
    </AuthFrame>
  );
}

function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-black">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Button href="/" variant="ghost">
          <Sparkles className="size-4 text-blue-500" />
          منشئ السيرة
        </Button>
        <div className="flex gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-md">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
