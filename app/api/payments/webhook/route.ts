import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { constructWebhookEvent } from "@/lib/stripe";
import Stripe from "stripe";

/**
 * POST /api/payments/webhook
 * Handles Stripe webhooks for payment and Connect events
 * Access: Public (verified via Stripe signature)
 */
export async function POST(request: NextRequest) {
  let event: Stripe.Event;

  // Get the raw request body for signature verification
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Webhook: Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // Verify webhook signature
  try {
    event = constructWebhookEvent(payload, signature);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      // Future event handlers can be added here:
      // case "checkout.session.completed":
      //   await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      //   break;
      // case "payment_intent.payment_failed":
      //   await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      //   break;

      default:
        // Log unhandled events for debugging
        console.log(`Webhook: Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Webhook: Error handling ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle account.updated webhook event
 * Syncs Stripe Connect account status to database
 */
async function handleAccountUpdated(account: Stripe.Account): Promise<void> {
  const accountId = account.id;

  console.log(`Webhook: Processing account.updated for ${accountId}`);

  // Find user with this Stripe account
  const user = await prisma.user.findFirst({
    where: { stripe_account_id: accountId },
    select: {
      id: true,
      role: true,
      stripe_charges_enabled: true,
      stripe_payouts_enabled: true,
      stripe_onboarding_complete: true,
    },
  });

  if (!user) {
    console.warn(`Webhook: No user found for Stripe account ${accountId}`);
    return;
  }

  // Extract status from Stripe account
  const chargesEnabled = account.charges_enabled ?? false;
  const payoutsEnabled = account.payouts_enabled ?? false;
  const detailsSubmitted = account.details_submitted ?? false;

  // Prepare update data
  const updateData: {
    stripe_charges_enabled: boolean;
    stripe_payouts_enabled: boolean;
    stripe_onboarding_complete: boolean;
    role?: "SELLER";
  } = {
    stripe_charges_enabled: chargesEnabled,
    stripe_payouts_enabled: payoutsEnabled,
    stripe_onboarding_complete: detailsSubmitted,
  };

  // Upgrade user to SELLER role if onboarding is complete and charges are enabled
  // This is the official path to becoming a seller
  if (
    chargesEnabled &&
    detailsSubmitted &&
    user.role === "BUYER"
  ) {
    updateData.role = "SELLER";
    console.log(`Webhook: Upgrading user ${user.id} to SELLER role`);
  }

  // Update user if anything changed
  const hasChanges =
    user.stripe_charges_enabled !== chargesEnabled ||
    user.stripe_payouts_enabled !== payoutsEnabled ||
    user.stripe_onboarding_complete !== detailsSubmitted ||
    updateData.role !== undefined;

  if (hasChanges) {
    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    console.log(`Webhook: Updated user ${user.id}:`, {
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
      roleUpgrade: updateData.role ?? false,
    });
  } else {
    console.log(`Webhook: No changes for user ${user.id}`);
  }
}

// Disable body parsing since we need raw body for signature verification
export const runtime = "nodejs";
