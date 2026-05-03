import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/server/http";
import { usersCollection } from "@/lib/server/mongodb";

type PasswordResetConfirmBody = {
  email?: string;
  token?: string;
  password?: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const body = (await request.json()) as PasswordResetConfirmBody;
  const email = body.email?.trim().toLowerCase() ?? "";
  const token = body.token?.trim() ?? "";
  const password = body.password ?? "";

  if (!email.includes("@")) return apiError("Use a valid email address.");
  if (token.length < 16) return apiError("Use a valid reset token.");
  if (password.length < 8) return apiError("Password must be at least 8 characters.");

  const users = await usersCollection();
  const user = await users.findOne({
    email,
    passwordResetTokenHash: hashToken(token),
    passwordResetTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) return apiError("Reset token is invalid or expired.", 400);

  const passwordHash = await bcrypt.hash(password, 12);
  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordHash,
        updatedAt: new Date(),
      },
      $unset: {
        passwordResetTokenHash: "",
        passwordResetTokenExpiresAt: "",
      },
    },
  );

  return NextResponse.json({ ok: true });
}
