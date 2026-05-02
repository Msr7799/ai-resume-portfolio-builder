import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/server/auth";
import { apiError } from "@/lib/server/http";
import { portfoliosCollection } from "@/lib/server/mongodb";
import type { Portfolio } from "@/types";

type SavePortfolioBody = {
  title?: string;
  portfolio?: Portfolio;
};

function serializePortfolio(document: {
  _id?: ObjectId;
  userId: string;
  title: string;
  portfolio: Portfolio;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: String(document._id),
    userId: document.userId,
    title: document.title,
    portfolio: document.portfolio,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export async function GET() {
  const user = await requireAuthUser();
  if (!user) return apiError("Unauthorized.", 401);

  const portfolios = await portfoliosCollection();
  const documents = await portfolios
    .find({ userId: user.id })
    .sort({ updatedAt: -1 })
    .limit(30)
    .toArray();

  return NextResponse.json({ portfolios: documents.map(serializePortfolio) });
}

export async function POST(request: Request) {
  const user = await requireAuthUser();
  if (!user) return apiError("Unauthorized.", 401);

  const body = (await request.json()) as SavePortfolioBody;
  if (!body.portfolio) return apiError("Portfolio payload is required.");

  const now = new Date();
  const portfolios = await portfoliosCollection();
  const inserted = await portfolios.insertOne({
    userId: user.id,
    title: body.title?.trim() || body.portfolio.headline || "Untitled portfolio",
    portfolio: body.portfolio,
    createdAt: now,
    updatedAt: now,
  });

  const document = await portfolios.findOne({ _id: inserted.insertedId });
  if (!document) return apiError("Portfolio could not be saved.", 500);
  return NextResponse.json({ portfolio: serializePortfolio(document) }, { status: 201 });
}
