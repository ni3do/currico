import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCommentSchema } from "@/lib/validations/review";
import { checkRateLimit, rateLimitHeaders, isValidId, safeParseInt } from "@/lib/rateLimit";

// GET /api/resources/[id]/comments - Get all comments for a resource
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: resourceId } = await params;

    // Validate resource ID format
    if (!isValidId(resourceId)) {
      return NextResponse.json({ error: "Ungültige Ressourcen-ID" }, { status: 400 });
    }

    const session = await auth();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, safeParseInt(searchParams.get("page"), 1));
    const limit = Math.min(50, Math.max(1, safeParseInt(searchParams.get("limit"), 20)));
    const skip = (page - 1) * limit;

    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true, seller_id: true },
    });

    if (!resource) {
      return NextResponse.json({ error: "Ressource nicht gefunden" }, { status: 404 });
    }

    // Get comments with user info, replies, and likes
    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: { resource_id: resourceId },
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
      prisma.comment.count({ where: { resource_id: resourceId } }),
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
          isSeller: comment.user.id === resource.seller_id,
        },
        likeCount: comment.likes.length,
        isLiked: session?.user?.id
          ? comment.likes.some((like) => like.user_id === session.user.id)
          : false,
        replies: comment.replies.map((reply) => ({
          id: reply.id,
          content: reply.content,
          createdAt: reply.created_at.toISOString(),
          updatedAt: reply.updated_at.toISOString(),
          user: {
            id: reply.user.id,
            displayName: reply.user.display_name || reply.user.name || "Anonym",
            image: reply.user.image,
            isSeller: reply.user.id === resource.seller_id,
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
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

// POST /api/resources/[id]/comments - Create a new comment
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    // Rate limiting check
    const rateLimitResult = checkRateLimit(session.user.id, "resources:comment");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    const { id: resourceId } = await params;

    // Validate resource ID format
    if (!isValidId(resourceId)) {
      return NextResponse.json({ error: "Ungültige Ressourcen-ID" }, { status: 400 });
    }

    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true, seller_id: true },
    });

    if (!resource) {
      return NextResponse.json({ error: "Ressource nicht gefunden" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        user_id: session.user.id,
        resource_id: resourceId,
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
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at.toISOString(),
        updatedAt: comment.updated_at.toISOString(),
        user: {
          id: comment.user.id,
          displayName: comment.user.display_name || comment.user.name || "Anonym",
          image: comment.user.image,
          isSeller: comment.user.id === resource.seller_id,
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
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
