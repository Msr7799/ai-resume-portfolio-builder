# تقرير تعديل محرر Fabric النصي

## ما تم إصلاحه

- تم إلغاء استخدام `window.prompt` عند عمل Double Click على النص داخل محرر Fabric.
- أصبح Double Click يفتح نافذة محرر نص احترافية داخل الموقع بدل Alert المتصفح.
- تمت إضافة زر `تحرير النص / Edit text` في شريط محرر Fabric عند تحديد أي عنصر نصي.
- تمت إضافة أدوات تنسيق داخل النافذة:
  - Bold
  - Italic
  - Underline
  - Strike-through
  - Bullets
  - المحاذاة: Left / Center / Right / Justify
  - اتجاه الكتابة: LTR / RTL
  - نوع الخط
  - حجم الخط
  - ارتفاع السطر
  - لون الخط
- تمت إضافة معاينة مباشرة داخل نافذة التحرير قبل الضغط على تطبيق.
- عند الضغط على `تطبيق` يتم تحديث النص والتنسيق في بيانات القالب، ثم يعاد رسم Fabric بالبيانات الجديدة.

## الملفات التي تم تعديلها

- `src/components/resume/free-fabric-template-editor.tsx`
- `src/components/resume/dynamic-template-form.tsx`
- `src/components/ui/textarea.tsx`
- `src/types/template.ts`
- `src/lib/template-data.ts`
- `src/components/resume/template-live-preview.tsx`
- `src/lib/pdf/canva-resume-pdf.tsx`

## ملاحظات التشغيل

المشروع يستخدم `fabric` من `package.json`. إذا كان `pnpm-lock.yaml` عندك قديمًا، شغّل:

```bash
pnpm install --no-frozen-lockfile
pnpm dev
```

أو إذا لم تكن مكتبة Fabric مثبتة عندك:

```bash
pnpm add fabric
pnpm dev
```

لم يتم تعديل منطق تسجيل الدخول أو التسجيل.
