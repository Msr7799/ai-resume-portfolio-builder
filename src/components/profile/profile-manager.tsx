"use client";

import { LogOut, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AuthUser } from "@/types/auth";

type UserResponse = {
  user: AuthUser | null;
  error?: string;
};

export function ProfileManager() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    void fetch("/api/profile")
      .then((response) => response.json())
      .then((data: UserResponse) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setError("تعذر تحميل بيانات المستخدم.");
        setLoading(false);
      });
  }, []);

  async function save() {
    if (!user) return;
    setError("");
    setMessage("");
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    const data = (await response.json()) as UserResponse;
    if (!response.ok || !data.user) {
      setError(data.error ?? "تعذر تحديث المستخدم.");
      return;
    }
    setUser(data.user);
    setMessage("تم تحديث البروفايل.");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth/sign-in";
  }

  async function deleteAccount() {
    const confirmed = window.confirm("هل أنت متأكد؟ سيتم حذف الحساب وكل السير والبورتفوليو المحفوظة.");
    if (!confirmed) return;
    await fetch("/api/profile", { method: "DELETE" });
    window.location.href = "/auth/sign-in";
  }

  async function uploadAvatar(file: File) {
    if (!user) return;
    setUploadingAvatar(true);
    setError("");
    const reader = new FileReader();
    reader.onload = async () => {
      const response = await fetch("/api/uploads/profile-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileDataUrl: String(reader.result ?? "") }),
      });
      const data = (await response.json()) as UserResponse;
      setUploadingAvatar(false);
      if (!response.ok || !data.user) {
        setError(data.error ?? "تعذر رفع الصورة.");
        return;
      }
      setUser(data.user);
      setMessage("تم رفع صورة المستخدم.");
    };
    reader.onerror = () => {
      setUploadingAvatar(false);
      setError("تعذر قراءة الصورة.");
    };
    reader.readAsDataURL(file);
  }

  if (loading) {
    return <Card>جاري تحميل البروفايل...</Card>;
  }

  if (!user) {
    return (
      <Card className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-zinc-400">لا يوجد مستخدم مسجل دخول.</p>
        <Button href="/auth/sign-in">تسجيل الدخول</Button>
      </Card>
    );
  }

  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="grid size-16 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 via-emerald-400 to-amber-400 text-lg font-bold text-white">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name} className="size-full object-cover" />
          ) : (
            user.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">{user.name}</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">{user.email}</p>
          <p className="text-xs text-slate-400">
            آخر تسجيل دخول:{" "}
            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("ar") : "غير مسجل"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="الاسم">
          <Input value={user.name} onChange={(event) => setUser({ ...user, name: event.target.value })} />
        </Field>
        <Field label="اسم المستخدم">
          <Input
            value={user.username}
            onChange={(event) => setUser({ ...user, username: event.target.value })}
          />
        </Field>
        <Field label="البريد الإلكتروني">
          <Input value={user.email} onChange={(event) => setUser({ ...user, email: event.target.value })} />
        </Field>
      </div>

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-4 text-sm font-medium text-slate-500 transition hover:border-blue-500 dark:border-zinc-800 dark:text-zinc-400">
        <Upload className="size-4 text-blue-500" />
        {uploadingAvatar ? "جاري رفع الصورة..." : "تحديث صورة المستخدم"}
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void uploadAvatar(file);
          }}
        />
      </label>

      {message ? <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button onClick={save}>
          <Save className="size-4" />
          تحديث المستخدم
        </Button>
        <Button onClick={logout} variant="secondary">
          <LogOut className="size-4" />
          تسجيل الخروج
        </Button>
        <Button onClick={deleteAccount} variant="danger">
          <Trash2 className="size-4" />
          حذف الحساب
        </Button>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
