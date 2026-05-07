"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, LogIn, Mail, Sparkles, UserPlus } from "lucide-react";
import type { ChangeEventHandler, FormEvent } from "react";
import { useState } from "react";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useLanguage } from "@/components/layout/language-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up" | "reset-password";
type ResetStep = "request" | "confirm";
type LoadingAction = AuthMode | "reset-request" | "reset-confirm";

type AuthCardProps = {
  initialMode?: AuthMode;
  initialError?: string;
  initialResetEmail?: string;
  initialResetToken?: string;
};

type AuthResponse = {
  error?: string;
  resetToken?: string;
  resetUrl?: string;
};

const copy = {
  ar: {
    appName: "منشئ السيرة",
    signInTitle: "تسجيل الدخول",
    signInSubtitle: "ادخل إلى حسابك واحفظ سيرتك وبورتفوليوك بأمان.",
    signUpTitle: "إنشاء حساب",
    signUpSubtitle: "ابدأ بحساب جديد لحفظ أعمالك ومتابعة تقدمك.",
    resetTitle: "إعادة كلمة المرور",
    resetSubtitle: "اطلب رمز استرجاع ثم عيّن كلمة مرور جديدة لحسابك.",
    name: "الاسم الكامل",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    resetToken: "رمز الاسترجاع",
    newPassword: "كلمة المرور الجديدة",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    forgotPassword: "نسيت كلمة المرور؟",
    sendResetLink: "إرسال رمز الاسترجاع",
    resetPassword: "تغيير كلمة المرور",
    signingIn: "جاري الدخول...",
    signingUp: "جاري إنشاء الحساب...",
    sendingResetLink: "جاري إنشاء الرمز...",
    resettingPassword: "جاري تغيير كلمة المرور...",
    needAccount: "مستخدم جديد؟",
    createAccount: "إنشاء حساب جديد",
    haveAccount: "لديك حساب؟",
    backToSignIn: "الرجوع لتسجيل الدخول",
    backToResetRequest: "طلب رمز جديد",
    invalidSignIn: "اكتب إيميل صحيح وكلمة مرور لا تقل عن 8 أحرف.",
    invalidSignUp: "أدخل الاسم، اسم المستخدم، إيميل صحيح، وكلمة مرور 8 أحرف أو أكثر.",
    invalidResetRequest: "اكتب إيميل صحيح لإرسال رمز الاسترجاع.",
    invalidResetConfirm: "أدخل الإيميل، رمز الاسترجاع، وكلمة مرور جديدة لا تقل عن 8 أحرف.",
    duplicate: "يوجد حساب بنفس البريد أو اسم المستخدم.",
    emailDuplicate: "يوجد حساب مسجل بهذا البريد الإلكتروني.",
    usernameDuplicate: "اسم المستخدم مستخدم مسبقًا.",
    signInFailed: "البريد أو كلمة المرور غير صحيحة.",
    signUpFailed: "تعذر إنشاء الحساب. حاول مرة أخرى.",
    resetFailed: "تعذر إعادة كلمة المرور. تحقق من الرمز أو اطلب رمزًا جديدًا.",
    resetRequested: "إذا كان البريد مسجلًا، تم إنشاء رمز استرجاع صالح لمدة 15 دقيقة.",
    resetReady: "تم تجهيز رابط الاسترجاع لهذا الحساب.",
    resetSuccess: "تم تغيير كلمة المرور. يمكنك تسجيل الدخول الآن.",
    googleFailed: "تعذر تسجيل الدخول بقوقل. تحقق من إعدادات Google OAuth ثم حاول مرة أخرى.",
    openResetLink: "فتح رابط الاسترجاع",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
  },
  en: {
    appName: "Resume Builder",
    signInTitle: "Sign in",
    signInSubtitle: "Access your account and keep your resume and portfolio saved securely.",
    signUpTitle: "Create account",
    signUpSubtitle: "Start a new account to save your work and track your progress.",
    resetTitle: "Reset password",
    resetSubtitle: "Request a reset token, then set a new password for your account.",
    name: "Full name",
    username: "Username",
    email: "Email address",
    password: "Password",
    resetToken: "Reset token",
    newPassword: "New password",
    signIn: "Sign in",
    signUp: "Create account",
    forgotPassword: "Forgot password?",
    sendResetLink: "Send reset token",
    resetPassword: "Change password",
    signingIn: "Signing in...",
    signingUp: "Creating account...",
    sendingResetLink: "Creating token...",
    resettingPassword: "Changing password...",
    needAccount: "New here?",
    createAccount: "Create a new account",
    haveAccount: "Already have an account?",
    backToSignIn: "Back to sign in",
    backToResetRequest: "Request a new token",
    invalidSignIn: "Enter a valid email and a password with at least 8 characters.",
    invalidSignUp: "Enter your name, username, a valid email, and a password with at least 8 characters.",
    invalidResetRequest: "Enter a valid email to request a reset token.",
    invalidResetConfirm: "Enter your email, reset token, and a new password with at least 8 characters.",
    duplicate: "An account with this email or username already exists.",
    emailDuplicate: "An account with this email already exists.",
    usernameDuplicate: "This username is already taken.",
    signInFailed: "Email or password is incorrect.",
    signUpFailed: "Account could not be created. Please try again.",
    resetFailed: "Password reset failed. Check the token or request a new one.",
    resetRequested: "If that email exists, a reset token was created for 15 minutes.",
    resetReady: "A reset link is ready for this account.",
    resetSuccess: "Password changed. You can sign in now.",
    googleFailed: "Google sign-in failed. Check the Google OAuth settings and try again.",
    openResetLink: "Open reset link",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
} as const;

export function AuthCard({
  initialMode = "sign-in",
  initialError = "",
  initialResetEmail = "",
  initialResetToken = "",
}: AuthCardProps) {
  const { locale, isRtl } = useLanguage();
  const text = copy[locale];
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [resetStep, setResetStep] = useState<ResetStep>(initialResetToken ? "confirm" : "request");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [resetEmail, setResetEmail] = useState(initialResetEmail);
  const [resetToken, setResetToken] = useState(initialResetToken);
  const [resetLink, setResetLink] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [error, setError] = useState(initialError ? copy[locale].googleFailed : "");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState<LoadingAction | null>(null);

  const title =
    mode === "sign-in" ? text.signInTitle : mode === "sign-up" ? text.signUpTitle : text.resetTitle;
  const subtitle =
    mode === "sign-in" ? text.signInSubtitle : mode === "sign-up" ? text.signUpSubtitle : text.resetSubtitle;
  const FlipIcon = isRtl ? ArrowLeft : ArrowRight;
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  function flip(nextMode: AuthMode) {
    setError("");
    setNotice("");
    setMode(nextMode);
  }

  function signInWithGoogle() {
    setError("");
    setNotice("");
    window.location.href = "/api/auth/google";
  }

  async function submitSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!signInEmail.includes("@") || signInPassword.length < 8) {
      setError(text.invalidSignIn);
      return;
    }

    setLoading("sign-in");
    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signInEmail, password: signInPassword }),
      });
      await safeReadJson(response);

      if (!response.ok) {
        setError(text.signInFailed);
        return;
      }

      window.location.href = "/dashboard/profile";
    } catch {
      setError(text.signInFailed);
    } finally {
      setLoading(null);
    }
  }

  async function submitSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (
      name.trim().length < 2 ||
      username.trim().length < 2 ||
      !signUpEmail.includes("@") ||
      signUpPassword.length < 8
    ) {
      setError(text.invalidSignUp);
      return;
    }

    setLoading("sign-up");
    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email: signUpEmail, password: signUpPassword }),
      });
      const data = await safeReadJson(response);

      if (!response.ok) {
        if (response.status === 409 && data?.error === "Email already exists.") setError(text.emailDuplicate);
        else if (response.status === 409 && data?.error === "Username already exists.") setError(text.usernameDuplicate);
        else setError(response.status === 409 ? text.duplicate : text.signUpFailed);
        return;
      }

      window.location.href = "/onboarding";
    } catch {
      setError(text.signUpFailed);
    } finally {
      setLoading(null);
    }
  }

  async function submitResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setResetLink("");
    if (!resetEmail.includes("@")) {
      setError(text.invalidResetRequest);
      return;
    }

    setLoading("reset-request");
    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await safeReadJson(response);

      if (!response.ok) {
        setError(text.invalidResetRequest);
        return;
      }

      setNotice(data?.resetUrl ? text.resetReady : text.resetRequested);
      if (data?.resetUrl) {
        setResetLink(data.resetUrl);
        setResetToken(data.resetToken ?? "");
        setResetStep("confirm");
      }
    } catch {
      setError(text.resetFailed);
    } finally {
      setLoading(null);
    }
  }

  async function submitResetConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!resetEmail.includes("@") || resetToken.trim().length < 16 || resetPassword.length < 8) {
      setError(text.invalidResetConfirm);
      return;
    }

    setLoading("reset-confirm");
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, token: resetToken, password: resetPassword }),
      });
      await safeReadJson(response);

      if (!response.ok) {
        setError(text.resetFailed);
        return;
      }

      setSignInEmail(resetEmail);
      setSignInPassword("");
      setResetPassword("");
      setResetToken("");
      setResetLink("");
      setResetStep("request");
      setMode("sign-in");
      setNotice(text.resetSuccess);
    } catch {
      setError(text.resetFailed);
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-black">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Button href="/" variant="ghost">
          <Sparkles className="size-4 text-blue-500" />
          {text.appName}
        </Button>
        <div className="flex gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-md text-center">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">{subtitle}</p>

        <Card className="mt-6">
          {mode === "sign-in" ? (
            <form className="flex flex-col gap-4" onSubmit={submitSignIn}>
              <Input
                value={signInEmail}
                onChange={(event) => setSignInEmail(event.target.value)}
                placeholder={text.email}
                type="email"
                autoComplete="email"
              />
              <PasswordInput
                value={signInPassword}
                onChange={(event) => setSignInPassword(event.target.value)}
                placeholder={text.password}
                autoComplete="current-password"
                isRtl={isRtl}
                visible={showSignInPassword}
                onToggle={() => setShowSignInPassword((current) => !current)}
                showLabel={text.showPassword}
                hideLabel={text.hidePassword}
              />
              {notice ? <AuthNotice message={notice} /> : null}
              {error ? <AuthError message={error} /> : null}
              <Button className="w-full" type="submit" disabled={loading !== null}>
                <LogIn className="size-4" />
                {loading === "sign-in" ? text.signingIn : text.signIn}
              </Button>
              <button
                type="button"
                className="mx-auto inline-flex h-[46px] w-[179px] items-center justify-center rounded-full transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                onClick={signInWithGoogle}
                disabled={loading !== null}
                aria-label="Sign in with Google"
              >
                <Image
                  src="/google-login-light.svg"
                  alt="Sign in with Google"
                  width={179}
                  height={46}
                  className="block dark:hidden"
                  priority
                />
                <Image
                  src="/google-login-dark.svg"
                  alt="Sign in with Google"
                  width={179}
                  height={46}
                  className="hidden dark:block"
                  priority
                />
              </button>
              <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => flip("reset-password")}>
                <KeyRound className="size-4" />
                {text.forgotPassword}
              </Button>
              <div className="flex flex-col items-center gap-2 text-sm text-slate-500 dark:text-zinc-400">
                <span>{text.needAccount}</span>
                <Button type="button" variant="secondary" className="w-full" onClick={() => flip("sign-up")}>
                  <FlipIcon className="size-4" />
                  {text.createAccount}
                </Button>
              </div>
            </form>
          ) : null}

          {mode === "sign-up" ? (
            <form className="flex flex-col gap-4" onSubmit={submitSignUp}>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={text.name}
                autoComplete="name"
              />
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder={text.username}
                autoComplete="username"
              />
              <Input
                value={signUpEmail}
                onChange={(event) => setSignUpEmail(event.target.value)}
                placeholder={text.email}
                type="email"
                autoComplete="email"
              />
              <PasswordInput
                value={signUpPassword}
                onChange={(event) => setSignUpPassword(event.target.value)}
                placeholder={text.password}
                autoComplete="new-password"
                isRtl={isRtl}
                visible={showSignUpPassword}
                onToggle={() => setShowSignUpPassword((current) => !current)}
                showLabel={text.showPassword}
                hideLabel={text.hidePassword}
              />
              {error ? <AuthError message={error} /> : null}
              <Button className="w-full" type="submit" disabled={loading !== null}>
                <UserPlus className="size-4" />
                {loading === "sign-up" ? text.signingUp : text.signUp}
              </Button>
              <div className="flex flex-col items-center gap-2 text-sm text-slate-500 dark:text-zinc-400">
                <span>{text.haveAccount}</span>
                <Button type="button" variant="secondary" className="w-full" onClick={() => flip("sign-in")}>
                  <BackIcon className="size-4" />
                  {text.backToSignIn}
                </Button>
              </div>
            </form>
          ) : null}

          {mode === "reset-password" ? (
            resetStep === "request" ? (
              <form className="flex flex-col gap-4" onSubmit={submitResetRequest}>
                <Input
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  placeholder={text.email}
                  type="email"
                  autoComplete="email"
                />
                {notice ? <AuthNotice message={notice} /> : null}
                {error ? <AuthError message={error} /> : null}
                <Button className="w-full" type="submit" disabled={loading !== null}>
                  <Mail className="size-4" />
                  {loading === "reset-request" ? text.sendingResetLink : text.sendResetLink}
                </Button>
                <Button type="button" variant="secondary" className="w-full" onClick={() => flip("sign-in")}>
                  <BackIcon className="size-4" />
                  {text.backToSignIn}
                </Button>
              </form>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={submitResetConfirm}>
                <Input
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  placeholder={text.email}
                  type="email"
                  autoComplete="email"
                />
                <Input
                  value={resetToken}
                  onChange={(event) => setResetToken(event.target.value)}
                  placeholder={text.resetToken}
                  autoComplete="one-time-code"
                />
                <PasswordInput
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  placeholder={text.newPassword}
                  autoComplete="new-password"
                  isRtl={isRtl}
                  visible={showResetPassword}
                  onToggle={() => setShowResetPassword((current) => !current)}
                  showLabel={text.showPassword}
                  hideLabel={text.hidePassword}
                />
                {resetLink ? (
                  <a
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200"
                    href={resetLink}
                  >
                    {text.openResetLink}
                  </a>
                ) : null}
                {notice ? <AuthNotice message={notice} /> : null}
                {error ? <AuthError message={error} /> : null}
                <Button className="w-full" type="submit" disabled={loading !== null}>
                  <KeyRound className="size-4" />
                  {loading === "reset-confirm" ? text.resettingPassword : text.resetPassword}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setError("");
                    setNotice("");
                    setResetStep("request");
                  }}
                >
                  <BackIcon className="size-4" />
                  {text.backToResetRequest}
                </Button>
              </form>
            )
          ) : null}
        </Card>
      </div>
    </main>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  isRtl,
  visible,
  onToggle,
  showLabel,
  hideLabel,
}: {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  autoComplete: string;
  isRtl: boolean;
  visible: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
}) {
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        className={cn(isRtl ? "pl-11" : "pr-11")}
      />
      <button
        type="button"
        className={cn(
          "absolute top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
          isRtl ? "left-1" : "right-1",
        )}
        aria-label={visible ? hideLabel : showLabel}
        title={visible ? hideLabel : showLabel}
        onClick={onToggle}
      >
        <Icon className="size-4" />
      </button>
    </div>
  );
}

function AuthError({ message }: { message: string }) {
  return <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600">{message}</p>;
}

function AuthNotice({ message }: { message: string }) {
  return <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">{message}</p>;
}

async function safeReadJson(response: Response): Promise<AuthResponse | null> {
  try {
    return (await response.json()) as AuthResponse;
  } catch {
    return null;
  }
}
