# تقرير التعديل: الثيم + محرر Fabric المجاني

## ما الذي تم تعديله؟

1. تم إصلاح منطق الثيم الليلي/النهاري/system باستخدام `next-themes` بدل منطق `useEffect` اليدوي.
2. تم منع ظهور الصفحة بالثيم النهاري أولًا عند فتح القالب أو الرجوع Back ثم التحول إلى الليلي.
3. تم تعديل صفحة `/dashboard/resume` حتى تنتظر تحميل بيانات السيرة من `localStorage` قبل عرض المحرر، وبذلك لا يظهر `mockResume` أو المحرر القديم لحظة قبل القالب الصحيح.
4. تم حذف محرر Konva بالكامل من الكود.
5. تم إضافة محرر مرئي مجاني مبني على Fabric.js في:
   - `src/components/resume/free-fabric-template-editor.tsx`
6. تم تفعيل محرر Fabric داخل:
   - `src/components/resume/dynamic-template-form.tsx`
7. لم يتم تعديل منطق تسجيل الدخول أو التسجيل حسب طلبك.

## لماذا Fabric بدل Polotno؟

لم يتم استخدام Polotno SDK لأنك طلبت محرر مجاني وليس مدفوع. تم استخدام Fabric.js كمكتبة Canvas مجانية ومفتوحة المصدر، وتعمل داخل محرر القوالب للسحب، تغيير الحجم، وتعديل النص بالدبل كلك.

## كيف يعمل المحرر الآن؟

داخل صفحة السيرة في الداشبورد يوجد وضعان:

- **Fabric مجاني**: المحرر المرئي الجديد للسحب، تغيير الحجم، تحديد العناصر، وتعديل النص بالدبل كلك.
- **HTML**: وضع احتياطي لمعاينة/تحرير القوالب بالطريقة القديمة.

في وضع Fabric:

- اسحب أي عنصر لتغيير مكانه.
- كبّر أو صغّر العنصر من زوايا التحديد.
- دبل كلك على النص لتعديله بسرعة.
- اضغط حفظ أو انتظر الحفظ التلقائي.
- تصدير PDF ما زال يستخدم محرك القوالب الحالي حتى يحافظ على شكل السيرة النهائي.

## الاعتماد الجديد

تمت إضافة الاعتماد التالي في `package.json`:

```bash
pnpm add fabric
```

إذا كان `pnpm-lock.yaml` عندك لم يتحدث بعد، نفّذ:

```bash
pnpm install --no-frozen-lockfile
```

بعدها شغّل المشروع:

```bash
pnpm dev
```

## الملفات المهمة المعدلة

- `package.json`
- `src/components/resume/free-fabric-template-editor.tsx`
- `src/components/resume/dynamic-template-form.tsx`
- `src/components/layout/theme-provider.tsx`
- `src/components/layout/theme-toggle.tsx`
- `src/app/dashboard/resume/page.tsx`
