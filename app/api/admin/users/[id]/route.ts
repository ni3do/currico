import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import { notFound, serverError } from "@/lib/api";

/**
 * GET /api/admin/users/[id]
 * Get full user details
 * Access: ADMIN only
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return unauthorizedResponse();
    }

    const { id } = await params;

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
    console.error("Error fetching user for admin:", error);
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
      return unauthorizedResponse();
    }

    const { id } = await params;
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
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
    if (existingUser.is_protected && body.role && body.role !== existingUser.role) {
      return NextResponse.json(
        { error: "Die Rolle eines geschützten Benutzers kann nicht geändert werden" },
        { status: 403 }
      );
    }

    // Only allow admin to update specific fields
    // Note: Seller verification is now handled via Stripe KYC, not admin toggle
    const allowedFields = ["role", "emailVerified"];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
    console.error("Error updating user as admin:", error);
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
      return unauthorizedResponse();
    }

    const { id } = await params;

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
      return NextResponse.json(
        { error: "Geschützte Benutzer können nicht gelöscht werden" },
        { status: 403 }
      );
    }

    // Prevent admin from deleting themselves
    if (id === admin.id) {
      return NextResponse.json({ error: "Sie können sich nicht selbst löschen" }, { status: 403 });
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

    return NextResponse.json({ success: true, message: "Benutzer wurde gelöscht" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return serverError();
  }
}
