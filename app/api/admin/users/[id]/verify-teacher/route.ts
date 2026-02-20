import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, forbiddenResponse } from "@/lib/admin-auth";
import { badRequest, notFound, serverError } from "@/lib/api";

/**
 * POST /api/admin/users/[id]/verify-teacher
 * Manually verify a user as a teacher (admin only)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await requireAdmin();
  if (!adminId) return forbiddenResponse();

  try {
    const { id: userId } = await params;

    if (!userId) {
      return badRequest("User ID is required");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        is_teacher_verified: true,
        is_protected: true,
      },
    });

    if (!user) {
      return notFound("User not found");
    }

    // Prevent modifying protected users (other admins)
    if (user.is_protected) {
      return badRequest("Cannot modify protected user");
    }

    // Update user with manual verification
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        is_teacher_verified: true,
        teacher_verified_at: new Date(),
        teacher_verification_method: "manual",
      },
      select: {
        id: true,
        email: true,
        display_name: true,
        is_teacher_verified: true,
        teacher_verified_at: true,
        teacher_verification_method: true,
      },
    });

    return NextResponse.json({
      message: "Lehrer-Verifizierung erfolgreich",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error verifying teacher:", error);
    return serverError();
  }
}

/**
 * DELETE /api/admin/users/[id]/verify-teacher
 * Remove teacher verification from a user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await requireAdmin();
  if (!adminId) return forbiddenResponse();

  try {
    const { id: userId } = await params;

    if (!userId) {
      return badRequest("User ID is required");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        is_teacher_verified: true,
        is_protected: true,
      },
    });

    if (!user) {
      return notFound("User not found");
    }

    // Prevent modifying protected users
    if (user.is_protected) {
      return badRequest("Cannot modify protected user");
    }

    // Remove teacher verification
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        is_teacher_verified: false,
        teacher_verified_at: null,
        teacher_verification_method: null,
      },
      select: {
        id: true,
        email: true,
        display_name: true,
        is_teacher_verified: true,
      },
    });

    return NextResponse.json({
      message: "Lehrer-Verifizierung entfernt",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error removing teacher verification:", error);
    return serverError();
  }
}
