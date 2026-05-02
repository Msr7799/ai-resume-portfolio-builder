import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setSessionCookie, normalizeRole, toAuthUser } from "@/lib/server/auth";
import { apiError, isDuplicateKeyError } from "@/lib/server/http";
import { usersCollection } from "@/lib/server/mongodb";

type SignUpBody = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: string;
};

function usernameFromEmail(email: string) {
  return email.split("@")[0]?.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase() || "user";
}

export async function POST(request: Request) {
  const body = (await request.json()) as SignUpBody;
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const username = (body.username?.trim() || usernameFromEmail(email)).toLowerCase();
  const role = normalizeRole(body.role);

  if (name.length < 2) return apiError("Name must be at least 2 characters.");
  if (!email.includes("@")) return apiError("Use a valid email address.");
  if (password.length < 8) return apiError("Password must be at least 8 characters.");

  const users = await usersCollection();
  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const inserted = await users.insertOne({
      name,
      username,
      email,
      passwordHash,
      role,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    });
    const user = await users.findOne({ _id: inserted.insertedId });
    if (!user) return apiError("User could not be created.", 500);

    await setSessionCookie({ userId: String(user._id), email: user.email, role: user.role });
    return NextResponse.json({ user: toAuthUser(user) }, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return apiError("Email or username already exists.", 409);
    }
    return apiError("Sign up failed.", 500);
  }
}
