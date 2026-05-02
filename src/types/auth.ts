import type { Portfolio, Resume } from "@/types";
import type { CloudinaryAsset } from "@/lib/server/cloudinary";

export type UserRole = "user" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  avatarAsset?: CloudinaryAsset;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

export type StoredResume = {
  id: string;
  userId: string;
  title: string;
  resume: Resume;
  pdfAsset?: CloudinaryAsset;
  qrAsset?: CloudinaryAsset;
  createdAt: string;
  updatedAt: string;
};

export type StoredPortfolio = {
  id: string;
  userId: string;
  title: string;
  portfolio: Portfolio;
  createdAt: string;
  updatedAt: string;
};
