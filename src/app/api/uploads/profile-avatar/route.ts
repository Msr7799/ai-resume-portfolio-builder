import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireAuthUser, toAuthUser } from "@/lib/server/auth";
import { uploadUserAvatar } from "@/lib/server/cloudinary";
import { apiError } from "@/lib/server/http";
import { usersCollection } from "@/lib/server/mongodb";

type UploadAvatarBody = {
  fileDataUrl?: string;
};

export async function POST(request: Request) {
  const user = await requireAuthUser();
  if (!user) return apiError("Unauthorized.", 401);

  const body = (await request.json()) as UploadAvatarBody;
  if (!body.fileDataUrl?.startsWith("data:image/")) {
    return apiError("Image data URL is required.");
  }

  const asset = await uploadUserAvatar(user.id, body.fileDataUrl);
  const users = await usersCollection();
  await users.updateOne(
    { _id: new ObjectId(user.id) },
    {
      $set: {
        avatarUrl: asset.secureUrl,
        avatarAsset: asset,
        updatedAt: new Date(),
      },
    },
  );

  const updated = await users.findOne({ _id: new ObjectId(user.id) });
  if (!updated) return apiError("User not found.", 404);

  return NextResponse.json({ user: toAuthUser(updated), asset });
}
