import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/server/auth";
import { uploadResumePdf, uploadResumeQr } from "@/lib/server/cloudinary";
import { apiError } from "@/lib/server/http";
import { resumesCollection } from "@/lib/server/mongodb";
import { renderResumePdfBuffer } from "@/lib/server/resume-pdf";
import type { Resume } from "@/types";
import type { CloudinaryAsset } from "@/lib/server/cloudinary";

type SaveResumeBody = {
  title?: string;
  resume?: Resume;
};

function serializeResume(document: {
  _id?: ObjectId;
  userId: string;
  title: string;
  resume: Resume;
  pdfAsset?: CloudinaryAsset;
  qrAsset?: CloudinaryAsset;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: String(document._id),
    userId: document.userId,
    title: document.title,
    resume: document.resume,
    pdfAsset: document.pdfAsset,
    qrAsset: document.qrAsset,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export async function GET() {
  const user = await requireAuthUser();
  if (!user) return apiError("Unauthorized.", 401);

  const resumes = await resumesCollection();
  const documents = await resumes
    .find({ userId: user.id })
    .sort({ updatedAt: -1 })
    .limit(30)
    .toArray();

  return NextResponse.json({ resumes: documents.map(serializeResume) });
}

export async function POST(request: Request) {
  const user = await requireAuthUser();
  if (!user) return apiError("Unauthorized.", 401);

  const body = (await request.json()) as SaveResumeBody;
  if (!body.resume) return apiError("Resume payload is required.");

  const now = new Date();
  const resumes = await resumesCollection();
  const resumeId = new ObjectId();
  const { pdf, qrDataUrl } = await renderResumePdfBuffer(body.resume);
  const [pdfAsset, qrAsset] = await Promise.all([
    uploadResumePdf({ userId: user.id, resumeId: String(resumeId), pdf }),
    qrDataUrl
      ? uploadResumeQr({ userId: user.id, resumeId: String(resumeId), qrDataUrl })
      : Promise.resolve(undefined),
  ]);

  const inserted = await resumes.insertOne({
    _id: resumeId,
    userId: user.id,
    title: body.title?.trim() || body.resume.title || "Untitled resume",
    resume: body.resume,
    pdfAsset,
    qrAsset,
    createdAt: now,
    updatedAt: now,
  });

  const document = await resumes.findOne({ _id: inserted.insertedId });
  if (!document) return apiError("Resume could not be saved.", 500);
  return NextResponse.json({ resume: serializeResume(document) }, { status: 201 });
}
