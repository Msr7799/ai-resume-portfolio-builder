"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Locale } from "@/types";

const dictionary = {
  en: {
    startBuilding: "Start Building",
    dashboard: "Dashboard",
    resume: "Resume",
    portfolio: "Portfolio",
    templates: "Templates",
    github: "GitHub",
    profile: "Profile",
    settings: "Settings",
    preview: "Preview",
    exportPdf: "Download / Print PDF",
    save: "Save changes",
    signIn: "Sign in",
    signUp: "Sign up",
    system: "System",
    light: "Light",
    dark: "Dark",
    language: "العربية",
    appName: "AI Resume & Portfolio Builder",
    brandShort: "AI Career Kit",
    heroTitle: "Build a resume, portfolio, and public profile that feel ready for opportunity.",
    heroText:
      "A practical builder for students, junior developers, freelancers, and engineers who need polished career materials without starting from a blank page.",
    navPricing: "Pricing",
    navTemplates: "Templates",
    navFeatures: "Features",
    heroBadge: "AI-assisted · bilingual · print-ready",
    viewDashboard: "View dashboard",
    localFirst: "Local-first MVP",
    noClientKeys: "No client API keys",
    arabicEnglish: "Arabic + English",
    liveResumePreview: "Live resume preview",
    readyScore: "ready 92%",
    productEyebrow: "Product",
    productTitle: "Everything needed for a real career profile.",
    featureResumeTitle: "Resume builder",
    featureResumeText: "Structured CV sections with print-ready preview.",
    featureAiTitle: "AI writing help",
    featureAiText: "Improve summaries, bullets, ATS wording, and project copy.",
    featurePortfolioTitle: "Public portfolio",
    featurePortfolioText: "Publish a profile page with projects, skills, and contact links.",
    featureGithubTitle: "GitHub import",
    featureGithubText: "Fetch public profile data and discover portfolio-ready repositories.",
    featureTemplatesTitle: "Templates",
    featureTemplatesText: "Choose CV and portfolio styles for different career stages.",
    featureDashboardTitle: "Dashboard",
    featureDashboardText: "Manage resume, portfolio, stats, settings, and activity.",
    templatesEyebrow: "Templates",
    templatesTitle: "Canva resume templates carousel",
    templatesText:
      "Your exported Canva designs live in public/templates and appear here as reusable visual CV templates.",
    openTemplatesGallery: "Open templates gallery",
    useTemplate: "Use template",
    addMoreTemplates:
      "Add more templates later inside public/templates and register them in the template registry.",
    swipeTemplates: "Swipe left or right to browse templates",
    stepOne: "1. Onboard",
    stepOneTitle: "Enter profile data",
    stepTwo: "2. Build",
    stepTwoTitle: "Create CV and portfolio",
    stepThree: "3. Publish",
    stepThreeTitle: "Export or share",
    stepText: "Move through guided steps, edit details later, and keep everything saved locally.",
    pricingEyebrow: "MVP pricing placeholder",
    pricingTitle: "Free demo today. SaaS plans ready later.",
    pricingText: "Add payments, teams, custom domains, and real AI credits in future iterations.",
    selected: "Selected",
    useSelectedTemplate: "Use selected template",
    myCvTemplateName: "My CV Visual Template",
    myCvTemplateDescription: "One-page visual CV based on the Canva design.",
  },
  ar: {
    startBuilding: "ابدأ البناء",
    dashboard: "لوحة التحكم",
    resume: "السيرة الذاتية",
    portfolio: "البورتفوليو",
    templates: "القوالب",
    github: "GitHub",
    profile: "البروفايل",
    settings: "الإعدادات",
    preview: "المعاينة",
    exportPdf: "تحميل / طباعة PDF",
    save: "حفظ التغييرات",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    system: "النظام",
    light: "فاتح",
    dark: "داكن",
    language: "English",
    appName: "منشئ السيرة والبورتفوليو بالذكاء الاصطناعي",
    brandShort: "منشئ السيرة والبورتفوليو",
    heroTitle: "ابنِ سيرة ذاتية وبورتفوليو وصفحة عامة جاهزة للفرص المهنية.",
    heroText:
      "منصة عملية للطلاب والمطورين الجدد والمستقلين والمهندسين لإنشاء ملف مهني مصقول بدون البدء من الصفر.",
    navPricing: "الأسعار",
    navTemplates: "القوالب",
    navFeatures: "الميزات",
    heroBadge: "مدعوم بالذكاء الاصطناعي · عربي وإنجليزي · جاهز للطباعة",
    viewDashboard: "عرض لوحة التحكم",
    localFirst: "حفظ محلي أولًا",
    noClientKeys: "لا توجد مفاتيح API في المتصفح",
    arabicEnglish: "عربي + إنجليزي",
    liveResumePreview: "معاينة مباشرة للسيرة",
    readyScore: "جاهز 92%",
    productEyebrow: "المنتج",
    productTitle: "كل ما تحتاجه لبناء ملف مهني حقيقي.",
    featureResumeTitle: "منشئ السيرة الذاتية",
    featureResumeText: "أقسام CV منظمة مع معاينة جاهزة للطباعة.",
    featureAiTitle: "مساعد كتابة ذكي",
    featureAiText: "تحسين الملخصات والنقاط والكلمات المناسبة للـATS ووصف المشاريع.",
    featurePortfolioTitle: "بورتفوليو عام",
    featurePortfolioText: "انشر صفحة شخصية تعرض المشاريع والمهارات وروابط التواصل.",
    featureGithubTitle: "استيراد GitHub",
    featureGithubText: "اجلب بيانات GitHub العامة واقترح مشاريع مناسبة للبورتفوليو.",
    featureTemplatesTitle: "القوالب",
    featureTemplatesText: "اختر قوالب للسيرة والبورتفوليو تناسب مراحل مهنية مختلفة.",
    featureDashboardTitle: "لوحة التحكم",
    featureDashboardText: "إدارة السيرة والبورتفوليو والإحصائيات والإعدادات والنشاط.",
    templatesEyebrow: "القوالب",
    templatesTitle: "كاروسيل قوالب السيرة من Canva",
    templatesText:
      "تصاميم Canva التي تصدرها توضع داخل public/templates وتظهر هنا كقوالب CV مرئية قابلة لإعادة الاستخدام.",
    openTemplatesGallery: "فتح معرض القوالب",
    useTemplate: "استخدام القالب",
    addMoreTemplates:
      "أضف قوالب أكثر لاحقًا داخل public/templates وسجلها في ملف القوالب.",
    swipeTemplates: "اسحب يمينًا أو يسارًا لتصفح القوالب",
    stepOne: "1. البداية",
    stepOneTitle: "أدخل بيانات الملف",
    stepTwo: "2. البناء",
    stepTwoTitle: "أنشئ السيرة والبورتفوليو",
    stepThree: "3. النشر",
    stepThreeTitle: "صدّر أو شارك",
    stepText: "انتقل عبر خطوات واضحة، وعدّل التفاصيل لاحقًا، واحتفظ بكل شيء محفوظًا.",
    pricingEyebrow: "تسعير تجريبي للـMVP",
    pricingTitle: "نسخة مجانية الآن، وخطط SaaS لاحقًا.",
    pricingText: "يمكن إضافة الدفع والفرق والنطاقات المخصصة ورصيد الذكاء الاصطناعي لاحقًا.",
    selected: "محدد",
    useSelectedTemplate: "استخدام القالب المحدد",
    myCvTemplateName: "قالب My CV المرئي",
    myCvTemplateDescription: "سيرة ذاتية من صفحة واحدة مبنية على تصميم Canva.",
  },
} as const;

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: keyof typeof dictionary.en) => string;
  isRtl: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const LOCALE_KEY = "airpb:locale";
const LOCALE_EVENT = "airpb:locale-change";

function normalizeLocale(value: string | null): Locale {
  return value === "en" ? "en" : "ar";
}

function getLocaleSnapshot(): Locale {
  if (typeof window === "undefined") return "ar";
  return normalizeLocale(window.localStorage.getItem(LOCALE_KEY));
}

function subscribeLocale(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCALE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCALE_EVENT, callback);
  };
}

function writeLocale(locale: Locale) {
  window.localStorage.setItem(LOCALE_KEY, locale);
  window.dispatchEvent(new Event(LOCALE_EVENT));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore<Locale>(subscribeLocale, getLocaleSnapshot, () => "ar");

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: writeLocale,
      toggleLocale: () => writeLocale(locale === "en" ? "ar" : "en"),
      t: (key) => dictionary[locale][key],
      isRtl: locale === "ar",
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
