import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, forbiddenResponse } from "@/lib/admin-auth";
import { badRequest, notFound, serverError } from "@/lib/api";
import { isValidId } from "@/lib/rateLimit";
import { updateNewsletterSchema } from "@/lib/validations/admin";

/**
 * PATCH /api/admin/newsletters/[id]
 * Update a draft newsletter
 * Access: ADMIN only
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse();
    }

    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID");
    const body = await request.json();
    const parsed = updateNewsletterSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid input", { details: parsed.error.flatten().fieldErrors });
    }
    const { subject, content } = parsed.data;

    const newsletter = await prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      return notFound("Newsletter not found");
    }

    if (newsletter.status !== "DRAFT") {
      return badRequest("Only drafts can be edited");
    }

    const updated = await prisma.newsletter.update({
      where: { id },
      data: {
        ...(subject !== undefined && { subject }),
        ...(content !== undefined && { content }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating newsletter:", error);
    return serverError();
  }
}

/**
 * DELETE /api/admin/newsletters/[id]
 * Delete a draft newsletter
 * Access: ADMIN only
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse();
    }

    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID");

    const newsletter = await prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      return notFound("Newsletter not found");
    }

    if (newsletter.status !== "DRAFT") {
      return badRequest("Only drafts can be deleted");
    }

    await prisma.newsletter.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting newsletter:", error);
    return serverError();
  }
}
