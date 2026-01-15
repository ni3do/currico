import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";

/**
 * GET /api/admin/users/[id]
 * Get full user details including unmasked IBAN
 * Access: ADMIN only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        legal_first_name: true,
        legal_last_name: true,
        iban: true, // Full IBAN for admin
        address_street: true,
        address_city: true,
        address_postal: true,
        address_country: true,
        role: true,
        is_seller: true,
        seller_verified: true,
        payout_enabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user for admin:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user (admin can verify sellers, change roles)
 * Access: ADMIN only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();

    // Only allow admin to update specific fields
    // Map request field names to Prisma field names
    const fieldMapping: Record<string, string> = {
      seller_verified: "seller_verified",
      role: "role",
      emailVerified: "emailVerified",
    };
    const updateData: Record<string, unknown> = {};

    for (const [requestField, prismaField] of Object.entries(fieldMapping)) {
      if (requestField in body) {
        updateData[prismaField] = body[requestField];
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
        is_seller: true,
        seller_verified: true,
        updated_at: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user as admin:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
