import { NextRequest, NextResponse } from "next/server";
import { prisma, privateUserSelect } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/user";
import { maskIBAN } from "@/lib/utils/iban";

// TODO: Replace with actual auth session
async function getCurrentUserId(): Promise<string | null> {
  // Placeholder - integrate with your auth system (NextAuth, Clerk, etc.)
  // return session?.user?.id
  return "demo-user-id";
}

/**
 * GET /api/users/me
 * Get the current user's private profile (including payout info)
 * Access: Authenticated user only
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: privateUserSelect,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Mask IBAN for security (user can see partial IBAN)
    const response = {
      ...user,
      iban: user.iban ? maskIBAN(user.iban) : null,
      iban_set: !!user.iban, // Indicate if IBAN is set
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/me
 * Update the current user's profile
 * Access: Authenticated user only
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Ungültige Eingabe",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if payout info is complete to enable payouts
    const payoutEnabled =
      !!data.legal_first_name &&
      !!data.legal_last_name &&
      !!data.iban;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        payout_enabled: payoutEnabled,
        // Set is_seller to true if they have payout info
        is_seller: payoutEnabled ? true : undefined,
      },
      select: privateUserSelect,
    });

    // Mask IBAN in response
    const response = {
      ...updatedUser,
      iban: updatedUser.iban ? maskIBAN(updatedUser.iban) : null,
      iban_set: !!updatedUser.iban,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
