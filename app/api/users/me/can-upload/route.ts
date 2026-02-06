import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { canUploadMaterials } from "@/lib/validations/user";
import { getCurrentUserId } from "@/lib/auth";

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
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        display_name: true,
        subjects: true,
        cycles: true,
        role: true,
        stripe_charges_enabled: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    const result = canUploadMaterials({
      display_name: user.display_name,
      subjects: toStringArray(user.subjects),
      cycles: toStringArray(user.cycles),
      role: user.role,
      stripe_charges_enabled: user.stripe_charges_enabled,
      emailVerified: user.emailVerified,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking upload eligibility:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
