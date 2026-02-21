import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateReviewReplySchema } from "@/lib/validations/review";
import { requireAuth, unauthorized, badRequest, notFound, forbidden, serverError } from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { isValidId } from "@/lib/rateLimit";

// PUT /api/review-replies/[id] - Update own review reply
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const { id: replyId } = await params;
    if (!isValidId(replyId)) return badRequest("Invalid ID");

    // Check if reply exists and belongs to user
    const reply = await prisma.reviewReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      return notFound();
    }

    if (reply.user_id !== userId) {
      return forbidden("Own reply only");
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateReviewReplySchema.safeParse(body);

    if (!validation.success) {
      return badRequest("Invalid input", { details: validation.error.flatten() });
    }

    const { content } = validation.data;

    // Update reply
    const updatedReply = await prisma.reviewReply.update({
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
      message: "Reply updated successfully",
    });
  } catch (error) {
    captureError("Error updating review reply:", error);
    return serverError();
  }
}

// DELETE /api/review-replies/[id] - Delete review reply
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const { id: replyId } = await params;
    if (!isValidId(replyId)) return badRequest("Invalid ID");

    // Check if reply exists
    const reply = await prisma.reviewReply.findUnique({
      where: { id: replyId },
      include: {
        review: {
          select: {
            resource: {
              select: { seller_id: true },
            },
          },
        },
      },
    });

    if (!reply) {
      return notFound();
    }

    // Allow deletion by owner, resource seller, or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const canDelete =
      reply.user_id === userId ||
      reply.review.resource.seller_id === userId ||
      user?.role === "ADMIN";

    if (!canDelete) {
      return forbidden("Own reply only");
    }

    // Delete reply
    await prisma.reviewReply.delete({
      where: { id: replyId },
    });

    return NextResponse.json({ message: "Reply deleted successfully" });
  } catch (error) {
    captureError("Error deleting review reply:", error);
    return serverError();
  }
}
