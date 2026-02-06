import Stripe from "stripe";
import { PLATFORM_FEE_PERCENT } from "./constants";

let stripeClient: Stripe | null = null;

/**
 * Get the Stripe server-side client
 * Uses singleton pattern to reuse the client across requests
 */
export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }

  return stripeClient;
}

/**
 * Get the Stripe publishable key for client-side use
 */
export function getStripePublishableKey(): string {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is not set");
  }
  return publishableKey;
}

/**
 * Calculate the platform application fee for a given amount in cents
 */
export function calculateApplicationFee(amountCents: number): number {
  return Math.round((amountCents * PLATFORM_FEE_PERCENT) / 100);
}

/**
 * Create a Stripe Express Connect account for a seller
 * Configured for minimal KYC: individual sellers in Switzerland, transfers only
 */
export async function createConnectAccount(
  email: string,
  metadata?: Record<string, string>
): Promise<Stripe.Account> {
  const stripe = getStripeClient();
  return stripe.accounts.create({
    type: "express",
    country: "CH",
    business_type: "individual",
    email,
    metadata,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    settings: {
      payouts: {
        schedule: {
          interval: "weekly",
          weekly_anchor: "monday",
        },
      },
    },
  });
}

/**
 * Create an account onboarding link for Stripe Express
 * Uses collection_options to omit future requirements for minimal friction
 */
export async function createAccountOnboardingLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<Stripe.AccountLink> {
  const stripe = getStripeClient();
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
    collection_options: {
      future_requirements: "omit",
    },
  });
}

/**
 * Create a login link to the Stripe Express dashboard
 */
export async function createExpressDashboardLink(accountId: string): Promise<Stripe.LoginLink> {
  const stripe = getStripeClient();
  return stripe.accounts.createLoginLink(accountId);
}

/**
 * Retrieve a Stripe Connect account
 */
export async function getConnectAccount(accountId: string): Promise<Stripe.Account> {
  const stripe = getStripeClient();
  return stripe.accounts.retrieve(accountId);
}

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[STRIPE] ERROR: STRIPE_WEBHOOK_SECRET environment variable is not set");
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
  }

  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
