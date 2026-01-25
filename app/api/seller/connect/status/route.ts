import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getConnectAccount, createExpressDashboardLink } from "@/lib/stripe";

/**
 * GET /api/seller/connect/status
 * Returns the current Stripe Connect status for the authenticated user
 * Access: Authenticated users
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's Stripe data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripe_account_id: true,
        stripe_onboarding_complete: true,
        stripe_charges_enabled: true,
        stripe_payouts_enabled: true,
        seller_terms_accepted_at: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // If user doesn't have a Stripe account yet, return minimal status
    if (!user.stripe_account_id) {
      return NextResponse.json({
        hasAccount: false,
        accountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        onboardingComplete: false,
        termsAccepted: !!user.seller_terms_accepted_at,
        role: user.role,
        dashboardUrl: null,
        requirements: null,
      });
    }

    // Fetch current status from Stripe
    let stripeAccount;
    try {
      stripeAccount = await getConnectAccount(user.stripe_account_id);
    } catch (error) {
      console.error("Error fetching Stripe account:", error);
      // Return cached data if Stripe API fails
      return NextResponse.json({
        hasAccount: true,
        accountId: user.stripe_account_id,
        chargesEnabled: user.stripe_charges_enabled,
        payoutsEnabled: user.stripe_payouts_enabled,
        detailsSubmitted: false,
        onboardingComplete: user.stripe_onboarding_complete,
        termsAccepted: !!user.seller_terms_accepted_at,
        role: user.role,
        dashboardUrl: null,
        requirements: null,
        error: "Stripe-Status konnte nicht abgerufen werden",
      });
    }

    // Try to get dashboard link if charges are enabled
    let dashboardUrl: string | null = null;
    if (stripeAccount.charges_enabled) {
      try {
        const loginLink = await createExpressDashboardLink(
          user.stripe_account_id
        );
        dashboardUrl = loginLink.url;
      } catch {
        // Dashboard link might not be available in some cases
        dashboardUrl = null;
      }
    }

    // Sync status to database if it has changed
    const chargesEnabled = stripeAccount.charges_enabled ?? false;
    const payoutsEnabled = stripeAccount.payouts_enabled ?? false;
    const detailsSubmitted = stripeAccount.details_submitted ?? false;

    if (
      user.stripe_charges_enabled !== chargesEnabled ||
      user.stripe_payouts_enabled !== payoutsEnabled ||
      user.stripe_onboarding_complete !== detailsSubmitted
    ) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          stripe_charges_enabled: chargesEnabled,
          stripe_payouts_enabled: payoutsEnabled,
          stripe_onboarding_complete: detailsSubmitted,
        },
      });
    }

    return NextResponse.json({
      hasAccount: true,
      accountId: user.stripe_account_id,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
      onboardingComplete: detailsSubmitted,
      termsAccepted: !!user.seller_terms_accepted_at,
      role: user.role,
      dashboardUrl,
      requirements: stripeAccount.requirements
        ? {
            currentlyDue: stripeAccount.requirements.currently_due || [],
            eventuallyDue: stripeAccount.requirements.eventually_due || [],
            pastDue: stripeAccount.requirements.past_due || [],
            pendingVerification:
              stripeAccount.requirements.pending_verification || [],
          }
        : null,
    });
  } catch (error) {
    console.error("Error getting Stripe Connect status:", error);

    // Handle Stripe-specific errors
    if (
      error instanceof Error &&
      error.message.includes("STRIPE_SECRET_KEY")
    ) {
      return NextResponse.json(
        { error: "Stripe ist nicht konfiguriert" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Fehler beim Abrufen des Stripe-Status" },
      { status: 500 }
    );
  }
}
