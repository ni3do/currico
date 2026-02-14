import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST as webhookPOST } from "@/app/api/payments/webhook/route";
import { parseResponse } from "../../helpers/api-test-utils";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

// Mock Stripe functions
vi.mock("@/lib/stripe", () => ({
  constructWebhookEvent: vi.fn(),
}));

// Mock email function
vi.mock("@/lib/email", () => ({
  sendPurchaseConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

// Get mocked functions
const mockUserFindFirst = prisma.user.findFirst as ReturnType<typeof vi.fn>;
const mockUserUpdate = prisma.user.update as ReturnType<typeof vi.fn>;
const mockTransactionFindFirst = prisma.transaction.findFirst as ReturnType<typeof vi.fn>;
const mockTransactionUpdate = prisma.transaction.update as ReturnType<typeof vi.fn>;
const mockDownloadUpsert = prisma.download.upsert as ReturnType<typeof vi.fn>;
const mockDownloadTokenCreate = prisma.downloadToken.create as ReturnType<typeof vi.fn>;
const mockPrismaTransaction = prisma.$transaction as ReturnType<typeof vi.fn>;

// Import mocks after vi.mock
import { constructWebhookEvent } from "@/lib/stripe";
import { sendPurchaseConfirmationEmail } from "@/lib/email";

const mockConstructWebhookEvent = constructWebhookEvent as ReturnType<typeof vi.fn>;
const mockSendPurchaseConfirmationEmail = sendPurchaseConfirmationEmail as ReturnType<typeof vi.fn>;

// Type definitions for responses
interface WebhookResponse {
  received?: boolean;
  error?: string;
}

/**
 * Create a mock NextRequest for webhook testing
 */
function createWebhookRequest(payload: string, signature: string | null): Request {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (signature !== null) {
    headers["stripe-signature"] = signature;
  }

  return new Request("http://localhost:3000/api/payments/webhook", {
    method: "POST",
    headers,
    body: payload,
  }) as unknown as Request;
}

/**
 * Create a mock Stripe event
 */
function createMockStripeEvent(type: string, data: Record<string, unknown>): Stripe.Event {
  return {
    id: `evt_${Date.now()}`,
    object: "event",
    api_version: "2025-12-15.clover",
    created: Math.floor(Date.now() / 1000),
    type,
    data: {
      object: data,
    },
    livemode: false,
    pending_webhooks: 0,
    request: null,
  } as unknown as Stripe.Event;
}

describe("Webhook Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset prisma.$transaction to execute callback immediately
    mockPrismaTransaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        return callback({
          transaction: {
            update: mockTransactionUpdate,
          },
          download: {
            upsert: mockDownloadUpsert,
          },
          downloadToken: {
            create: mockDownloadTokenCreate,
          },
        });
      }
    );
  });

  describe("Signature Verification", () => {
    it("returns 400 when stripe-signature header is missing", async () => {
      const request = createWebhookRequest("{}", null);

      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);
      const data = await parseResponse<WebhookResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing stripe-signature header");
    });

    it("returns 400 when signature verification fails", async () => {
      mockConstructWebhookEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const request = createWebhookRequest("{}", "invalid_signature");

      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);
      const data = await parseResponse<WebhookResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Webhook signature verification failed");
    });
  });

  describe("account.updated event", () => {
    const mockStripeAccount: Partial<Stripe.Account> = {
      id: "acct_test123",
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: true,
    };

    it("syncs Stripe status to database for existing user", async () => {
      const event = createMockStripeEvent("account.updated", mockStripeAccount);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockUserFindFirst.mockResolvedValue({
        id: "user-123",
        role: "BUYER",
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
        stripe_onboarding_complete: false,
      });
      mockUserUpdate.mockResolvedValue({});

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);
      const data = await parseResponse<WebhookResponse>(response);

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);

      // Verify user lookup
      expect(mockUserFindFirst).toHaveBeenCalledWith({
        where: { stripe_account_id: "acct_test123" },
        select: expect.objectContaining({
          id: true,
          role: true,
          stripe_charges_enabled: true,
          stripe_payouts_enabled: true,
          stripe_onboarding_complete: true,
        }),
      });

      // Verify user was updated with correct status and role upgrade
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          stripe_charges_enabled: true,
          stripe_payouts_enabled: true,
          stripe_onboarding_complete: true,
          role: "SELLER",
        },
      });
    });

    it("upgrades user role to SELLER when charges enabled and details submitted", async () => {
      const event = createMockStripeEvent("account.updated", mockStripeAccount);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockUserFindFirst.mockResolvedValue({
        id: "user-123",
        role: "BUYER",
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
        stripe_onboarding_complete: false,
      });
      mockUserUpdate.mockResolvedValue({});

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);

      expect(response.status).toBe(200);
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: expect.objectContaining({
          role: "SELLER",
        }),
      });
    });

    it("does not upgrade role if user is already SELLER", async () => {
      const event = createMockStripeEvent("account.updated", mockStripeAccount);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockUserFindFirst.mockResolvedValue({
        id: "user-123",
        role: "SELLER",
        stripe_charges_enabled: true,
        stripe_payouts_enabled: true,
        stripe_onboarding_complete: true,
      });

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);

      expect(response.status).toBe(200);
      // No update should be called since nothing changed
      expect(mockUserUpdate).not.toHaveBeenCalled();
    });

    it("does not upgrade role if charges not enabled", async () => {
      const incompleteAccount = {
        ...mockStripeAccount,
        charges_enabled: false,
      };
      const event = createMockStripeEvent("account.updated", incompleteAccount);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockUserFindFirst.mockResolvedValue({
        id: "user-123",
        role: "BUYER",
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
        stripe_onboarding_complete: false,
      });
      mockUserUpdate.mockResolvedValue({});

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);

      expect(response.status).toBe(200);
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: expect.not.objectContaining({
          role: "SELLER",
        }),
      });
    });

    it("handles missing user gracefully", async () => {
      const event = createMockStripeEvent("account.updated", mockStripeAccount);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockUserFindFirst.mockResolvedValue(null);

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);
      const data = await parseResponse<WebhookResponse>(response);

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(mockUserUpdate).not.toHaveBeenCalled();
    });

    it("handles undefined charges_enabled/payouts_enabled as false", async () => {
      const incompleteAccount = {
        id: "acct_test123",
        details_submitted: false,
        // charges_enabled and payouts_enabled not present
      };
      const event = createMockStripeEvent("account.updated", incompleteAccount);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockUserFindFirst.mockResolvedValue({
        id: "user-123",
        role: "BUYER",
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
        stripe_onboarding_complete: false,
      });

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);

      expect(response.status).toBe(200);
      // No update since nothing changed (all values still false)
      expect(mockUserUpdate).not.toHaveBeenCalled();
    });
  });

  describe("checkout.session.completed event", () => {
    const mockSession: Partial<Stripe.Checkout.Session> = {
      id: "cs_test123",
      payment_intent: "pi_test123",
      payment_status: "paid",
      payment_method_types: ["card"],
    };

    const mockTransaction = {
      id: "txn-123",
      buyer_id: "buyer-123",
      guest_email: null,
      resource_id: "material-123",
      amount: 1000,
      resource: {
        title: "Test Material",
      },
      buyer: {
        email: "buyer@example.com",
      },
    };

    it("updates transaction to COMPLETED for authenticated buyer", async () => {
      const event = createMockStripeEvent("checkout.session.completed", mockSession);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockTransactionFindFirst.mockResolvedValue(mockTransaction);
      mockTransactionUpdate.mockResolvedValue({});
      mockDownloadUpsert.mockResolvedValue({});

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);
      const data = await parseResponse<WebhookResponse>(response);

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);

      // Verify transaction lookup
      expect(mockTransactionFindFirst).toHaveBeenCalledWith({
        where: {
          stripe_checkout_session_id: "cs_test123",
          status: "PENDING",
        },
        select: expect.any(Object),
      });

      // Verify transaction was updated in the transaction callback
      expect(mockTransactionUpdate).toHaveBeenCalledWith({
        where: { id: "txn-123" },
        data: {
          status: "COMPLETED",
          stripe_payment_intent_id: "pi_test123",
          payment_method: "card",
        },
      });

      // Verify Download record was created
      expect(mockDownloadUpsert).toHaveBeenCalledWith({
        where: {
          user_id_resource_id: {
            user_id: "buyer-123",
            resource_id: "material-123",
          },
        },
        update: {},
        create: {
          user_id: "buyer-123",
          resource_id: "material-123",
        },
      });
    });

    it("sends purchase confirmation email to authenticated buyer", async () => {
      const event = createMockStripeEvent("checkout.session.completed", mockSession);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockTransactionFindFirst.mockResolvedValue(mockTransaction);
      mockTransactionUpdate.mockResolvedValue({});
      mockDownloadUpsert.mockResolvedValue({});
      mockSendPurchaseConfirmationEmail.mockResolvedValue({ success: true });

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      await webhookPOST(request as unknown as import("next/server").NextRequest);

      expect(mockSendPurchaseConfirmationEmail).toHaveBeenCalledWith({
        email: "buyer@example.com",
        resourceTitle: "Test Material",
        amount: 1000,
        downloadToken: undefined,
        isGuest: false,
        locale: "de",
      });
    });

    it("creates DownloadToken for guest checkout", async () => {
      const guestTransaction = {
        ...mockTransaction,
        buyer_id: null,
        guest_email: "guest@example.com",
        buyer: null,
      };
      const event = createMockStripeEvent("checkout.session.completed", mockSession);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockTransactionFindFirst.mockResolvedValue(guestTransaction);
      mockTransactionUpdate.mockResolvedValue({});
      mockDownloadTokenCreate.mockResolvedValue({});

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);

      expect(response.status).toBe(200);

      // Verify DownloadToken was created (not Download)
      expect(mockDownloadTokenCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          token: expect.any(String),
          max_downloads: 3,
          transaction_id: "txn-123",
        }),
      });
      expect(mockDownloadUpsert).not.toHaveBeenCalled();
    });

    it("sends email with download token for guest checkout", async () => {
      const guestTransaction = {
        ...mockTransaction,
        buyer_id: null,
        guest_email: "guest@example.com",
        buyer: null,
      };
      const event = createMockStripeEvent("checkout.session.completed", mockSession);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockTransactionFindFirst.mockResolvedValue(guestTransaction);
      mockTransactionUpdate.mockResolvedValue({});
      mockDownloadTokenCreate.mockResolvedValue({});
      mockSendPurchaseConfirmationEmail.mockResolvedValue({ success: true });

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      await webhookPOST(request as unknown as import("next/server").NextRequest);

      expect(mockSendPurchaseConfirmationEmail).toHaveBeenCalledWith({
        email: "guest@example.com",
        resourceTitle: "Test Material",
        amount: 1000,
        downloadToken: expect.any(String),
        isGuest: true,
        locale: "de",
      });
    });

    it("skips processing when payment_status is not paid", async () => {
      const unpaidSession = {
        ...mockSession,
        payment_status: "unpaid",
      };
      const event = createMockStripeEvent("checkout.session.completed", unpaidSession);
      mockConstructWebhookEvent.mockReturnValue(event);

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);

      expect(response.status).toBe(200);
      expect(mockTransactionFindFirst).not.toHaveBeenCalled();
    });

    it("handles missing transaction gracefully", async () => {
      const event = createMockStripeEvent("checkout.session.completed", mockSession);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockTransactionFindFirst.mockResolvedValue(null);

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);
      const data = await parseResponse<WebhookResponse>(response);

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(mockTransactionUpdate).not.toHaveBeenCalled();
    });

    it("handles payment_intent as object", async () => {
      const sessionWithObjectPaymentIntent = {
        ...mockSession,
        payment_intent: { id: "pi_object123" },
      };
      const event = createMockStripeEvent(
        "checkout.session.completed",
        sessionWithObjectPaymentIntent
      );
      mockConstructWebhookEvent.mockReturnValue(event);
      mockTransactionFindFirst.mockResolvedValue(mockTransaction);
      mockTransactionUpdate.mockResolvedValue({});
      mockDownloadUpsert.mockResolvedValue({});

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);

      expect(response.status).toBe(200);
      expect(mockTransactionUpdate).toHaveBeenCalledWith({
        where: { id: "txn-123" },
        data: expect.objectContaining({
          stripe_payment_intent_id: "pi_object123",
        }),
      });
    });
  });

  describe("payment_intent.payment_failed event", () => {
    const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
      id: "pi_failed123",
      metadata: {
        resourceId: "material-123",
        buyerId: "buyer-123",
      },
      last_payment_error: {
        message: "Your card was declined",
      } as Stripe.PaymentIntent.LastPaymentError,
    };

    it("marks transaction as FAILED for authenticated buyer", async () => {
      const event = createMockStripeEvent("payment_intent.payment_failed", mockPaymentIntent);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockTransactionFindFirst.mockResolvedValue({ id: "txn-123" });
      mockTransactionUpdate.mockResolvedValue({});

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);
      const data = await parseResponse<WebhookResponse>(response);

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);

      // Verify transaction lookup with buyer_id
      expect(mockTransactionFindFirst).toHaveBeenCalledWith({
        where: {
          buyer_id: "buyer-123",
          resource_id: "material-123",
          status: "PENDING",
        },
        select: { id: true },
      });

      // Verify transaction was marked as FAILED
      expect(mockTransactionUpdate).toHaveBeenCalledWith({
        where: { id: "txn-123" },
        data: {
          status: "FAILED",
          stripe_payment_intent_id: "pi_failed123",
        },
      });
    });

    it("marks transaction as FAILED for guest checkout", async () => {
      const guestPaymentIntent = {
        ...mockPaymentIntent,
        metadata: {
          resourceId: "material-123",
          guestEmail: "guest@example.com",
        },
      };
      const event = createMockStripeEvent("payment_intent.payment_failed", guestPaymentIntent);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockTransactionFindFirst.mockResolvedValue({ id: "txn-guest" });
      mockTransactionUpdate.mockResolvedValue({});

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);

      expect(response.status).toBe(200);

      // Verify transaction lookup with guest_email
      expect(mockTransactionFindFirst).toHaveBeenCalledWith({
        where: {
          guest_email: "guest@example.com",
          resource_id: "material-123",
          status: "PENDING",
        },
        select: { id: true },
      });
    });

    it("handles missing materialId in metadata", async () => {
      const incompletePaymentIntent = {
        id: "pi_failed123",
        metadata: {},
      };
      const event = createMockStripeEvent("payment_intent.payment_failed", incompletePaymentIntent);
      mockConstructWebhookEvent.mockReturnValue(event);

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);
      const data = await parseResponse<WebhookResponse>(response);

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(mockTransactionFindFirst).not.toHaveBeenCalled();
    });

    it("handles missing buyerId and guestEmail in metadata", async () => {
      const incompletePaymentIntent = {
        id: "pi_failed123",
        metadata: {
          materialId: "material-123",
        },
      };
      const event = createMockStripeEvent("payment_intent.payment_failed", incompletePaymentIntent);
      mockConstructWebhookEvent.mockReturnValue(event);

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);
      const data = await parseResponse<WebhookResponse>(response);

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(mockTransactionFindFirst).not.toHaveBeenCalled();
    });

    it("handles missing transaction gracefully", async () => {
      const event = createMockStripeEvent("payment_intent.payment_failed", mockPaymentIntent);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockTransactionFindFirst.mockResolvedValue(null);

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);
      const data = await parseResponse<WebhookResponse>(response);

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(mockTransactionUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Unhandled events", () => {
    it("returns 200 for unhandled event types", async () => {
      const event = createMockStripeEvent("customer.created", { id: "cus_test123" });
      mockConstructWebhookEvent.mockReturnValue(event);

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);
      const data = await parseResponse<WebhookResponse>(response);

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("returns 500 when handler throws an error", async () => {
      const event = createMockStripeEvent("account.updated", { id: "acct_test123" });
      mockConstructWebhookEvent.mockReturnValue(event);
      mockUserFindFirst.mockRejectedValue(new Error("Database connection error"));

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);
      const data = await parseResponse<WebhookResponse>(response);

      expect(response.status).toBe(500);
      expect(data.error).toBe("Webhook handler failed");
    });

    it("returns 500 when checkout handler throws an error", async () => {
      const mockSession = {
        id: "cs_test123",
        payment_intent: "pi_test123",
        payment_status: "paid",
      };
      const event = createMockStripeEvent("checkout.session.completed", mockSession);
      mockConstructWebhookEvent.mockReturnValue(event);
      mockTransactionFindFirst.mockRejectedValue(new Error("Database error"));

      const request = createWebhookRequest(JSON.stringify(event), "valid_signature");
      const response = await webhookPOST(request as unknown as import("next/server").NextRequest);
      const data = await parseResponse<WebhookResponse>(response);

      expect(response.status).toBe(500);
      expect(data.error).toBe("Webhook handler failed");
    });
  });
});
