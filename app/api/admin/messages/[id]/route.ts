import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import { badRequest, serverError } from "@/lib/api";
import { isValidId } from "@/lib/rateLimit";
import { updateMessageStatusSchema } from "@/lib/validations/admin";

/**
 * PATCH /api/admin/messages/[id]
 * Update message status
 * Access: ADMIN only
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID");

    const body = await request.json();
    const parsed = updateMessageStatusSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid status");
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: parsed.data.status,
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error updating message:", error);
    return serverError();
  }
}

/**
 * DELETE /api/admin/messages/[id]
 * Delete a message
 * Access: ADMIN only
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID");

    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return serverError();
  }
}
