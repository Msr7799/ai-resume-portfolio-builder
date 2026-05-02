import "server-only";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

export type CloudinaryAsset = {
  publicId: string;
  secureUrl: string;
  resourceType: "image" | "raw" | "video";
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
};

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function toAsset(response: UploadApiResponse, resourceType: CloudinaryAsset["resourceType"]) {
  return {
    publicId: response.public_id,
    secureUrl: response.secure_url,
    resourceType,
    format: response.format,
    bytes: response.bytes,
    width: response.width,
    height: response.height,
  } satisfies CloudinaryAsset;
}

export async function ensureCloudinaryFolder(folder: string) {
  configureCloudinary();
  try {
    await cloudinary.api.create_folder(folder);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.toLowerCase().includes("already exists")) {
      throw error;
    }
  }
}

export async function ensureUserCloudinaryTree(userId: string, resumeId?: string) {
  const base = `ai-resume-builder/users/${userId}`;
  const folders = [
    base,
    `${base}/profile`,
    `${base}/resumes`,
    `${base}/projects`,
  ];

  if (resumeId) {
    folders.push(
      `${base}/resumes/${resumeId}`,
      `${base}/resumes/${resumeId}/pdf`,
      `${base}/resumes/${resumeId}/preview`,
      `${base}/resumes/${resumeId}/assets`,
    );
  }

  await Promise.all(folders.map((folder) => ensureCloudinaryFolder(folder)));
}

export async function uploadUserAvatar(userId: string, fileDataUrl: string) {
  configureCloudinary();
  await ensureUserCloudinaryTree(userId);
  const response = await cloudinary.uploader.upload(fileDataUrl, {
    folder: `ai-resume-builder/users/${userId}/profile`,
    public_id: "avatar",
    overwrite: true,
    resource_type: "image",
    format: "webp",
    transformation: [
      { width: 512, height: 512, crop: "fill", gravity: "face" },
      { quality: "auto" },
    ],
  });
  return toAsset(response, "image");
}

export async function uploadResumePdf({
  userId,
  resumeId,
  pdf,
}: {
  userId: string;
  resumeId: string;
  pdf: Buffer;
}) {
  configureCloudinary();
  await ensureUserCloudinaryTree(userId, resumeId);

  const dataUri = `data:application/pdf;base64,${pdf.toString("base64")}`;
  const response = await cloudinary.uploader.upload(dataUri, {
    folder: `ai-resume-builder/users/${userId}/resumes/${resumeId}/pdf`,
    public_id: "resume",
    overwrite: true,
    resource_type: "raw",
    format: "pdf",
  });

  return toAsset(response, "raw");
}

export async function uploadResumeQr({
  userId,
  resumeId,
  qrDataUrl,
}: {
  userId: string;
  resumeId: string;
  qrDataUrl: string;
}) {
  configureCloudinary();
  await ensureUserCloudinaryTree(userId, resumeId);

  const response = await cloudinary.uploader.upload(qrDataUrl, {
    folder: `ai-resume-builder/users/${userId}/resumes/${resumeId}/assets`,
    public_id: "qr",
    overwrite: true,
    resource_type: "image",
    format: "png",
  });

  return toAsset(response, "image");
}
