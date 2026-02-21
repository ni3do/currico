import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createReviewReplySchema } from "@/lib/validations/review";
import { notifyReviewReply } from "@/lib/notifications";
import {
  requireAuth,
  unauthorized,
  badRequest,
  notFound,
  rateLimited,
  serverError,
} from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { checkRateLimit, isValidId } from "@/lib/rateLimit";

// GET /api/reviews/[id]/replies - Get all replies for a review
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: reviewId } = await params;
    if (!isValidId(reviewId)) return badRequest("Invalid ID");

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        resource: {
          select: { seller_id: true },
        },
      },
    });

    if (!review) {
      return notFound();
    }

    // Get replies with user info
    const replies = await prisma.reviewReply.findMany({
      where: { review_id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
    });

    return NextResponse.json({
      replies: replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.created_at.toISOString(),
        updatedAt: reply.updated_at.toISOString(),
        user: {
          id: reply.user.id,
          displayName: reply.user.display_name || reply.user.name || "Anonym",
          image: reply.user.image,
          isSeller: reply.user.id === review.resource.seller_id,
        },
      })),
    });
  } catch (error) {
    captureError("Error fetching review replies:", error);
    return serverError();
  }
}

// POST /api/reviews/[id]/replies - Create a new reply to a review
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    // Rate limit reply creation
    const rateLimit = checkRateLimit(userId, "resources:reply");
    if (!rateLimit.success) {
      return rateLimited();
    }

    const { id: reviewId } = await params;
    if (!isValidId(reviewId)) return badRequest("Invalid ID");

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        user_id: true,
        resource: {
          select: { seller_id: true, title: true },
        },
      },
    });

    if (!review) {
      return notFound();
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createReviewReplySchema.safeParse(body);

    if (!validation.success) {
      return badRequest("Invalid input", { details: validation.error.flatten() });
    }

    const { content } = validation.data;

    // Create reply
    const reply = await prisma.reviewReply.create({
      data: {
        content,
        user_id: userId,
        review_id: reviewId,
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Notify the review author about the reply (skip if replier is the review author)
    if (userId !== review.user_id) {
      const replierName = reply.user.display_name || reply.user.name || "Jemand";
      notifyReviewReply(review.user_id, review.resource.title, replierName);
    }

    return NextResponse.json({
      reply: {
        id: reply.id,
        content: reply.content,
        createdAt: reply.created_at.toISOString(),
        updatedAt: reply.updated_at.toISOString(),
        user: {
          id: reply.user.id,
          displayName: reply.user.display_name || reply.user.name || "Anonym",
          image: reply.user.image,
          isSeller: reply.user.id === review.resource.seller_id,
        },
      },
      message: "Antwort erfolgreich erstellt",
    });
  } catch (error) {
    captureError("Error creating review reply:", error);
    return serverError();
  }
}
