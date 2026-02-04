import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateReplySchema } from "@/lib/validations/review";

// GET /api/replies/[id] - Get a single reply
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: replyId } = await params;

    const reply = await prisma.commentReply.findUnique({
      where: { id: replyId },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            name: true,
            image: true,
          },
        },
        comment: {
          select: {
            id: true,
            resource: {
              select: {
                id: true,
                title: true,
                seller_id: true,
              },
            },
          },
        },
      },
    });

    if (!reply) {
      return NextResponse.json({ error: "Antwort nicht gefunden" }, { status: 404 });
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
          isSeller: reply.user.id === reply.comment.resource.seller_id,
        },
        comment: {
          id: reply.comment.id,
        },
        resource: {
          id: reply.comment.resource.id,
          title: reply.comment.resource.title,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching reply:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

// PUT /api/replies/[id] - Update own reply
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { id: replyId } = await params;

    // Check if reply exists and belongs to user
    const reply = await prisma.commentReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      return NextResponse.json({ error: "Antwort nicht gefunden" }, { status: 404 });
    }

    if (reply.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Sie können nur Ihre eigenen Antworten bearbeiten" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateReplySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Update reply
    const updatedReply = await prisma.commentReply.update({
      where: { id: replyId },
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
      reply: {
        id: updatedReply.id,
        content: updatedReply.content,
        createdAt: updatedReply.created_at.toISOString(),
        updatedAt: updatedReply.updated_at.toISOString(),
        user: {
          id: updatedReply.user.id,
          displayName: updatedReply.user.display_name || updatedReply.user.name || "Anonym",
          image: updatedReply.user.image,
        },
      },
      message: "Antwort erfolgreich aktualisiert",
    });
  } catch (error) {
    console.error("Error updating reply:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

// DELETE /api/replies/[id] - Delete own reply
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { id: replyId } = await params;

    // Check if reply exists and belongs to user
    const reply = await prisma.commentReply.findUnique({
      where: { id: replyId },
      include: {
        comment: {
          select: {
            resource: {
              select: { seller_id: true },
            },
          },
        },
      },
    });

    if (!reply) {
      return NextResponse.json({ error: "Antwort nicht gefunden" }, { status: 404 });
    }

    // Allow deletion by owner, resource seller, or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const canDelete =
      reply.user_id === session.user.id ||
      reply.comment.resource.seller_id === session.user.id ||
      user?.role === "ADMIN";

    if (!canDelete) {
      return NextResponse.json(
        { error: "Sie können nur Ihre eigenen Antworten löschen" },
        { status: 403 }
      );
    }

    // Delete reply
    await prisma.commentReply.delete({
      where: { id: replyId },
    });

    return NextResponse.json({ message: "Antwort erfolgreich gelöscht" });
  } catch (error) {
    console.error("Error deleting reply:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
