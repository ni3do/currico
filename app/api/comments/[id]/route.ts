import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateCommentSchema } from "@/lib/validations/review";
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

// GET /api/comments/[id] - Get a single comment
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: commentId } = await params;
    if (!isValidId(commentId))
      return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);
    const userId = await requireAuth();

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
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
            seller_id: true,
          },
        },
        replies: {
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
        },
        likes: {
          select: { user_id: true },
        },
      },
    });

    if (!comment) {
      return notFound();
    }

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at.toISOString(),
        updatedAt: comment.updated_at.toISOString(),
        user: {
          id: comment.user.id,
          displayName: comment.user.display_name || comment.user.name || "Anonym",
          image: comment.user.image,
          isSeller: comment.user.id === comment.resource.seller_id,
        },
        resource: {
          id: comment.resource.id,
          title: comment.resource.title,
        },
        likeCount: comment.likes.length,
        isLiked: userId ? comment.likes.some((like) => like.user_id === userId) : false,
        replies: comment.replies.map((reply) => ({
          id: reply.id,
          content: reply.content,
          createdAt: reply.created_at.toISOString(),
          updatedAt: reply.updated_at.toISOString(),
          user: {
            id: reply.user.id,
            displayName: reply.user.display_name || reply.user.name || "Anonym",
            image: reply.user.image,
            isSeller: reply.user.id === comment.resource.seller_id,
          },
        })),
        replyCount: comment.replies.length,
      },
    });
  } catch (error) {
    captureError("Error fetching comment:", error);
    return serverError();
  }
}

// PUT /api/comments/[id] - Update own comment
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const { id: commentId } = await params;
    if (!isValidId(commentId))
      return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);

    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return notFound();
    }

    if (comment.user_id !== userId) {
      return forbidden("Own comment only", API_ERROR_CODES.OWN_COMMENT_ONLY);
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body", undefined, API_ERROR_CODES.INVALID_JSON_BODY);
    }
    const validation = updateCommentSchema.safeParse(body);

    if (!validation.success) {
      return badRequest(
        "Invalid input",
        { details: validation.error.flatten() },
        API_ERROR_CODES.INVALID_INPUT
      );
    }

    const { content } = validation.data;

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
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
      comment: {
        id: updatedComment.id,
        content: updatedComment.content,
        createdAt: updatedComment.created_at.toISOString(),
        updatedAt: updatedComment.updated_at.toISOString(),
        user: {
          id: updatedComment.user.id,
          displayName: updatedComment.user.display_name || updatedComment.user.name || "Anonym",
          image: updatedComment.user.image,
        },
      },
      message: "Comment updated successfully",
    });
  } catch (error) {
    captureError("Error updating comment:", error);
    return serverError();
  }
}

// DELETE /api/comments/[id] - Delete own comment
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const { id: commentId } = await params;
    if (!isValidId(commentId))
      return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);

    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        resource: {
          select: { seller_id: true },
        },
      },
    });

    if (!comment) {
      return notFound();
    }

    // Allow deletion by owner, resource seller, or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const canDelete =
      comment.user_id === userId || comment.resource.seller_id === userId || user?.role === "ADMIN";

    if (!canDelete) {
      return forbidden("Own comment only", API_ERROR_CODES.OWN_COMMENT_ONLY);
    }

    // Delete comment (cascades to replies and likes)
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    captureError("Error deleting comment:", error);
    return serverError();
  }
}
