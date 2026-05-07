import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { usersCollection, type UserDocument } from "@/lib/server/mongodb";
import type { AuthUser, UserRole } from "@/types/auth";

const SESSION_COOKIE = "airpb_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

type SessionPayload = {
  userId: string;
  email: string;
  role: UserRole;
  exp: number;
};

function authSecret() {
  const secret = process.env.AUTH_SECRET || process.env.LLM_API_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET environment variable is required in production. " +
        "Set a strong random value (e.g. `openssl rand -base64 32`)."
      );
    }
    return "dev-only-change-this-secret";
  }
  return secret;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const withExpiry: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const body = base64UrlEncode(JSON.stringify(withExpiry));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as SessionPayload;
    if (!payload.userId || !payload.email || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: Omit<SessionPayload, "exp">) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}

export function toAuthUser(user: UserDocument & { _id?: ObjectId }): AuthUser {
  return {
    id: String(user._id),
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    avatarAsset: user.avatarAsset,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString(),
  };
}

export async function requireAuthUser() {
  const session = await getSession();
  if (!session) return null;

  const users = await usersCollection();
  const user = await users.findOne({ _id: new ObjectId(session.userId) });
  return user ? toAuthUser(user) : null;
}

export function normalizeRole(role: unknown): UserRole {
  return role === "admin" ? "admin" : "user";
}
