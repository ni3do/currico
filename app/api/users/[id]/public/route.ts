import { NextRequest, NextResponse } from "next/server";
import { prisma, publicUserSelect } from "@/lib/db";

/**
 * GET /api/users/[id]/public
 * Get a user's public profile
 * Access: Everyone (public)
 *
 * IMPORTANT: This endpoint only returns PUBLIC data.
 * Email, legal name, IBAN, and address are NEVER exposed.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: publicUserSelect, // Only public fields!
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Only return sellers with verified status or any public profile
    // You might want to restrict this to only show seller profiles
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
