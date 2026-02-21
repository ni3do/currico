import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createConnectAccount, createAccountOnboardingLink } from "@/lib/stripe";
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
 * POST /api/seller/connect
 * Creates a Stripe Express Connect account and returns onboarding link
 * Access: Authenticated users with verified email and accepted seller terms
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    // Get user data to check requirements
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        emailVerified: true,
        seller_terms_accepted_at: true,
        stripe_account_id: true,
        display_name: true,
        name: true,
      },
    });

    if (!user) {
      return notFound();
    }

    // Require email verification
    if (!user.emailVerified) {
      return badRequest(
        "Email verification required",
        undefined,
        API_ERROR_CODES.EMAIL_VERIFICATION_REQUIRED
      );
    }

    // Require seller terms acceptance
    if (!user.seller_terms_accepted_at) {
      return badRequest("Seller terms required", undefined, API_ERROR_CODES.SELLER_TERMS_REQUIRED);
    }

    // Construct base URL from request
    // Force HTTPS in production (required for Stripe live mode)
    const host = request.headers.get("host") || "localhost:3000";
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    const protocol = isLocalhost ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // URLs for Stripe onboarding flow
    const refreshUrl = `${baseUrl}/verkaeufer-werden?stripe_refresh=true`;
    const returnUrl = `${baseUrl}/seller/onboarding/complete`;

    let stripeAccountId = user.stripe_account_id;

    // Create Stripe account if user doesn't have one
    if (!stripeAccountId) {
      const account = await createConnectAccount(
        user.email,
        { user_id: userId },
        user.display_name || user.name || undefined
      );

      stripeAccountId = account.id;

      // Save the Stripe account ID to the user
      await prisma.user.update({
        where: { id: userId },
        data: {
          stripe_account_id: stripeAccountId,
        },
      });
    }

    // Create onboarding link
    const accountLink = await createAccountOnboardingLink(stripeAccountId, refreshUrl, returnUrl);

    return NextResponse.json({
      success: true,
      url: accountLink.url,
      stripeAccountId,
    });
  } catch (error) {
    captureError("Error creating Stripe Connect account:", error);

    // Handle Stripe-specific errors
    if (error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")) {
      return serverError();
    }

    return serverError();
  }
}
