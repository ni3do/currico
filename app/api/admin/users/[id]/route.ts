import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, forbiddenResponse } from "@/lib/admin-auth";
import { notFound, serverError, badRequest, forbidden, API_ERROR_CODES } from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { isValidId } from "@/lib/rateLimit";
import { updateAdminUserSchema } from "@/lib/validations/admin";

/**
 * GET /api/admin/users/[id]
 * Get full user details
 * Access: ADMIN only
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return forbiddenResponse();
    }

    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        name: true,
        display_name: true,
        image: true,
        bio: true,
        subjects: true,
        cycles: true,
        cantons: true,
        email: true,
        emailVerified: true,
        role: true,
        stripe_account_id: true,
        stripe_onboarding_complete: true,
        stripe_charges_enabled: true,
        stripe_payouts_enabled: true,
        seller_terms_accepted_at: true,
        is_protected: true,
      },
    });

    if (!user) {
      return notFound();
    }

    return NextResponse.json(user);
  } catch (error) {
    captureError("Error fetching user for admin:", error);
    return serverError();
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user (admin can verify sellers, change roles)
 * Access: ADMIN only
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return forbiddenResponse();
    }

    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body", undefined, API_ERROR_CODES.INVALID_JSON_BODY);
    }

    const parsed = updateAdminUserSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid input", { details: parsed.error.flatten().fieldErrors });
    }

    // Check if user is protected (e.g., super admin)
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { is_protected: true, role: true },
    });

    if (!existingUser) {
      return notFound();
    }

    // Prevent changing role of protected users
    if (existingUser.is_protected && parsed.data.role && parsed.data.role !== existingUser.role) {
      return forbidden("Protected user", API_ERROR_CODES.PROTECTED_USER);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        display_name: true,
        email: true,
        emailVerified: true,
        role: true,
        stripe_onboarding_complete: true,
        stripe_charges_enabled: true,
        updated_at: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    captureError("Error updating user as admin:", error);
    return serverError();
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (protected users cannot be deleted)
 * Access: ADMIN only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return forbiddenResponse();
    }

    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);

    // Check if user exists and is protected
    const user = await prisma.user.findUnique({
      where: { id },
      select: { is_protected: true, email: true },
    });

    if (!user) {
      return notFound();
    }

    // Prevent deletion of protected users (e.g., super admin)
    if (user.is_protected) {
      return forbidden("Protected user", API_ERROR_CODES.PROTECTED_USER);
    }

    // Prevent admin from deleting themselves
    if (id === admin.id) {
      return forbidden("Cannot delete self", API_ERROR_CODES.CANNOT_DELETE_SELF);
    }

    // Use a transaction to clean up FK dependencies not covered by onDelete: Cascade
    await prisma.$transaction(async (tx) => {
      await tx.transaction.updateMany({
        where: { buyer_id: id },
        data: { buyer_id: null },
      });
      await tx.transaction.deleteMany({
        where: { resource: { seller_id: id } },
      });
      await tx.resource.deleteMany({
        where: { seller_id: id },
      });
      await tx.user.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    captureError("Error deleting user:", error);
    return serverError();
  }
}
