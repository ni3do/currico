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
