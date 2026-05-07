import { AuthCard } from "@/components/auth/auth-card";

type SignInPageProps = {
  searchParams?: Promise<{
    email?: string;
    error?: string;
    resetToken?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const resetToken = params?.resetToken ?? "";

  return (
    <AuthCard
      initialMode={resetToken ? "reset-password" : "sign-in"}
      initialResetEmail={params?.email ?? ""}
      initialResetToken={resetToken}
      initialError={params?.error ?? ""}
    />
  );
}
