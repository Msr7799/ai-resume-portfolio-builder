import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireAuthUser, toAuthUser } from "@/lib/server/auth";
import { uploadUserAvatar } from "@/lib/server/cloudinary";
import { apiError } from "@/lib/server/http";
import { usersCollection } from "@/lib/server/mongodb";
import { uploadLimiter, getClientIp } from "@/lib/server/rate-limit";

type UploadAvatarBody = {
  fileDataUrl?: string;
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

function validateAvatarDataUrl(dataUrl: string): string | null {
  if (!dataUrl.startsWith("data:image/")) {
    return "Image data URL is required.";
  }

  // Extract MIME type from data URL (data:image/png;base64,...)
  const mimeMatch = dataUrl.match(/^data:(image\/[a-z+]+);/i);
  if (!mimeMatch || !ALLOWED_IMAGE_TYPES.includes(mimeMatch[1].toLowerCase())) {
    return `Only PNG, JPEG, and WebP images are allowed. Received: ${mimeMatch?.[1] ?? "unknown"}.`;
  }

  // Estimate base64 payload size
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) {
    return "Invalid data URL format.";
  }
  const base64Part = dataUrl.substring(commaIndex + 1);
  const estimatedBytes = Math.ceil(base64Part.length * 0.75);
  if (estimatedBytes > MAX_AVATAR_BYTES) {
    const sizeMB = (estimatedBytes / (1024 * 1024)).toFixed(1);
    return `Image is too large (${sizeMB} MB). Maximum allowed is 2 MB.`;
  }

  return null; // valid
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!uploadLimiter.check(ip)) {
    return apiError("Too many upload requests. Please wait a moment.", 429);
  }

  const user = await requireAuthUser();
  if (!user) return apiError("Unauthorized.", 401);

  const body = (await request.json()) as UploadAvatarBody;
  if (!body.fileDataUrl) {
    return apiError("Image data URL is required.");
  }

  const validationError = validateAvatarDataUrl(body.fileDataUrl);
  if (validationError) {
    return apiError(validationError);
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
