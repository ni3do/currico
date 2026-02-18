import { z } from "zod";

// ============================================================
// REVIEW SCHEMAS
// ============================================================

// Create a new review
export const createReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Bewertung muss mindestens 1 Stern sein")
    .max(5, "Bewertung darf maximal 5 Sterne sein"),
  title: z.string().max(100, "Titel darf maximal 100 Zeichen haben").optional().nullable(),
  content: z.string().max(2000, "Bewertung darf maximal 2000 Zeichen haben").optional().nullable(),
});

// Update an existing review
export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Bewertung muss mindestens 1 Stern sein")
    .max(5, "Bewertung darf maximal 5 Sterne sein")
    .optional(),
  title: z.string().max(100, "Titel darf maximal 100 Zeichen haben").optional().nullable(),
  content: z.string().max(2000, "Bewertung darf maximal 2000 Zeichen haben").optional().nullable(),
});

// ============================================================
// COMMENT SCHEMAS
// ============================================================

// Create a new comment
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Kommentar darf nicht leer sein")
    .max(2000, "Kommentar darf maximal 2000 Zeichen haben"),
});

// Update an existing comment
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Kommentar darf nicht leer sein")
    .max(2000, "Kommentar darf maximal 2000 Zeichen haben"),
});

// ============================================================
// REPLY SCHEMAS
// ============================================================

// Create a reply to a comment
export const createReplySchema = z.object({
  content: z
    .string()
    .min(1, "Antwort darf nicht leer sein")
    .max(1000, "Antwort darf maximal 1000 Zeichen haben"),
});

// Update a reply
export const updateReplySchema = z.object({
  content: z
    .string()
    .min(1, "Antwort darf nicht leer sein")
    .max(1000, "Antwort darf maximal 1000 Zeichen haben"),
});

// ============================================================
// REVIEW REPLY SCHEMAS
// ============================================================

// Create a reply to a review
export const createReviewReplySchema = z.object({
  content: z
    .string()
    .min(1, "Antwort darf nicht leer sein")
    .max(1000, "Antwort darf maximal 1000 Zeichen haben"),
});

// Update a review reply
export const updateReviewReplySchema = z.object({
  content: z
    .string()
    .min(1, "Antwort darf nicht leer sein")
    .max(1000, "Antwort darf maximal 1000 Zeichen haben"),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateReview = z.infer<typeof createReviewSchema>;
export type UpdateReview = z.infer<typeof updateReviewSchema>;
export type CreateComment = z.infer<typeof createCommentSchema>;
export type UpdateComment = z.infer<typeof updateCommentSchema>;
export type CreateReply = z.infer<typeof createReplySchema>;
export type UpdateReply = z.infer<typeof updateReplySchema>;
export type CreateReviewReply = z.infer<typeof createReviewReplySchema>;
export type UpdateReviewReply = z.infer<typeof updateReviewReplySchema>;
