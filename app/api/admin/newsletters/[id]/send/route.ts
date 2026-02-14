import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import { sendNewsletter } from "@/lib/newsletter";

/**
 * POST /api/admin/newsletters/[id]/send
 * Trigger sending of a newsletter
 * Access: ADMIN only
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      return NextResponse.json({ error: "Nur Entwürfe können gesendet werden" }, { status: 400 });
    }

    // Set status to SENDING
    await prisma.newsletter.update({
      where: { id },
      data: { status: "SENDING" },
    });

    // Trigger sending in background (don't await)
    sendNewsletter(id).catch((err) => {
      console.error("Background newsletter send failed:", err);
    });

    return NextResponse.json({ success: true, message: "Newsletter wird gesendet" });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
