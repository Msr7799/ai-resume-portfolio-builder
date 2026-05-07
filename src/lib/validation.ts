import { z } from "zod";

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  email: z.string().email("Use a valid email address"),
  phone: z.string().min(5, "Phone is required"),
  location: z.string().min(2, "Location is required"),
  website: z.string().url("Use a valid URL").or(z.literal("")),
  github: z.string().url("Use a valid URL").or(z.literal("")),
  linkedin: z.string().url("Use a valid URL").or(z.literal("")),
  summary: z.string().min(20, "Summary should be at least 20 characters"),
});

export const authSchema = z.object({
  email: z.string().email("Use a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
