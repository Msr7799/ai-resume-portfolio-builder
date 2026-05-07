import "server-only";

import { MongoClient, type Collection, type Db } from "mongodb";
import type { Portfolio, Resume } from "@/types";
import type { UserRole } from "@/types/auth";
import type { CloudinaryAsset } from "@/lib/server/cloudinary";

type MongoGlobal = typeof globalThis & {
  __airpbMongoClient?: Promise<MongoClient>;
};

export type UserDocument = {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  googleId?: string;
  passwordResetTokenHash?: string;
  passwordResetTokenExpiresAt?: Date;
  role: UserRole;
  avatarUrl?: string;
  avatarAsset?: CloudinaryAsset;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
};

export type ResumeDocument = {
  userId: string;
  title: string;
  resume: Resume;
  pdfAsset?: CloudinaryAsset;
  qrAsset?: CloudinaryAsset;
  createdAt: Date;
  updatedAt: Date;
};

export type PortfolioDocument = {
  userId: string;
  title: string;
  portfolio: Portfolio;
  createdAt: Date;
  updatedAt: Date;
};

function mongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }
  return uri;
}

export async function getMongoClient() {
  const globalForMongo = globalThis as MongoGlobal;
  if (!globalForMongo.__airpbMongoClient) {
    globalForMongo.__airpbMongoClient = new MongoClient(mongoUri()).connect();
  }
  return globalForMongo.__airpbMongoClient;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(process.env.MONGODB_DB || "ai_resume_portfolio_builder");
}

export async function usersCollection(): Promise<Collection<UserDocument>> {
  const db = await getDb();
  const collection = db.collection<UserDocument>("users");
  await collection.createIndex({ email: 1 }, { unique: true });
  await collection.createIndex({ username: 1 }, { unique: true, sparse: true });
  return collection;
}

export async function resumesCollection(): Promise<Collection<ResumeDocument>> {
  const db = await getDb();
  const collection = db.collection<ResumeDocument>("resumes");
  await collection.createIndex({ userId: 1, updatedAt: -1 });
  return collection;
}

export async function portfoliosCollection(): Promise<Collection<PortfolioDocument>> {
  const db = await getDb();
  const collection = db.collection<PortfolioDocument>("portfolios");
  await collection.createIndex({ userId: 1, updatedAt: -1 });
  return collection;
}
