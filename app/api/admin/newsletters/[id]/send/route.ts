import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, forbiddenResponse } from "@/lib/admin-auth";
import { badRequest, notFound, serverError, API_ERROR_CODES } from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { isValidId } from "@/lib/rateLimit";
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
      return forbiddenResponse();
    }

    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);

    const newsletter = await prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      return notFound("Newsletter not found");
    }

    if (newsletter.status !== "DRAFT") {
      return badRequest("Drafts only", undefined, API_ERROR_CODES.DRAFTS_ONLY);
    }

    // Set status to SENDING
    await prisma.newsletter.update({
      where: { id },
      data: { status: "SENDING" },
    });

    // Trigger sending in background (don't await)
    sendNewsletter(id).catch((err) => {
      captureError("Background newsletter send failed:", err);
    });

    return NextResponse.json({ success: true, message: "Newsletter is being sent" });
  } catch (error) {
    captureError("Error sending newsletter:", error);
    return serverError();
  }
}
