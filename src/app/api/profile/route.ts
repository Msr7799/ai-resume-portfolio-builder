import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  requireAuthUser,
  toAuthUser,
} from "@/lib/server/auth";
import { apiError, isDuplicateKeyError } from "@/lib/server/http";
import {
  portfoliosCollection,
  resumesCollection,
  usersCollection,
} from "@/lib/server/mongodb";

type ProfileBody = {
  name?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
};

export async function GET() {
  const user = await requireAuthUser();
  if (!user) return apiError("Unauthorized.", 401);
  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  const user = await requireAuthUser();
  if (!user) return apiError("Unauthorized.", 401);

  const body = (await request.json()) as ProfileBody;
  const name = body.name?.trim() ?? user.name;
  const username = body.username?.trim().toLowerCase() ?? user.username;
  const email = body.email?.trim().toLowerCase() ?? user.email;
  const avatarUrl = body.avatarUrl?.trim() || undefined;

  if (name.length < 2) return apiError("Name must be at least 2 characters.");
  if (!email.includes("@")) return apiError("Use a valid email address.");
  if (username.length < 2) return apiError("Username must be at least 2 characters.");
  if (!/^[a-z0-9_-]+$/.test(username)) {
    return apiError("Username can only contain letters, numbers, underscores, and dashes.");
  }

  const users = await usersCollection();
  const userId = new ObjectId(user.id);
  const existing = await users.findOne(
    {
      _id: { $ne: userId },
      $or: [{ email }, { username }],
    },
    { projection: { email: 1, username: 1 } },
  );
  if (existing?.email === email) return apiError("Email already exists.", 409);
  if (existing?.username === username) return apiError("Username already exists.", 409);

  try {
    await users.updateOne(
      { _id: userId },
      {
        $set: {
          name,
          username,
          email,
          avatarUrl,
          updatedAt: new Date(),
        },
      },
    );
    const updated = await users.findOne({ _id: userId });
    if (!updated) return apiError("User not found.", 404);
    return NextResponse.json({ user: toAuthUser(updated) });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return apiError("Email or username already exists.", 409);
    }
    return apiError("Profile update failed.", 500);
  }
}

export async function DELETE() {
  const user = await requireAuthUser();
  if (!user) return apiError("Unauthorized.", 401);

  const [users, resumes, portfolios] = await Promise.all([
    usersCollection(),
    resumesCollection(),
    portfoliosCollection(),
  ]);

  await Promise.all([
    resumes.deleteMany({ userId: user.id }),
    portfolios.deleteMany({ userId: user.id }),
    users.deleteOne({ _id: new ObjectId(user.id) }),
  ]);
  await clearSessionCookie();

  return NextResponse.json({ ok: true });
}
