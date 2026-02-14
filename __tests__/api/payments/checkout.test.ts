import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST as createCheckoutPOST } from "@/app/api/payments/create-checkout-session/route";
import { GET as getCheckoutSessionGET } from "@/app/api/payments/checkout-session/[sessionId]/route";
import { createMockRequest, parseResponse } from "../../helpers/api-test-utils";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock Stripe client
vi.mock("@/lib/stripe", () => ({
  getStripeClient: vi.fn(() => ({
    customers: {
      create: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  })),
  calculateApplicationFee: vi.fn((amount: number) => Math.round(amount * 0.3)),
}));

// Get mocked functions
const mockUserFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockUserUpdate = prisma.user.update as ReturnType<typeof vi.fn>;
const mockMaterialFindUnique = prisma.resource.findUnique as ReturnType<typeof vi.fn>;
const mockTransactionFindFirst = prisma.transaction.findFirst as ReturnType<typeof vi.fn>;
const mockTransactionCreate = prisma.transaction.create as ReturnType<typeof vi.fn>;
const mockAuth = auth as ReturnType<typeof vi.fn>;

// Import Stripe mocks after vi.mock
import { getStripeClient } from "@/lib/stripe";

const mockGetStripeClient = getStripeClient as any;

// Type definitions for responses
interface CreateCheckoutResponse {
  checkoutUrl?: string;
  sessionId?: string;
  error?: string;
  details?: Record<string, string[]>;
}

interface GetCheckoutSessionResponse {
  id?: string;
  amount?: number;
  amountFormatted?: string;
  status?: string;
  createdAt?: string;
  resource?: {
    id: string;
    title: string;
    description: string;
    subjects: string[];
    cycles: string[];
  };
  error?: string;
}

describe("Checkout Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Stripe mock
    mockGetStripeClient.mockReturnValue({
      customers: {
        create: vi.fn().mockResolvedValue({ id: "cus_test123" }),
      },
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: "cs_test123",
            url: "https://checkout.stripe.com/test",
          }),
        },
      },
    });
  });

  describe("POST /api/payments/create-checkout-session", () => {
    const mockMaterial = {
      id: "material-123",
      title: "Test Material",
      description: "A test material for teachers",
      price: 1000,
      is_published: true,
      is_approved: true,
      seller_id: "seller-123",
      seller: {
        id: "seller-123",
        stripe_account_id: "acct_seller123",
        stripe_charges_enabled: true,
      },
    };

    it("creates checkout session for authenticated user", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockUserFindUnique
        .mockResolvedValueOnce({ email: "buyer@example.com" })
        .mockResolvedValueOnce({
          id: "buyer-123",
          email: "buyer@example.com",
          stripe_customer_id: null,
        });
      mockMaterialFindUnique.mockResolvedValue(mockMaterial);
      mockTransactionFindFirst.mockResolvedValue(null);
      mockTransactionCreate.mockResolvedValue({ id: "txn-123" });
      mockUserUpdate.mockResolvedValue({});

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "material-123" },
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(200);
      expect(data.checkoutUrl).toBe("https://checkout.stripe.com/test");
      expect(data.sessionId).toBe("cs_test123");

      // Verify transaction was created
      expect(mockTransactionCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          buyer_id: "buyer-123",
          guest_email: null,
          resource_id: "material-123",
          amount: 1000,
          status: "PENDING",
          stripe_checkout_session_id: "cs_test123",
        }),
      });
    });

    it("creates checkout session for guest user with email", async () => {
      mockAuth.mockResolvedValue(null);
      mockMaterialFindUnique.mockResolvedValue(mockMaterial);
      mockTransactionFindFirst.mockResolvedValue(null);
      mockTransactionCreate.mockResolvedValue({ id: "txn-123" });

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "material-123", guestEmail: "guest@example.com" },
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(200);
      expect(data.checkoutUrl).toBe("https://checkout.stripe.com/test");

      // Verify transaction was created with guest email
      expect(mockTransactionCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          buyer_id: null,
          guest_email: "guest@example.com",
          resource_id: "material-123",
          status: "PENDING",
        }),
      });
    });

    it("reuses existing Stripe customer for authenticated user", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockUserFindUnique
        .mockResolvedValueOnce({ email: "buyer@example.com" })
        .mockResolvedValueOnce({
          id: "buyer-123",
          email: "buyer@example.com",
          stripe_customer_id: "cus_existing123",
        });
      mockMaterialFindUnique.mockResolvedValue(mockMaterial);
      mockTransactionFindFirst.mockResolvedValue(null);
      mockTransactionCreate.mockResolvedValue({ id: "txn-123" });

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "material-123" },
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(200);
      expect(data.checkoutUrl).toBeDefined();

      // Should NOT create a new customer
      const stripeClient = mockGetStripeClient();
      expect(stripeClient.customers.create).not.toHaveBeenCalled();
    });

    it("returns 401 when no auth and no guest email", async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "material-123" },
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(401);
      expect(data.error).toBe("Authentifizierung oder Gast-E-Mail erforderlich");
    });

    it("returns 400 when materialId is missing", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: {},
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Ungültige Eingabe");
    });

    it("returns 404 when material not found", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockUserFindUnique.mockResolvedValue({ email: "buyer@example.com" });
      mockMaterialFindUnique.mockResolvedValue(null);

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "nonexistent-material" },
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(404);
      expect(data.error).toBe("Material nicht gefunden");
    });

    it("returns 400 when material is not published", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockUserFindUnique.mockResolvedValue({ email: "buyer@example.com" });
      mockMaterialFindUnique.mockResolvedValue({
        ...mockMaterial,
        is_published: false,
      });

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "material-123" },
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Material ist nicht zum Kauf verfügbar");
    });

    it("returns 400 when material is not approved", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockUserFindUnique.mockResolvedValue({ email: "buyer@example.com" });
      mockMaterialFindUnique.mockResolvedValue({
        ...mockMaterial,
        is_approved: false,
      });

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "material-123" },
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Material ist nicht zum Kauf verfügbar");
    });

    it("returns 400 when trying to purchase own material", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "seller-123", email: "seller@example.com" },
      });
      mockUserFindUnique.mockResolvedValue({ email: "seller@example.com" });
      mockMaterialFindUnique.mockResolvedValue(mockMaterial);

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "material-123" },
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Eigenes Material kann nicht gekauft werden");
    });

    it("returns 400 when user already owns the material", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockUserFindUnique.mockResolvedValue({ email: "buyer@example.com" });
      mockMaterialFindUnique.mockResolvedValue(mockMaterial);
      mockTransactionFindFirst.mockResolvedValue({
        id: "existing-txn",
        status: "COMPLETED",
      });

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "material-123" },
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Sie besitzen dieses Material bereits");
    });

    it("returns 400 when seller cannot receive payments", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockUserFindUnique.mockResolvedValue({ email: "buyer@example.com" });
      mockMaterialFindUnique.mockResolvedValue({
        ...mockMaterial,
        seller: {
          id: "seller-123",
          stripe_account_id: null,
          stripe_charges_enabled: false,
        },
      });
      mockTransactionFindFirst.mockResolvedValue(null);

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "material-123" },
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Der Verkäufer kann derzeit keine Zahlungen empfangen");
    });

    it("returns 400 for free materials", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockUserFindUnique.mockResolvedValue({ email: "buyer@example.com" });
      mockMaterialFindUnique.mockResolvedValue({
        ...mockMaterial,
        price: 0,
      });
      mockTransactionFindFirst.mockResolvedValue(null);

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "material-123" },
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Kostenlose Materialien benötigen keinen Checkout");
    });

    it("returns 400 for invalid JSON body", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });

      // Create request with invalid JSON
      const request = new Request("http://localhost:3000/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json{",
      });

      const response = await createCheckoutPOST(
        request as unknown as import("next/server").NextRequest
      );
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Ungültiger JSON-Body");
    });

    it("returns 404 when authenticated user not found", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "nonexistent-123", email: "nonexistent@example.com" },
      });
      mockUserFindUnique.mockResolvedValue(null);

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "material-123" },
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      expect(response.status).toBe(404);
      expect(data.error).toBe("Not found");
    });

    it("handles Stripe API error gracefully", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockUserFindUnique
        .mockResolvedValueOnce({ email: "buyer@example.com" })
        .mockResolvedValueOnce({
          id: "buyer-123",
          email: "buyer@example.com",
          stripe_customer_id: null,
        });
      mockMaterialFindUnique.mockResolvedValue(mockMaterial);
      mockTransactionFindFirst.mockResolvedValue(null);

      // Mock Stripe to throw an error
      mockGetStripeClient.mockReturnValue({
        customers: {
          create: vi.fn().mockRejectedValue(new Error("Stripe API error")),
        },
        checkout: {
          sessions: {
            create: vi.fn(),
          },
        },
      });

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "material-123" },
      });

      const response = await createCheckoutPOST(request);
      const data = await parseResponse<CreateCheckoutResponse>(response);

      // API returns 503 for Stripe service errors, 500 for other errors
      expect([500, 503]).toContain(response.status);
      expect(data.error).toBeDefined();
    });

    it("calculates correct platform fee (30%)", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockUserFindUnique
        .mockResolvedValueOnce({ email: "buyer@example.com" })
        .mockResolvedValueOnce({
          id: "buyer-123",
          email: "buyer@example.com",
          stripe_customer_id: "cus_existing123",
        });
      mockMaterialFindUnique.mockResolvedValue({
        ...mockMaterial,
        price: 1000, // CHF 10.00
      });
      mockTransactionFindFirst.mockResolvedValue(null);
      mockTransactionCreate.mockResolvedValue({ id: "txn-123" });

      const request = createMockRequest("/api/payments/create-checkout-session", {
        method: "POST",
        body: { materialId: "material-123" },
      });

      const response = await createCheckoutPOST(request);

      expect(response.status).toBe(200);

      // Verify transaction has correct fee calculation
      expect(mockTransactionCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 1000,
          platform_fee_amount: 300, // 30% of 1000
          seller_payout_amount: 700, // 1000 - 300
        }),
      });
    });
  });

  describe("GET /api/payments/checkout-session/[sessionId]", () => {
    it("returns transaction info for authenticated buyer", async () => {
      const createdAt = new Date("2024-01-15T10:00:00Z");
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockTransactionFindFirst.mockResolvedValue({
        id: "txn-123",
        amount: 1000,
        status: "COMPLETED",
        created_at: createdAt,
        resource: {
          id: "resource-123",
          title: "Test Resource",
          description: "A test resource for teachers",
          subjects: ["math"],
          cycles: ["cycle1"],
          preview_url: "/preview.jpg",
          seller: {
            id: "seller-123",
            name: "Test Seller",
            display_name: "Test Seller",
            image: null,
          },
        },
      });

      const request = createMockRequest("/api/payments/checkout-session/cs_test123");
      const response = await getCheckoutSessionGET(request, {
        params: Promise.resolve({ sessionId: "cs_test123" }),
      });
      const data = await parseResponse<GetCheckoutSessionResponse>(response);

      expect(response.status).toBe(200);
      expect(data.id).toBe("txn-123");
      expect(data.amount).toBe(1000);
      expect(data.amountFormatted).toBe("CHF 10.00");
      expect(data.status).toBe("COMPLETED");
      expect(data.createdAt).toBe(createdAt.toISOString());
      expect(data.resource?.title).toBe("Test Resource");

      // Verify lookup was done with correct user ID
      expect(mockTransactionFindFirst).toHaveBeenCalledWith({
        where: {
          stripe_checkout_session_id: "cs_test123",
          buyer_id: "buyer-123",
        },
        select: expect.any(Object),
      });
    });

    it("formats free materials correctly", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockTransactionFindFirst.mockResolvedValue({
        id: "txn-123",
        amount: 0,
        status: "COMPLETED",
        created_at: new Date(),
        resource: {
          id: "resource-123",
          title: "Free Resource",
          description: "A free test resource",
          subjects: [],
          cycles: [],
          preview_url: null,
          seller: {
            id: "seller-123",
            name: "Test Seller",
            display_name: "Test Seller",
            image: null,
          },
        },
      });

      const request = createMockRequest("/api/payments/checkout-session/cs_test123");
      const response = await getCheckoutSessionGET(request, {
        params: Promise.resolve({ sessionId: "cs_test123" }),
      });
      const data = await parseResponse<GetCheckoutSessionResponse>(response);

      expect(response.status).toBe(200);
      expect(data.amountFormatted).toBe("Kostenlos");
    });

    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest("/api/payments/checkout-session/cs_test123");
      const response = await getCheckoutSessionGET(request, {
        params: Promise.resolve({ sessionId: "cs_test123" }),
      });
      const data = await parseResponse<GetCheckoutSessionResponse>(response);

      expect(response.status).toBe(401);
      expect(data.error).toBe("Authentifizierung erforderlich");
    });

    it("returns 400 when session ID is missing", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });

      const request = createMockRequest("/api/payments/checkout-session/");
      const response = await getCheckoutSessionGET(request, {
        params: Promise.resolve({ sessionId: "" }),
      });
      const data = await parseResponse<GetCheckoutSessionResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Session-ID ist erforderlich");
    });

    it("returns 404 when transaction not found", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockTransactionFindFirst.mockResolvedValue(null);

      const request = createMockRequest("/api/payments/checkout-session/cs_unknown");
      const response = await getCheckoutSessionGET(request, {
        params: Promise.resolve({ sessionId: "cs_unknown" }),
      });
      const data = await parseResponse<GetCheckoutSessionResponse>(response);

      expect(response.status).toBe(404);
      expect(data.error).toBe("Transaktion nicht gefunden");
    });

    it("returns 404 when transaction belongs to different user", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "other-user-123", email: "other@example.com" },
      });
      // Transaction not found because buyer_id doesn't match
      mockTransactionFindFirst.mockResolvedValue(null);

      const request = createMockRequest("/api/payments/checkout-session/cs_test123");
      const response = await getCheckoutSessionGET(request, {
        params: Promise.resolve({ sessionId: "cs_test123" }),
      });
      const data = await parseResponse<GetCheckoutSessionResponse>(response);

      expect(response.status).toBe(404);
      expect(data.error).toBe("Transaktion nicht gefunden");
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "buyer-123", email: "buyer@example.com" },
      });
      mockTransactionFindFirst.mockRejectedValue(new Error("Database error"));

      const request = createMockRequest("/api/payments/checkout-session/cs_test123");
      const response = await getCheckoutSessionGET(request, {
        params: Promise.resolve({ sessionId: "cs_test123" }),
      });
      const data = await parseResponse<GetCheckoutSessionResponse>(response);

      expect(response.status).toBe(500);
      expect(data.error).toBe("Fehler beim Laden der Checkout-Session");
    });
  });
});
