"use client";

import { RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { storageService } from "@/lib/storage";
import type { UserProfile } from "@/types";

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile>(() => storageService.getUser());
  const [message, setMessage] = useState("");

  function save() {
    storageService.saveUser(user);
    setMessage("تم حفظ الإعدادات.");
    window.setTimeout(() => setMessage(""), 2000);
  }

  function reset() {
    storageService.resetDemoData();
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="الحساب"
        title="الإعدادات"
        description="إعدادات الملف الشخصي وطريقة ظهور بياناتك داخل التطبيق."
      />
      <Card className="max-w-2xl space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold">الاسم</span>
          <Input value={user.name} onChange={(event) => setUser({ ...user, name: event.target.value })} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold">اسم المستخدم</span>
          <Input
            value={user.username}
            onChange={(event) => setUser({ ...user, username: event.target.value })}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold">البريد الإلكتروني</span>
          <Input
            value={user.email}
            onChange={(event) => setUser({ ...user, email: event.target.value })}
          />
        </label>
        {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button onClick={save}>
            <Save className="size-4" />
            حفظ الإعدادات
          </Button>
          <Button onClick={reset} variant="secondary">
            <RotateCcw className="size-4" />
            إعادة ضبط البيانات التجريبية
          </Button>
        </div>
      </Card>
    </div>
  );
}
