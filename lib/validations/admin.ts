import { z } from "zod";

export const updateMessageStatusSchema = z.object({
  status: z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]),
  resolution: z.string().max(1000).optional(),
});

export const updateMaterialStatusSchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
  is_approved: z.boolean().optional(),
  is_public: z.boolean().optional(),
  rejection_reason: z.string().max(1000).optional(),
});

export const createNewsletterSchema = z.object({
  subject: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
});

export const updateNewsletterSchema = z.object({
  subject: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(50000).optional(),
});

export const updateAdminUserSchema = z.object({
  role: z.enum(["BUYER", "SELLER", "ADMIN"]).optional(),
  emailVerified: z.union([z.string().datetime(), z.null()]).optional(),
});
