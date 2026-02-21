import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, forbiddenResponse } from "@/lib/admin-auth";
import { badRequest, notFound, serverError, API_ERROR_CODES } from "@/lib/api";
import { captureError } from "@/lib/api-error";

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
      return badRequest("User ID required", undefined, API_ERROR_CODES.INVALID_ID);
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
      return notFound("User not found", API_ERROR_CODES.USER_NOT_FOUND);
    }

    // Prevent modifying protected users (other admins)
    if (user.is_protected) {
      return badRequest("Protected user", undefined, API_ERROR_CODES.PROTECTED_USER);
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
      message: "Teacher verification successful",
      user: updatedUser,
    });
  } catch (error) {
    captureError("Error verifying teacher:", error);
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
      return badRequest("User ID required", undefined, API_ERROR_CODES.INVALID_ID);
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
      return notFound("User not found", API_ERROR_CODES.USER_NOT_FOUND);
    }

    // Prevent modifying protected users
    if (user.is_protected) {
      return badRequest("Protected user", undefined, API_ERROR_CODES.PROTECTED_USER);
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
    captureError("Error removing teacher verification:", error);
    return serverError();
  }
}
