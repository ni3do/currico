import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateReplySchema } from "@/lib/validations/review";
import { requireAuth, unauthorized, badRequest, notFound, forbidden, serverError } from "@/lib/api";
import { isValidId } from "@/lib/rateLimit";

// GET /api/replies/[id] - Get a single reply
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: replyId } = await params;
    if (!isValidId(replyId)) return badRequest("Invalid ID");

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
      return notFound("Antwort nicht gefunden");
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
    return serverError("Interner Serverfehler");
  }
}

// PUT /api/replies/[id] - Update own reply
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const { id: replyId } = await params;
    if (!isValidId(replyId)) return badRequest("Invalid ID");

    // Check if reply exists and belongs to user
    const reply = await prisma.commentReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      return notFound("Antwort nicht gefunden");
    }

    if (reply.user_id !== userId) {
      return forbidden("Sie können nur Ihre eigenen Antworten bearbeiten");
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateReplySchema.safeParse(body);

    if (!validation.success) {
      return badRequest("Ungültige Eingabe", { details: validation.error.flatten() });
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
    return serverError("Interner Serverfehler");
  }
}

// DELETE /api/replies/[id] - Delete own reply
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const { id: replyId } = await params;
    if (!isValidId(replyId)) return badRequest("Invalid ID");

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
      return notFound("Antwort nicht gefunden");
    }

    // Allow deletion by owner, resource seller, or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const canDelete =
      reply.user_id === userId ||
      reply.comment.resource.seller_id === userId ||
      user?.role === "ADMIN";

    if (!canDelete) {
      return forbidden("Sie können nur Ihre eigenen Antworten löschen");
    }

    // Delete reply
    await prisma.commentReply.delete({
      where: { id: replyId },
    });

    return NextResponse.json({ message: "Antwort erfolgreich gelöscht" });
  } catch (error) {
    console.error("Error deleting reply:", error);
    return serverError("Interner Serverfehler");
  }
}
