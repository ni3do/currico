import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createReplySchema } from "@/lib/validations/review";

// GET /api/comments/[id]/replies - Get all replies for a comment
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: commentId } = await params;

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
      return NextResponse.json({ error: "Kommentar nicht gefunden" }, { status: 404 });
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
    console.error("Error fetching replies:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

// POST /api/comments/[id]/replies - Create a new reply
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { id: commentId } = await params;

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
      return NextResponse.json({ error: "Kommentar nicht gefunden" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createReplySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Create reply
    const reply = await prisma.commentReply.create({
      data: {
        content,
        user_id: session.user.id,
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
    console.error("Error creating reply:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
