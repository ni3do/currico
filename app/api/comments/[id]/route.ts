import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateCommentSchema } from "@/lib/validations/review";

// GET /api/comments/[id] - Get a single comment
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: commentId } = await params;
    const session = await auth();

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
      return NextResponse.json({ error: "Kommentar nicht gefunden" }, { status: 404 });
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
            isSeller: reply.user.id === comment.resource.seller_id,
          },
        })),
        replyCount: comment.replies.length,
      },
    });
  } catch (error) {
    console.error("Error fetching comment:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

// PUT /api/comments/[id] - Update own comment
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { id: commentId } = await params;

    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "Kommentar nicht gefunden" }, { status: 404 });
    }

    if (comment.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Sie können nur Ihre eigenen Kommentare bearbeiten" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const validation = updateCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: validation.error.flatten() },
        { status: 400 }
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
      message: "Kommentar erfolgreich aktualisiert",
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

// DELETE /api/comments/[id] - Delete own comment
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { id: commentId } = await params;

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
      return NextResponse.json({ error: "Kommentar nicht gefunden" }, { status: 404 });
    }

    // Allow deletion by owner, resource seller, or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const canDelete =
      comment.user_id === session.user.id ||
      comment.resource.seller_id === session.user.id ||
      user?.role === "ADMIN";

    if (!canDelete) {
      return NextResponse.json(
        { error: "Sie können nur Ihre eigenen Kommentare löschen" },
        { status: 403 }
      );
    }

    // Delete comment (cascades to replies and likes)
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Kommentar erfolgreich gelöscht" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
