import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  signInWithGoogleCode,
} from "@/lib/server/google-oauth";

function redirectToSignIn(request: Request, reason: string) {
  const url = new URL("/auth/sign-in", request.url);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  if (error) return redirectToSignIn(request, "google");
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectToSignIn(request, "google-state");
  }

  try {
    await signInWithGoogleCode(request, code);
    const response = NextResponse.redirect(new URL("/dashboard/profile", request.url));
    response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
    return response;
  } catch (authError) {
    console.error("Google OAuth callback failed:", authError);
    const response = redirectToSignIn(request, "google");
    response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
    return response;
  }
}
