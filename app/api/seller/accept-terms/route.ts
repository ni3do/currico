import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAuth,
  unauthorized,
  notFound,
  badRequest,
  serverError,
  API_ERROR_CODES,
} from "@/lib/api";
import { captureError } from "@/lib/api-error";

/**
 * POST /api/seller/accept-terms
 * Record seller terms acceptance timestamp
 * Access: Authenticated users with verified email only
 */
export async function POST() {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    // Get user data to check requirements
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerified: true,
        seller_terms_accepted_at: true,
      },
    });

    if (!user) {
      return notFound();
    }

    // Require email verification before accepting terms
    if (!user.emailVerified) {
      return badRequest(
        "Email verification required",
        undefined,
        API_ERROR_CODES.EMAIL_VERIFICATION_REQUIRED
      );
    }

    // Check if already accepted
    if (user.seller_terms_accepted_at) {
      return NextResponse.json({
        success: true,
        alreadyAccepted: true,
        acceptedAt: user.seller_terms_accepted_at.toISOString(),
      });
    }

    // Record terms acceptance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        seller_terms_accepted_at: new Date(),
      },
      select: {
        seller_terms_accepted_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      alreadyAccepted: false,
      acceptedAt: updatedUser.seller_terms_accepted_at?.toISOString(),
    });
  } catch (error) {
    captureError("Error accepting seller terms:", error);
    return serverError();
  }
}

/**
 * GET /api/seller/accept-terms
 * Check if user has accepted seller terms
 * Access: Authenticated users only
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        seller_terms_accepted_at: true,
      },
    });

    if (!user) {
      return notFound();
    }

    return NextResponse.json({
      accepted: !!user.seller_terms_accepted_at,
      acceptedAt: user.seller_terms_accepted_at?.toISOString() ?? null,
    });
  } catch (error) {
    captureError("Error checking seller terms:", error);
    return serverError();
  }
}
