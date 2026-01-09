import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canUploadResources } from "@/lib/validations/user";

// TODO: Replace with actual auth session
async function getCurrentUserId(): Promise<string | null> {
  return "demo-user-id";
}

/**
 * GET /api/users/me/can-upload
 * Check if the current user can upload resources
 * Returns missing requirements if not allowed
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
      select: {
        display_name: true,
        subjects: true,
        cycles: true,
        legal_first_name: true,
        legal_last_name: true,
        iban: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    const result = canUploadResources(user);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking upload eligibility:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
