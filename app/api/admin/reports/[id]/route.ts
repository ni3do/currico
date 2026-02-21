import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, forbiddenResponse } from "@/lib/admin-auth";
import { badRequest, serverError } from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { isValidId } from "@/lib/rateLimit";
import { updateReportStatusSchema } from "@/lib/validations/admin";

/**
 * PATCH /api/admin/reports/[id]
 * Update report status (resolve, dismiss, etc.)
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
    const parsed = updateReportStatusSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid input");
    }

    const { status, resolution } = parsed.data;

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status,
        ...(resolution && { resolution }),
        // Mark as handled if resolving or dismissing
        ...((status === "RESOLVED" || status === "DISMISSED") && {
          handled_by: { connect: { id: admin.id } },
          handled_at: new Date(),
        }),
      },
      include: {
        reporter: {
          select: { id: true, display_name: true, email: true },
        },
        reported_user: {
          select: { id: true, display_name: true, email: true },
        },
        resource: {
          select: { id: true, title: true },
        },
        handled_by: {
          select: { id: true, display_name: true },
        },
      },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    captureError("Error updating report:", error);
    return serverError();
  }
}
