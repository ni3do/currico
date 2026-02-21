import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateReviewSchema } from "@/lib/validations/review";
import {
  requireAuth,
  unauthorized,
  badRequest,
  notFound,
  forbidden,
  serverError,
  API_ERROR_CODES,
} from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { isValidId } from "@/lib/rateLimit";

// GET /api/reviews/[id] - Get a single review
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: reviewId } = await params;
    if (!isValidId(reviewId)) return badRequest("Invalid ID");

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            name: true,
            image: true,
          },
        },
        resource: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!review) {
      return notFound();
    }

    // Check if it's a verified purchase
    const hasPurchased = await prisma.transaction.findFirst({
      where: {
        buyer_id: review.user_id,
        resource_id: review.resource_id,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        createdAt: review.created_at.toISOString(),
        updatedAt: review.updated_at.toISOString(),
        isVerifiedPurchase: !!hasPurchased,
        user: {
          id: review.user.id,
          displayName: review.user.display_name || review.user.name || "Anonym",
          image: review.user.image,
        },
        resource: {
          id: review.resource.id,
          title: review.resource.title,
        },
      },
    });
  } catch (error) {
    captureError("Error fetching review:", error);
    return serverError();
  }
}

// PUT /api/reviews/[id] - Update own review
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const { id: reviewId } = await params;
    if (!isValidId(reviewId)) return badRequest("Invalid ID");

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return notFound();
    }

    if (review.user_id !== userId) {
      return forbidden("Own review only", API_ERROR_CODES.OWN_REVIEW_ONLY);
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body");
    }
    const validation = updateReviewSchema.safeParse(body);

    if (!validation.success) {
      return badRequest("Invalid input", {
        code: "INVALID_INPUT",
        details: validation.error.flatten(),
      });
    }

    const { rating, title, content } = validation.data;

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating !== undefined && { rating }),
        ...(title !== undefined && { title: title || null }),
        ...(content !== undefined && { content: content || null }),
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

    return NextResponse.json({
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        title: updatedReview.title,
        content: updatedReview.content,
        createdAt: updatedReview.created_at.toISOString(),
        updatedAt: updatedReview.updated_at.toISOString(),
        user: {
          id: updatedReview.user.id,
          displayName: updatedReview.user.display_name || updatedReview.user.name || "Anonym",
          image: updatedReview.user.image,
        },
      },
      message: "Review updated",
    });
  } catch (error) {
    captureError("Error updating review:", error);
    return serverError();
  }
}

// DELETE /api/reviews/[id] - Delete own review
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const { id: reviewId } = await params;
    if (!isValidId(reviewId)) return badRequest("Invalid ID");

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return notFound();
    }

    // Allow deletion by owner or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (review.user_id !== userId && user?.role !== "ADMIN") {
      return forbidden("Own review only", API_ERROR_CODES.OWN_REVIEW_ONLY);
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    captureError("Error deleting review:", error);
    return serverError();
  }
}
