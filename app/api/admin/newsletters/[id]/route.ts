import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";

/**
 * PATCH /api/admin/newsletters/[id]
 * Update a draft newsletter
 * Access: ADMIN only
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const { subject, content } = body;

    const newsletter = await prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      return NextResponse.json({ error: "Newsletter nicht gefunden" }, { status: 404 });
    }

    if (newsletter.status !== "DRAFT") {
      return NextResponse.json({ error: "Nur Entwürfe können bearbeitet werden" }, { status: 400 });
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
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
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
      return unauthorizedResponse();
    }

    const { id } = await params;

    const newsletter = await prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      return NextResponse.json({ error: "Newsletter nicht gefunden" }, { status: 404 });
    }

    if (newsletter.status !== "DRAFT") {
      return NextResponse.json({ error: "Nur Entwürfe können gelöscht werden" }, { status: 400 });
    }

    await prisma.newsletter.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting newsletter:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
