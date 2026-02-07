import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api";

/**
 * DELETE /api/drafts/:id
 * Delete a specific draft
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { id } = await params;

    // Verify the draft belongs to the user
    const draft = await prisma.draft.findUnique({
      where: { id },
      select: { user_id: true },
    });

    if (!draft) {
      return NextResponse.json({ error: "Entwurf nicht gefunden" }, { status: 404 });
    }

    if (draft.user_id !== userId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
    }

    await prisma.draft.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json({ error: "Fehler beim Löschen des Entwurfs" }, { status: 500 });
  }
}
