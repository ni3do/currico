import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getConnectAccount, createExpressDashboardLink } from "@/lib/stripe";
import { requireAuth, unauthorized, notFound, serverError } from "@/lib/api";
import { captureError } from "@/lib/api-error";

/**
 * GET /api/seller/connect/status
 * Returns the current Stripe Connect status for the authenticated user
 * Access: Authenticated users
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

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
      return notFound();
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
      captureError("Error fetching Stripe account:", error);
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
        const loginLink = await createExpressDashboardLink(user.stripe_account_id);
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

    // Prepare update data
    const updateData: {
      stripe_charges_enabled?: boolean;
      stripe_payouts_enabled?: boolean;
      stripe_onboarding_complete?: boolean;
      role?: "SELLER";
    } = {};

    if (user.stripe_charges_enabled !== chargesEnabled) {
      updateData.stripe_charges_enabled = chargesEnabled;
    }
    if (user.stripe_payouts_enabled !== payoutsEnabled) {
      updateData.stripe_payouts_enabled = payoutsEnabled;
    }
    if (user.stripe_onboarding_complete !== detailsSubmitted) {
      updateData.stripe_onboarding_complete = detailsSubmitted;
    }

    // Upgrade user to SELLER role if onboarding is complete and charges are enabled
    // This is a fallback in case the webhook didn't process
    if (chargesEnabled && detailsSubmitted && user.role === "BUYER") {
      updateData.role = "SELLER";
      console.log(`Status sync: Upgrading user ${userId} to SELLER role`);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // Return the updated role (SELLER if just upgraded)
    const currentRole = updateData.role || user.role;

    return NextResponse.json({
      hasAccount: true,
      accountId: user.stripe_account_id,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
      onboardingComplete: detailsSubmitted,
      termsAccepted: !!user.seller_terms_accepted_at,
      role: currentRole,
      dashboardUrl,
      requirements: stripeAccount.requirements
        ? {
            currentlyDue: stripeAccount.requirements.currently_due || [],
            eventuallyDue: stripeAccount.requirements.eventually_due || [],
            pastDue: stripeAccount.requirements.past_due || [],
            pendingVerification: stripeAccount.requirements.pending_verification || [],
          }
        : null,
    });
  } catch (error) {
    captureError("Error getting Stripe Connect status:", error);

    // Handle Stripe-specific errors
    if (error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")) {
      return serverError();
    }

    return serverError();
  }
}
