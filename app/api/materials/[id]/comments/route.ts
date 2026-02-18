import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createCommentSchema } from "@/lib/validations/review";
import { checkRateLimit, isValidId, safeParseInt } from "@/lib/rateLimit";
import { notifyComment } from "@/lib/notifications";
import {
  requireAuth,
  unauthorized,
  badRequest,
  notFound,
  serverError,
  rateLimited,
} from "@/lib/api";

// GET /api/materials/[id]/comments - Get all comments for a material
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: materialId } = await params;

    // Validate material ID format
    if (!isValidId(materialId)) {
      return badRequest("Ungültige Material-ID");
    }

    const userId = await requireAuth();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, safeParseInt(searchParams.get("page"), 1));
    const limit = Math.min(50, Math.max(1, safeParseInt(searchParams.get("limit"), 20)));
    const skip = (page - 1) * limit;

    // Check if material exists
    const material = await prisma.resource.findUnique({
      where: { id: materialId },
      select: { id: true, seller_id: true },
    });

    if (!material) {
      return notFound("Material nicht gefunden");
    }

    // Get comments with user info, replies, and likes
    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: { resource_id: materialId },
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              name: true,
              image: true,
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
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { resource_id: materialId } }),
    ]);

    return NextResponse.json({
      comments: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at.toISOString(),
        updatedAt: comment.updated_at.toISOString(),
        user: {
          id: comment.user.id,
          displayName: comment.user.display_name || comment.user.name || "Anonym",
          image: comment.user.image,
          isSeller: comment.user.id === material.seller_id,
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
            isSeller: reply.user.id === material.seller_id,
          },
        })),
        replyCount: comment.replies.length,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return serverError("Interner Serverfehler");
  }
}

// POST /api/materials/[id]/comments - Create a new comment
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    // Rate limiting check
    const rateLimitResult = checkRateLimit(userId, "materials:comment");
    if (!rateLimitResult.success) {
      return rateLimited("Zu viele Anfragen. Bitte versuchen Sie es später erneut.");
    }

    const { id: materialId } = await params;

    // Validate material ID format
    if (!isValidId(materialId)) {
      return badRequest("Ungültige Material-ID");
    }

    // Check if material exists
    const material = await prisma.resource.findUnique({
      where: { id: materialId },
      select: { id: true, seller_id: true, title: true },
    });

    if (!material) {
      return notFound("Material nicht gefunden");
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createCommentSchema.safeParse(body);

    if (!validation.success) {
      return badRequest("Ungültige Eingabe", { details: validation.error.flatten() });
    }

    const { content } = validation.data;

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        user_id: userId,
        resource_id: materialId,
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

    // Notify the seller about the new comment (skip if commenter is the seller)
    if (userId !== material.seller_id) {
      const commenterName = comment.user.display_name || comment.user.name || "Jemand";
      notifyComment(material.seller_id, material.title, commenterName);
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
          isSeller: comment.user.id === material.seller_id,
        },
        likeCount: 0,
        isLiked: false,
        replies: [],
        replyCount: 0,
      },
      message: "Kommentar erfolgreich erstellt",
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return serverError("Interner Serverfehler");
  }
}
