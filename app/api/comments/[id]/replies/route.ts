import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createReplySchema } from "@/lib/validations/review";
import { notifyCommentReply } from "@/lib/notifications";
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

// GET /api/comments/[id]/replies - Get all replies for a comment
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: commentId } = await params;
    if (!isValidId(commentId)) return badRequest("Invalid ID");

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        resource: {
          select: { seller_id: true },
        },
      },
    });

    if (!comment) {
      return notFound();
    }

    // Get replies with user info
    const replies = await prisma.commentReply.findMany({
      where: { comment_id: commentId },
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
          isSeller: reply.user.id === comment.resource.seller_id,
        },
      })),
    });
  } catch (error) {
    captureError("Error fetching replies:", error);
    return serverError();
  }
}

// POST /api/comments/[id]/replies - Create a new reply
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    // Rate limit reply creation
    const rateLimit = checkRateLimit(userId, "resources:reply");
    if (!rateLimit.success) {
      return rateLimited();
    }

    const { id: commentId } = await params;
    if (!isValidId(commentId)) return badRequest("Invalid ID");

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        user_id: true,
        resource: {
          select: { seller_id: true, title: true },
        },
      },
    });

    if (!comment) {
      return notFound();
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createReplySchema.safeParse(body);

    if (!validation.success) {
      return badRequest("Invalid input", { details: validation.error.flatten() });
    }

    const { content } = validation.data;

    // Create reply
    const reply = await prisma.commentReply.create({
      data: {
        content,
        user_id: userId,
        comment_id: commentId,
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

    // Notify the comment author about the reply (skip if replier is the comment author)
    if (userId !== comment.user_id) {
      const replierName = reply.user.display_name || reply.user.name || "Jemand";
      notifyCommentReply(comment.user_id, comment.resource.title, replierName);
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
          isSeller: reply.user.id === comment.resource.seller_id,
        },
      },
      message: "Antwort erfolgreich erstellt",
    });
  } catch (error) {
    captureError("Error creating reply:", error);
    return serverError();
  }
}
