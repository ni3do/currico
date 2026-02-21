import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin, forbiddenResponse } from "@/lib/admin-auth";
import { badRequest, serverError } from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { isValidId } from "@/lib/rateLimit";
import { notifyMaterialApproved, notifyMaterialRejected } from "@/lib/notifications";
import { updateMaterialStatusSchema } from "@/lib/validations/admin";

const materialSelect = Prisma.validator<Prisma.ResourceSelect>()({
  id: true,
  title: true,
  description: true,
  price: true,
  subjects: true,
  cycles: true,
  is_published: true,
  is_approved: true,
  status: true,
  is_public: true,
  file_url: true,
  preview_url: true,
  created_at: true,
  updated_at: true,
  seller: {
    select: {
      id: true,
      display_name: true,
      email: true,
    },
  },
  _count: {
    select: {
      transactions: true,
    },
  },
});

/**
 * PATCH /api/admin/materials/[id]
 * Update material status (verify, reject, etc.)
 * Access: ADMIN only
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return forbiddenResponse();
  }

  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID");

    const body = await request.json();
    const parsed = updateMaterialStatusSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid input");
    }

    const { is_approved, status, is_public, rejection_reason } = parsed.data;

    const updateData: Record<string, unknown> = {};

    // Handle legacy is_approved field
    if (is_approved !== undefined) {
      updateData.is_approved = is_approved;
    }

    // Handle new status field (PENDING, VERIFIED, REJECTED)
    if (status !== undefined) {
      updateData.status = status;

      // When verifying, also set is_approved and is_public
      if (status === "VERIFIED") {
        updateData.is_approved = true;
        updateData.is_public = true;
      } else if (status === "REJECTED") {
        updateData.is_approved = false;
        updateData.is_public = false;
      }
    }

    // Handle explicit is_public update
    if (is_public !== undefined) {
      updateData.is_public = is_public;
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: updateData,
      select: materialSelect,
    });

    // Notify the author about approval/rejection (fire-and-forget)
    if (status === "VERIFIED") {
      notifyMaterialApproved(updated.seller.id, updated.title, updated.id);
    } else if (status === "REJECTED") {
      notifyMaterialRejected(updated.seller.id, updated.title, rejection_reason);
    }

    return NextResponse.json(updated);
  } catch (error) {
    captureError("Error updating material:", error);
    return serverError();
  }
}
