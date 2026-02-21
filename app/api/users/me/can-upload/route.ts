import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { canUploadMaterials } from "@/lib/validations/user";
import { requireAuth, unauthorized, notFound, serverError } from "@/lib/api";
import { captureError } from "@/lib/api-error";

/**
 * GET /api/users/me/can-upload
 * Check if the current user can upload resources
 * Returns missing requirements if not allowed
 * Access: Authenticated user only
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

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
      return notFound();
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
    captureError("Error checking upload eligibility:", error);
    return serverError();
  }
}
