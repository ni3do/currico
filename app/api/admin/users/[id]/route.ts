import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// TODO: Replace with actual auth session and admin check
async function getCurrentUserRole(): Promise<string | null> {
  // Placeholder - integrate with your auth system
  return "ADMIN"; // For development only!
}

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
    const role = await getCurrentUserRole();

    if (role !== "ADMIN") {
      return NextResponse.json(
        { error: "Zugriff verweigert" },
        { status: 403 }
      );
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
    const role = await getCurrentUserRole();

    if (role !== "ADMIN") {
      return NextResponse.json(
        { error: "Zugriff verweigert" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Only allow admin to update specific fields
    const allowedFields = ["seller_verified", "role", "email_verified"];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
