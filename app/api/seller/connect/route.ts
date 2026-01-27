import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createConnectAccount, createAccountOnboardingLink } from "@/lib/stripe";

/**
 * POST /api/seller/connect
 * Creates a Stripe Express Connect account and returns onboarding link
 * Access: Authenticated users with verified email and accepted seller terms
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user data to check requirements
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        emailVerified: true,
        seller_terms_accepted_at: true,
        stripe_account_id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    // Require email verification
    if (!user.emailVerified) {
      return NextResponse.json({ error: "E-Mail muss zuerst verifiziert werden" }, { status: 400 });
    }

    // Require seller terms acceptance
    if (!user.seller_terms_accepted_at) {
      return NextResponse.json(
        { error: "Verkäuferbedingungen müssen zuerst akzeptiert werden" },
        { status: 400 }
      );
    }

    // Construct base URL from request
    // Force HTTPS in production (required for Stripe live mode)
    const host = request.headers.get("host") || "localhost:3000";
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    const protocol = isLocalhost ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // URLs for Stripe onboarding flow
    const refreshUrl = `${baseUrl}/become-seller?stripe_refresh=true`;
    const returnUrl = `${baseUrl}/seller/onboarding/complete`;

    let stripeAccountId = user.stripe_account_id;

    // Create Stripe account if user doesn't have one
    if (!stripeAccountId) {
      const account = await createConnectAccount(user.email, {
        user_id: userId,
      });

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
    console.error("Error creating Stripe Connect account:", error);

    // Handle Stripe-specific errors
    if (error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json({ error: "Stripe ist nicht konfiguriert" }, { status: 500 });
    }

    return NextResponse.json({ error: "Fehler beim Erstellen des Stripe-Kontos" }, { status: 500 });
  }
}
