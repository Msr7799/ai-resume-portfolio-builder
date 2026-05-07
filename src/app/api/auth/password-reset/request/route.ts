import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/server/http";
import { usersCollection } from "@/lib/server/mongodb";
import { authLimiter, getClientIp } from "@/lib/server/rate-limit";

type PasswordResetRequestBody = {
  email?: string;
};

const RESET_TOKEN_TTL_MS = 1000 * 60 * 15;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!authLimiter.check(ip)) {
    return apiError("Too many requests. Please try again later.", 429);
  }

  const body = (await request.json()) as PasswordResetRequestBody;
  const email = body.email?.trim().toLowerCase() ?? "";

  if (!email.includes("@")) return apiError("Use a valid email address.");

  const users = await usersCollection();
  const user = await users.findOne({ email });

  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordResetTokenHash: hashToken(token),
        passwordResetTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      },
    },
  );

  const resetUrl = `/auth/sign-in?resetToken=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  // TODO: In production, send resetUrl via email (e.g. Resend, SendGrid, SES).
  // For now, return token in dev only so the frontend can navigate directly.
  if (process.env.NODE_ENV === "production") {
    // In production, never leak the token in the response.
    // The user must check their email.
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, resetToken: token, resetUrl, expiresAt: expiresAt.toISOString() });
}
