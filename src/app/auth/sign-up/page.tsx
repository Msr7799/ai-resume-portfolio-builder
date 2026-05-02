"use client";

import { Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { UserRole } from "@/types/auth";

type AuthResponse = {
  error?: string;
};

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    if (name.trim().length < 2 || !email.includes("@") || password.length < 8) {
      setError("أدخل الاسم، إيميل صحيح، وكلمة مرور 8 أحرف أو أكثر.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, email, password, role }),
    });
    const data = (await response.json()) as AuthResponse;
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "تعذر إنشاء الحساب.");
      return;
    }

    window.location.href = "/onboarding";
  }

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
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">إنشاء حساب</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
          الإيميل فريد في MongoDB، والدور يمكن أن يكون user أو admin.
        </p>
        <Card className="mt-6 space-y-4">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="الاسم الكامل" />
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="اسم المستخدم"
          />
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="البريد الإلكتروني" />
          <Input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="كلمة المرور"
            type="password"
          />
          <Select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
            <option value="user">مستخدم</option>
            <option value="admin">أدمن</option>
          </Select>
          {error ? <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
          <Button className="w-full" onClick={submit} disabled={loading}>
            <UserPlus className="size-4" />
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </Button>
        </Card>
      </div>
    </main>
  );
}
