import "server-only";

import { randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/server/http";
import { setSessionCookie, toAuthUser } from "@/lib/server/auth";
import { usersCollection, type UserDocument } from "@/lib/server/mongodb";

export const GOOGLE_OAUTH_STATE_COOKIE = "airpb_google_oauth_state";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_STATE_MAX_AGE_SECONDS = 60 * 10;

type GoogleTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  id_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function googleClientId() {
  return process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "";
}

function googleClientSecret() {
  return process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
}

export function googleOAuthConfigured() {
  return Boolean(googleClientId() && googleClientSecret());
}

function appOrigin(request: Request) {
  if (process.env.NODE_ENV !== "production") {
    return new URL(request.url).origin;
  }

  return (
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    new URL(request.url).origin
  ).replace(/\/$/, "");
}

export function googleRedirectUri(request: Request) {
  return `${appOrigin(request)}/api/auth/callback/google`;
}

export function createGoogleOAuthState() {
  return randomBytes(24).toString("base64url");
}

export function createGoogleAuthRedirect(request: Request, state: string) {
  const clientId = googleClientId();
  if (!clientId || !googleClientSecret()) {
    return apiError("Google OAuth is not configured.", 503);
  }

  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", googleRedirectUri(request));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(url);
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: GOOGLE_STATE_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}

async function exchangeGoogleCode(request: Request, code: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: googleClientId(),
      client_secret: googleClientSecret(),
      code,
      grant_type: "authorization_code",
      redirect_uri: googleRedirectUri(request),
    }),
  });
  const data = (await response.json()) as GoogleTokenResponse;
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Google token exchange failed.");
  }
  return data.access_token;
}

async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await response.json()) as GoogleUserInfo;
  if (!response.ok || !data.sub || !data.email) {
    throw new Error("Google profile could not be loaded.");
  }
  if (data.email_verified === false) {
    throw new Error("Google email is not verified.");
  }
  return data;
}

function usernameBaseFromProfile(profile: GoogleUserInfo) {
  const source = profile.email?.split("@")[0] || profile.name || "google-user";
  return (
    source
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 24) || "google-user"
  );
}

async function uniqueGoogleUsername(base: string) {
  const users = await usersCollection();
  let candidate = base;
  for (let index = 0; index < 25; index += 1) {
    const exists = await users.findOne({ username: candidate });
    if (!exists) return candidate;
    candidate = `${base}-${randomBytes(2).toString("hex")}`;
  }
  return `google-${randomUUID().slice(0, 8)}`;
}

export async function signInWithGoogleCode(request: Request, code: string) {
  const accessToken = await exchangeGoogleCode(request, code);
  const profile = await getGoogleUserInfo(accessToken);
  const users = await usersCollection();
  const email = profile.email!.trim().toLowerCase();
  const now = new Date();

  const existing = await users.findOne({ email });
  if (existing) {
    await users.updateOne(
      { email },
      {
        $set: {
          googleId: profile.sub,
          name: existing.name || profile.name || email,
          avatarUrl: existing.avatarUrl || profile.picture,
          lastLoginAt: now,
          updatedAt: now,
        },
      },
    );
  } else {
    const username = await uniqueGoogleUsername(usernameBaseFromProfile(profile));
    const passwordHash = await bcrypt.hash(randomUUID(), 12);
    const user: UserDocument = {
      name: profile.name || email,
      username,
      email,
      passwordHash,
      googleId: profile.sub,
      role: "user",
      avatarUrl: profile.picture,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    await users.insertOne(user);
  }

  const user = await users.findOne({ email });
  if (!user) throw new Error("Google user session failed.");
  await setSessionCookie({ userId: String(user._id), email: user.email, role: user.role });
  return toAuthUser(user);
}
