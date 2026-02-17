import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { unauthorized, badRequest, notFound, serverError } from "@/lib/api";
import { notifyManualVerification } from "@/lib/notifications";

/**
 * POST /api/admin/users/[id]/verify-seller
 * Manually verify a user as a verified seller (admin only)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await requireAdmin();
  if (!adminId) return unauthorized();

  try {
    const { id: userId } = await params;

    if (!userId) {
      return badRequest("User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        is_verified_seller: true,
        is_protected: true,
      },
    });

    if (!user) {
      return notFound("User not found");
    }

    if (user.is_protected) {
      return badRequest("Cannot modify protected user");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        is_verified_seller: true,
        verified_seller_at: new Date(),
        verified_seller_method: "manual",
      },
      select: {
        id: true,
        email: true,
        display_name: true,
        is_verified_seller: true,
        verified_seller_at: true,
        verified_seller_method: true,
      },
    });

    // Notify the user about manual verification (fire-and-forget)
    notifyManualVerification(userId);

    return NextResponse.json({
      message: "Verkäufer-Verifizierung erfolgreich",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error verifying seller:", error);
    return serverError();
  }
}

/**
 * DELETE /api/admin/users/[id]/verify-seller
 * Remove seller verification from a user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await requireAdmin();
  if (!adminId) return unauthorized();

  try {
    const { id: userId } = await params;

    if (!userId) {
      return badRequest("User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        is_verified_seller: true,
        is_protected: true,
      },
    });

    if (!user) {
      return notFound("User not found");
    }

    if (user.is_protected) {
      return badRequest("Cannot modify protected user");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        is_verified_seller: false,
        verified_seller_at: null,
        verified_seller_method: null,
      },
      select: {
        id: true,
        email: true,
        display_name: true,
        is_verified_seller: true,
      },
    });

    return NextResponse.json({
      message: "Verkäufer-Verifizierung entfernt",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error removing seller verification:", error);
    return serverError();
  }
}
