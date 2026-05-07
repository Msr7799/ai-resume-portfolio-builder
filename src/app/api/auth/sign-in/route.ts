import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setSessionCookie, toAuthUser } from "@/lib/server/auth";
import { apiError } from "@/lib/server/http";
import { usersCollection } from "@/lib/server/mongodb";
import { authLimiter, getClientIp } from "@/lib/server/rate-limit";

type SignInBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!authLimiter.check(ip)) {
    return apiError("Too many login attempts. Please try again later.", 429);
  }

  try {
    const body = (await request.json()) as SignInBody;
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email.includes("@") || password.length < 8) {
      return apiError("Invalid email or password.", 401);
    }

    const users = await usersCollection();
    const user = await users.findOne({ email });
    if (!user) return apiError("Invalid email or password.", 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return apiError("Invalid email or password.", 401);

    const now = new Date();
    await users.updateOne({ _id: user._id }, { $set: { lastLoginAt: now, updatedAt: now } });
    const updated = await users.findOne({ _id: user._id });
    if (!updated) return apiError("User session failed.", 500);

    await setSessionCookie({ userId: String(updated._id), email: updated.email, role: updated.role });
    return NextResponse.json({ user: toAuthUser(updated) });
  } catch (error) {
    console.error("Sign in failed:", error);
    return apiError("Authentication service is unavailable.", 503);
  }
}
