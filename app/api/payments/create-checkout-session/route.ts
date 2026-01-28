import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getStripeClient, calculateApplicationFee } from "@/lib/stripe";

// Input validation schema
const createCheckoutSessionSchema = z.object({
  resourceId: z.string().min(1, "Resource ID is required"),
  guestEmail: z.string().email("Valid email required for guest checkout").optional(),
});

/**
 * POST /api/payments/create-checkout-session
 * Creates a Stripe Checkout session for purchasing a resource
 * Access: Authenticated users OR guests with email
 */
export async function POST(request: NextRequest) {
  // Get authenticated user (optional for guest checkout)
  const session = await auth();
  const userId = session?.user?.id || null;

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createCheckoutSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { resourceId, guestEmail } = parsed.data;

  // Require either authentication or guest email
  if (!userId && !guestEmail) {
    return NextResponse.json({ error: "Authentication or guest email required" }, { status: 401 });
  }

  // Determine buyer email for Stripe customer
  const isGuestCheckout = !userId;
  let buyerEmail: string;

  if (isGuestCheckout) {
    buyerEmail = guestEmail!;
  } else {
    // Fetch authenticated user's email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    buyerEmail = user.email;
  }

  try {
    // Fetch resource with seller info
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        is_published: true,
        is_approved: true,
        seller_id: true,
        seller: {
          select: {
            id: true,
            stripe_account_id: true,
            stripe_charges_enabled: true,
          },
        },
      },
    });

    // Validate resource exists and is available for purchase
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    if (!resource.is_published || !resource.is_approved) {
      return NextResponse.json(
        { error: "Resource is not available for purchase" },
        { status: 400 }
      );
    }

    // Prevent purchasing own resources (only applies to authenticated users)
    if (userId && resource.seller_id === userId) {
      return NextResponse.json({ error: "Cannot purchase your own resource" }, { status: 400 });
    }

    // Check if user/guest already owns this resource
    const existingPurchaseWhere = userId
      ? { buyer_id: userId, resource_id: resourceId, status: "COMPLETED" as const }
      : { guest_email: guestEmail, resource_id: resourceId, status: "COMPLETED" as const };

    const existingPurchase = await prisma.transaction.findFirst({
      where: existingPurchaseWhere,
    });

    if (existingPurchase) {
      return NextResponse.json({ error: "You already own this resource" }, { status: 400 });
    }

    // Validate seller can receive payments
    if (!resource.seller.stripe_account_id || !resource.seller.stripe_charges_enabled) {
      return NextResponse.json(
        { error: "Seller cannot receive payments at this time" },
        { status: 400 }
      );
    }

    // Free resources don't need checkout
    if (resource.price === 0) {
      return NextResponse.json(
        { error: "Free resources do not require checkout" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();

    // Get or create Stripe customer
    let stripeCustomerId: string;

    if (!isGuestCheckout) {
      // For authenticated users, get or create customer linked to user
      const buyer = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          stripe_customer_id: true,
        },
      });

      if (!buyer) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      stripeCustomerId = buyer.stripe_customer_id || "";

      if (!stripeCustomerId) {
        // Create a new Stripe customer for authenticated user
        const customer = await stripe.customers.create({
          email: buyer.email,
          metadata: {
            userId: buyer.id,
          },
        });

        stripeCustomerId = customer.id;

        // Save customer ID to database
        await prisma.user.update({
          where: { id: userId },
          data: { stripe_customer_id: stripeCustomerId },
        });
      }
    } else {
      // For guests, create a new Stripe customer with guest email
      const customer = await stripe.customers.create({
        email: guestEmail!,
        metadata: {
          guestCheckout: "true",
        },
      });
      stripeCustomerId = customer.id;
    }

    // Calculate application fee (platform fee)
    const applicationFeeAmount = calculateApplicationFee(resource.price);

    // Build success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/checkout/cancel?resource_id=${resourceId}`;

    // Build metadata for Stripe (include guest_email for guest checkouts)
    const stripeMetadata: Record<string, string> = {
      resourceId: resource.id,
      sellerId: resource.seller_id,
    };

    if (isGuestCheckout) {
      stripeMetadata.guestEmail = guestEmail!;
    } else {
      stripeMetadata.buyerId = userId!;
    }

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: "chf",
            product_data: {
              name: resource.title,
              description: resource.description.substring(0, 500),
            },
            unit_amount: resource.price,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: resource.seller.stripe_account_id,
        },
        metadata: stripeMetadata,
      },
      metadata: stripeMetadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // Create pending transaction record
    const transaction = await prisma.transaction.create({
      data: {
        buyer_id: isGuestCheckout ? null : userId,
        guest_email: isGuestCheckout ? guestEmail : null,
        resource_id: resourceId,
        amount: resource.price,
        status: "PENDING",
        stripe_checkout_session_id: checkoutSession.id,
        platform_fee_amount: applicationFeeAmount,
        seller_payout_amount: resource.price - applicationFeeAmount,
      },
    });

    console.log("[PAYMENT] ========== CHECKOUT SESSION CREATED ==========");
    console.log("[PAYMENT] Transaction ID:", transaction.id);
    console.log("[PAYMENT] Stripe Session ID:", checkoutSession.id);
    console.log("[PAYMENT] Resource ID:", resourceId);
    console.log("[PAYMENT] Buyer ID:", userId);
    console.log("[PAYMENT] Is Guest:", isGuestCheckout);
    console.log("[PAYMENT] Amount:", resource.price);

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);

    // Handle specific Stripe errors
    if (error instanceof Error && error.message.includes("Stripe")) {
      return NextResponse.json(
        { error: "Payment service error. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
