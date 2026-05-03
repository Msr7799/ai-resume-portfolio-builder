import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setSessionCookie, toAuthUser } from "@/lib/server/auth";
import { apiError, isDuplicateKeyError } from "@/lib/server/http";
import { usersCollection } from "@/lib/server/mongodb";

type SignUpBody = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignUpBody;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const username = body.username?.trim().toLowerCase() ?? "";

    if (name.length < 2) return apiError("Name must be at least 2 characters.");
    if (!email.includes("@")) return apiError("Use a valid email address.");
    if (password.length < 8) return apiError("Password must be at least 8 characters.");
    if (username.length < 2) return apiError("Username must be at least 2 characters.");
    if (!/^[a-z0-9_-]+$/.test(username)) {
      return apiError("Username can only contain letters, numbers, underscores, and dashes.");
    }

    const users = await usersCollection();
    const existing = await users.findOne({ $or: [{ email }, { username }] }, { projection: { email: 1, username: 1 } });
    if (existing?.email === email) return apiError("Email already exists.", 409);
    if (existing?.username === username) return apiError("Username already exists.", 409);

    const now = new Date();
    const passwordHash = await bcrypt.hash(password, 12);

    const inserted = await users.insertOne({
      name,
      username,
      email,
      passwordHash,
      role: "user",
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
    console.error("Sign up failed:", error);
    return apiError("Authentication service is unavailable.", 503);
  }
}
