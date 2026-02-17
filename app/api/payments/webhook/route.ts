import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { constructWebhookEvent } from "@/lib/stripe";
import { sendPurchaseConfirmationEmail } from "@/lib/email";
import { notifySale, checkDownloadMilestone } from "@/lib/notifications";
import { checkAndUpdateVerification } from "@/lib/utils/verified-seller";
import { DOWNLOAD_LINK_EXPIRY_DAYS, DOWNLOAD_LINK_MAX_DOWNLOADS } from "@/lib/constants";
import Stripe from "stripe";

const isDev = process.env.NODE_ENV === "development";

/**
 * POST /api/payments/webhook
 * Handles Stripe webhooks for payment and Connect events
 * Access: Public (verified via Stripe signature)
 */
export async function POST(request: NextRequest) {
  if (isDev) console.log("[PAYMENT WEBHOOK] WEBHOOK RECEIVED", new Date().toISOString());

  let event: Stripe.Event;

  // Get the raw request body for signature verification
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (isDev) console.log("[PAYMENT WEBHOOK] Payload:", payload.length, "Signature:", !!signature);

  if (!signature) {
    console.error("[PAYMENT WEBHOOK] ERROR: Missing stripe-signature header");
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // Verify webhook signature
  try {
    event = constructWebhookEvent(payload, signature);
    if (isDev) console.log("[PAYMENT WEBHOOK] Verified:", event.type, event.id);
  } catch (error) {
    console.error("[PAYMENT WEBHOOK] ERROR: Signature verification failed:", error);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        if (isDev) console.log(`Webhook: Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Webhook: Error handling ${event.type}:`, error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

/**
 * Handle account.updated webhook event
 * Syncs Stripe Connect account status to database
 */
async function handleAccountUpdated(account: Stripe.Account): Promise<void> {
  const accountId = account.id;

  if (isDev) console.log(`Webhook: account.updated for ${accountId}`);

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
  if (chargesEnabled && detailsSubmitted && user.role === "BUYER") {
    updateData.role = "SELLER";
    if (isDev) console.log(`Webhook: Upgrading user ${user.id} to SELLER role`);
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

    if (isDev)
      console.log(`Webhook: Updated user ${user.id}:`, {
        chargesEnabled,
        payoutsEnabled,
        detailsSubmitted,
        roleUpgrade: updateData.role ?? false,
      });
  } else {
    if (isDev) console.log(`Webhook: No changes for user ${user.id}`);
  }
}

/**
 * Handle checkout.session.completed webhook event
 * Updates transaction to COMPLETED and grants resource access to buyer
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const sessionId = session.id;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const paymentStatus = session.payment_status;

  if (isDev)
    console.log("[PAYMENT WEBHOOK] CHECKOUT SESSION COMPLETED:", {
      sessionId,
      paymentIntentId,
      paymentStatus,
    });

  // Only process successful payments
  if (paymentStatus !== "paid") {
    if (isDev) console.log(`Webhook: Skipping session ${sessionId} with status ${paymentStatus}`);
    return;
  }

  // Find the pending transaction by checkout session ID with resource and buyer details
  const transaction = await prisma.transaction.findFirst({
    where: {
      stripe_checkout_session_id: sessionId,
      status: "PENDING",
    },
    select: {
      id: true,
      buyer_id: true,
      guest_email: true,
      resource_id: true,
      amount: true,
      resource: {
        select: {
          title: true,
          seller_id: true,
        },
      },
      buyer: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!transaction) {
    console.warn(`Webhook: No pending transaction found for session ${sessionId}`);
    return;
  }

  // Get payment method from session if available
  const paymentMethod = session.payment_method_types?.[0] ?? null;

  // Determine if this is a guest checkout
  const isGuestCheckout = !transaction.buyer_id;

  // Generate download token for guest checkout
  let downloadToken: string | null = null;
  if (isGuestCheckout) {
    downloadToken = crypto.randomUUID();
  }

  // Calculate token expiration (7 days from now)
  const tokenExpiresAt = new Date();
  tokenExpiresAt.setDate(tokenExpiresAt.getDate() + DOWNLOAD_LINK_EXPIRY_DAYS);

  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // Update transaction to COMPLETED
    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "COMPLETED",
        stripe_payment_intent_id: paymentIntentId ?? null,
        payment_method: paymentMethod,
      },
    });

    // Grant resource access
    if (isGuestCheckout && downloadToken) {
      // For guests, create a download token
      await tx.downloadToken.create({
        data: {
          token: downloadToken,
          expires_at: tokenExpiresAt,
          max_downloads: DOWNLOAD_LINK_MAX_DOWNLOADS,
          transaction_id: transaction.id,
        },
      });
    } else if (transaction.buyer_id) {
      // For authenticated users, create Download record if it doesn't exist
      await tx.download.upsert({
        where: {
          user_id_resource_id: {
            user_id: transaction.buyer_id,
            resource_id: transaction.resource_id,
          },
        },
        update: {}, // No update needed if already exists
        create: {
          user_id: transaction.buyer_id,
          resource_id: transaction.resource_id,
        },
      });
    }
  });

  // Send purchase confirmation email
  const buyerEmail = isGuestCheckout ? transaction.guest_email : transaction.buyer?.email;

  if (buyerEmail) {
    const emailResult = await sendPurchaseConfirmationEmail({
      email: buyerEmail,
      resourceTitle: transaction.resource.title,
      amount: transaction.amount,
      downloadToken: downloadToken ?? undefined,
      isGuest: isGuestCheckout,
      // Default to German for Swiss platform
      locale: "de",
    });

    if (emailResult.success) {
      if (isDev) console.log(`Webhook: Sent purchase confirmation to ${buyerEmail}`);
    } else {
      // Log as critical error for visibility - transaction completed but buyer won't receive email
      console.error(
        `CRITICAL: Email failed for completed transaction ${transaction.id} to ${buyerEmail}: ${emailResult.error}`
      );
    }
  } else {
    console.warn(`Webhook: No email address available for transaction ${transaction.id}`);
  }

  // Notify the seller about the sale (fire-and-forget)
  notifySale(transaction.resource.seller_id, transaction.resource.title, transaction.amount);

  // Check if seller now qualifies for verified status (fire-and-forget)
  checkAndUpdateVerification(transaction.resource.seller_id).catch((err) =>
    console.error("Verification check failed after purchase:", err)
  );

  // Check for download milestones (fire-and-forget)
  checkDownloadMilestone(transaction.resource_id).catch((err) =>
    console.error("Milestone check failed after purchase:", err)
  );

  if (isDev) {
    console.log(`Webhook: Completed transaction ${transaction.id}`, {
      isGuestCheckout,
      resourceId: transaction.resource_id,
    });
  }
}

/**
 * Handle payment_intent.payment_failed webhook event
 * Marks pending transactions as failed when payment fails
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const paymentIntentId = paymentIntent.id;
  const metadata = paymentIntent.metadata;

  if (isDev) console.log(`Webhook: payment_intent.payment_failed for ${paymentIntentId}`);

  // Extract identifiers from metadata (set during checkout session creation)
  const resourceId = metadata?.resourceId;
  const buyerId = metadata?.buyerId;
  const guestEmail = metadata?.guestEmail;

  if (!resourceId) {
    console.warn(
      `Webhook: Missing resourceId metadata on failed payment intent ${paymentIntentId}`
    );
    return;
  }

  // Need either buyerId or guestEmail to identify the transaction
  if (!buyerId && !guestEmail) {
    console.warn(
      `Webhook: Missing buyerId/guestEmail metadata on failed payment intent ${paymentIntentId}`
    );
    return;
  }

  // Find the pending transaction for this buyer/guest and resource
  const transactionWhere = buyerId
    ? { buyer_id: buyerId, resource_id: resourceId, status: "PENDING" as const }
    : { guest_email: guestEmail, resource_id: resourceId, status: "PENDING" as const };

  const transaction = await prisma.transaction.findFirst({
    where: transactionWhere,
    select: {
      id: true,
    },
  });

  if (!transaction) {
    console.warn(
      `Webhook: No pending transaction found for failed payment intent ${paymentIntentId}`
    );
    return;
  }

  // Get failure reason if available
  const lastPaymentError = paymentIntent.last_payment_error;
  const failureMessage = lastPaymentError?.message ?? "Payment failed";

  // Update transaction to FAILED
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: "FAILED",
      stripe_payment_intent_id: paymentIntentId,
    },
  });

  if (isDev) console.log(`Webhook: FAILED transaction ${transaction.id} for PI ${paymentIntentId}`);
}

/**
 * Handle charge.refunded webhook event
 * Sets Transaction to REFUNDED, invalidates DownloadTokens, deletes Download records
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;

  if (isDev) console.log(`[PAYMENT WEBHOOK] charge.refunded for PI: ${paymentIntentId}`);

  if (!paymentIntentId) {
    console.warn("[PAYMENT WEBHOOK] No payment_intent on refunded charge");
    return;
  }

  // Find the completed transaction by payment intent ID
  const transaction = await prisma.transaction.findFirst({
    where: {
      stripe_payment_intent_id: paymentIntentId,
      status: "COMPLETED",
    },
    select: {
      id: true,
      buyer_id: true,
      resource_id: true,
    },
  });

  if (!transaction) {
    console.warn(`[PAYMENT WEBHOOK] No completed transaction found for PI: ${paymentIntentId}`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Mark transaction as REFUNDED
    await tx.transaction.update({
      where: { id: transaction.id },
      data: { status: "REFUNDED" },
    });

    // Delete all download tokens for this transaction
    await tx.downloadToken.deleteMany({
      where: { transaction_id: transaction.id },
    });

    // Remove download access for authenticated buyer
    if (transaction.buyer_id) {
      await tx.download.deleteMany({
        where: {
          user_id: transaction.buyer_id,
          resource_id: transaction.resource_id,
        },
      });
    }
  });

  if (isDev) console.log(`[PAYMENT WEBHOOK] Refunded transaction ${transaction.id}`);
}

// Disable body parsing since we need raw body for signature verification
export const runtime = "nodejs";
