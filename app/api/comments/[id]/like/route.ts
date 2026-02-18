import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAuth,
  unauthorized,
  badRequest,
  notFound,
  rateLimited,
  serverError,
} from "@/lib/api";
import { checkRateLimit, isValidId } from "@/lib/rateLimit";

// POST /api/comments/[id]/like - Toggle like on a comment
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    // Rate limit like toggling
    const rateLimit = checkRateLimit(userId, "resources:like");
    if (!rateLimit.success) {
      return rateLimited();
    }

    const { id: commentId } = await params;
    if (!isValidId(commentId)) return badRequest("Invalid ID");

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });

    if (!comment) {
      return notFound("Kommentar nicht gefunden");
    }

    // Check if user already liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        user_id_comment_id: {
          user_id: userId,
          comment_id: commentId,
        },
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });

      const likeCount = await prisma.commentLike.count({
        where: { comment_id: commentId },
      });

      return NextResponse.json({
        liked: false,
        likeCount,
        message: "Like entfernt",
      });
    } else {
      // Like - add new like
      await prisma.commentLike.create({
        data: {
          user_id: userId,
          comment_id: commentId,
        },
      });

      const likeCount = await prisma.commentLike.count({
        where: { comment_id: commentId },
      });

      return NextResponse.json({
        liked: true,
        likeCount,
        message: "Kommentar gefällt Ihnen",
      });
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return serverError();
  }
}

// GET /api/comments/[id]/like - Get like status for a comment
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    const { id: commentId } = await params;
    if (!isValidId(commentId)) return badRequest("Invalid ID");

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });

    if (!comment) {
      return notFound("Kommentar nicht gefunden");
    }

    // Get like count
    const likeCount = await prisma.commentLike.count({
      where: { comment_id: commentId },
    });

    // Check if current user has liked
    let liked = false;
    if (userId) {
      const existingLike = await prisma.commentLike.findUnique({
        where: {
          user_id_comment_id: {
            user_id: userId,
            comment_id: commentId,
          },
        },
      });
      liked = !!existingLike;
    }

    return NextResponse.json({ liked, likeCount });
  } catch (error) {
    console.error("Error getting comment like status:", error);
    return serverError();
  }
}
