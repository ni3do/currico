import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  POST as acceptTermsPOST,
  GET as acceptTermsGET,
} from "@/app/api/seller/accept-terms/route";
import { POST as connectPOST } from "@/app/api/seller/connect/route";
import { GET as connectStatusGET } from "@/app/api/seller/connect/status/route";
import { createMockRequest, parseResponse } from "../../helpers/api-test-utils";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

// Mock Stripe functions
vi.mock("@/lib/stripe", () => ({
  createConnectAccount: vi.fn(),
  createAccountOnboardingLink: vi.fn(),
  getConnectAccount: vi.fn(),
  createExpressDashboardLink: vi.fn(),
}));

// Get mocked functions
const mockUserFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockUserUpdate = prisma.user.update as ReturnType<typeof vi.fn>;
const mockGetCurrentUserId = getCurrentUserId as ReturnType<typeof vi.fn>;

// Import Stripe mocks after vi.mock
import {
  createConnectAccount,
  createAccountOnboardingLink,
  getConnectAccount,
  createExpressDashboardLink,
} from "@/lib/stripe";

const mockCreateConnectAccount = createConnectAccount as ReturnType<typeof vi.fn>;
const mockCreateAccountOnboardingLink = createAccountOnboardingLink as ReturnType<typeof vi.fn>;
const mockGetConnectAccount = getConnectAccount as ReturnType<typeof vi.fn>;
const mockCreateExpressDashboardLink = createExpressDashboardLink as ReturnType<typeof vi.fn>;

// Type definitions for responses
interface AcceptTermsResponse {
  success?: boolean;
  alreadyAccepted?: boolean;
  acceptedAt?: string;
  accepted?: boolean;
  error?: string;
}

interface ConnectResponse {
  success?: boolean;
  url?: string;
  stripeAccountId?: string;
  error?: string;
}

interface ConnectStatusResponse {
  hasAccount: boolean;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingComplete: boolean;
  termsAccepted: boolean;
  role: string;
  dashboardUrl: string | null;
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
  } | null;
  error?: string;
}

describe("Seller Onboarding Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/seller/accept-terms", () => {
    it("successfully accepts terms for verified user", async () => {
      const acceptedAt = new Date();
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        emailVerified: new Date("2024-01-01"),
        seller_terms_accepted_at: null,
      });
      mockUserUpdate.mockResolvedValue({
        seller_terms_accepted_at: acceptedAt,
      });

      const request = createMockRequest("/api/seller/accept-terms", {
        method: "POST",
      });

      const response = await acceptTermsPOST();
      const data = await parseResponse<AcceptTermsResponse>(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alreadyAccepted).toBe(false);
      expect(data.acceptedAt).toBeDefined();
    });

    it("returns alreadyAccepted=true if terms already accepted", async () => {
      const acceptedAt = new Date("2024-01-15");
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        emailVerified: new Date("2024-01-01"),
        seller_terms_accepted_at: acceptedAt,
      });

      const response = await acceptTermsPOST();
      const data = await parseResponse<AcceptTermsResponse>(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alreadyAccepted).toBe(true);
      expect(data.acceptedAt).toBe(acceptedAt.toISOString());
      // Should not call update if already accepted
      expect(mockUserUpdate).not.toHaveBeenCalled();
    });

    it("returns 401 when not authenticated", async () => {
      mockGetCurrentUserId.mockResolvedValue(null);

      const response = await acceptTermsPOST();
      const data = await parseResponse<AcceptTermsResponse>(response);

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 400 when email not verified", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        emailVerified: null,
        seller_terms_accepted_at: null,
      });

      const response = await acceptTermsPOST();
      const data = await parseResponse<AcceptTermsResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Email verification required");
    });

    it("returns 404 when user not found", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue(null);

      const response = await acceptTermsPOST();
      const data = await parseResponse<AcceptTermsResponse>(response);

      expect(response.status).toBe(404);
      expect(data.error).toBe("Not found");
    });

    it("returns 500 on database error", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        emailVerified: new Date("2024-01-01"),
        seller_terms_accepted_at: null,
      });
      mockUserUpdate.mockRejectedValue(new Error("Database error"));

      const response = await acceptTermsPOST();
      const data = await parseResponse<AcceptTermsResponse>(response);

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("GET /api/seller/accept-terms", () => {
    it("returns accepted status when terms were accepted", async () => {
      const acceptedAt = new Date("2024-01-15");
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        seller_terms_accepted_at: acceptedAt,
      });

      const response = await acceptTermsGET();
      const data = await parseResponse<AcceptTermsResponse>(response);

      expect(response.status).toBe(200);
      expect(data.accepted).toBe(true);
      expect(data.acceptedAt).toBe(acceptedAt.toISOString());
    });

    it("returns accepted=false when terms not yet accepted", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        seller_terms_accepted_at: null,
      });

      const response = await acceptTermsGET();
      const data = await parseResponse<AcceptTermsResponse>(response);

      expect(response.status).toBe(200);
      expect(data.accepted).toBe(false);
      expect(data.acceptedAt).toBeNull();
    });

    it("returns 401 when not authenticated", async () => {
      mockGetCurrentUserId.mockResolvedValue(null);

      const response = await acceptTermsGET();
      const data = await parseResponse<AcceptTermsResponse>(response);

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 404 when user not found", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue(null);

      const response = await acceptTermsGET();
      const data = await parseResponse<AcceptTermsResponse>(response);

      expect(response.status).toBe(404);
      expect(data.error).toBe("Not found");
    });
  });

  describe("POST /api/seller/connect", () => {
    it("creates Stripe account and returns onboarding link", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        email: "test@example.com",
        emailVerified: new Date("2024-01-01"),
        seller_terms_accepted_at: new Date("2024-01-15"),
        stripe_account_id: null,
        display_name: "Test User",
        name: "Test",
      });
      mockCreateConnectAccount.mockResolvedValue({
        id: "acct_test123",
      });
      mockCreateAccountOnboardingLink.mockResolvedValue({
        url: "https://connect.stripe.com/setup/test",
      });
      mockUserUpdate.mockResolvedValue({});

      const request = createMockRequest("/api/seller/connect", {
        method: "POST",
        headers: {
          "x-forwarded-proto": "https",
          host: "example.com",
        },
      });

      const response = await connectPOST(request);
      const data = await parseResponse<ConnectResponse>(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.url).toBe("https://connect.stripe.com/setup/test");
      expect(data.stripeAccountId).toBe("acct_test123");

      // Verify Stripe account was created with correct metadata and display name
      expect(mockCreateConnectAccount).toHaveBeenCalledWith(
        "test@example.com",
        { user_id: "user-123" },
        "Test User"
      );

      // Verify account ID was saved to user
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { stripe_account_id: "acct_test123" },
      });
    });

    it("reuses existing Stripe account if user already has one", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        email: "test@example.com",
        emailVerified: new Date("2024-01-01"),
        seller_terms_accepted_at: new Date("2024-01-15"),
        stripe_account_id: "acct_existing123",
      });
      mockCreateAccountOnboardingLink.mockResolvedValue({
        url: "https://connect.stripe.com/setup/existing",
      });

      const request = createMockRequest("/api/seller/connect", {
        method: "POST",
        headers: {
          "x-forwarded-proto": "https",
          host: "example.com",
        },
      });

      const response = await connectPOST(request);
      const data = await parseResponse<ConnectResponse>(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.stripeAccountId).toBe("acct_existing123");

      // Should NOT create a new account
      expect(mockCreateConnectAccount).not.toHaveBeenCalled();
      // Should NOT update user
      expect(mockUserUpdate).not.toHaveBeenCalled();
    });

    it("returns 401 when not authenticated", async () => {
      mockGetCurrentUserId.mockResolvedValue(null);

      const request = createMockRequest("/api/seller/connect", {
        method: "POST",
      });

      const response = await connectPOST(request);
      const data = await parseResponse<ConnectResponse>(response);

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 400 when email not verified", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        email: "test@example.com",
        emailVerified: null,
        seller_terms_accepted_at: new Date("2024-01-15"),
        stripe_account_id: null,
      });

      const request = createMockRequest("/api/seller/connect", {
        method: "POST",
      });

      const response = await connectPOST(request);
      const data = await parseResponse<ConnectResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Email verification required");
    });

    it("returns 400 when terms not accepted", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        email: "test@example.com",
        emailVerified: new Date("2024-01-01"),
        seller_terms_accepted_at: null,
        stripe_account_id: null,
      });

      const request = createMockRequest("/api/seller/connect", {
        method: "POST",
      });

      const response = await connectPOST(request);
      const data = await parseResponse<ConnectResponse>(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe("Seller terms required");
    });

    it("returns 404 when user not found", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue(null);

      const request = createMockRequest("/api/seller/connect", {
        method: "POST",
      });

      const response = await connectPOST(request);
      const data = await parseResponse<ConnectResponse>(response);

      expect(response.status).toBe(404);
      expect(data.error).toBe("Not found");
    });

    it("returns 500 on Stripe account creation error", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        email: "test@example.com",
        emailVerified: new Date("2024-01-01"),
        seller_terms_accepted_at: new Date("2024-01-15"),
        stripe_account_id: null,
      });
      mockCreateConnectAccount.mockRejectedValue(new Error("Stripe API error"));

      const request = createMockRequest("/api/seller/connect", {
        method: "POST",
      });

      const response = await connectPOST(request);
      const data = await parseResponse<ConnectResponse>(response);

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("GET /api/seller/connect/status", () => {
    it("returns full status for seller with completed onboarding", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        stripe_account_id: "acct_test123",
        stripe_onboarding_complete: true,
        stripe_charges_enabled: true,
        stripe_payouts_enabled: true,
        seller_terms_accepted_at: new Date("2024-01-15"),
        role: "SELLER",
      });
      mockGetConnectAccount.mockResolvedValue({
        id: "acct_test123",
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
        requirements: {
          currently_due: [],
          eventually_due: [],
          past_due: [],
          pending_verification: [],
        },
      });
      mockCreateExpressDashboardLink.mockResolvedValue({
        url: "https://dashboard.stripe.com/test",
      });

      const response = await connectStatusGET();
      const data = await parseResponse<ConnectStatusResponse>(response);

      expect(response.status).toBe(200);
      expect(data.hasAccount).toBe(true);
      expect(data.accountId).toBe("acct_test123");
      expect(data.chargesEnabled).toBe(true);
      expect(data.payoutsEnabled).toBe(true);
      expect(data.detailsSubmitted).toBe(true);
      expect(data.onboardingComplete).toBe(true);
      expect(data.termsAccepted).toBe(true);
      expect(data.role).toBe("SELLER");
      expect(data.dashboardUrl).toBe("https://dashboard.stripe.com/test");
      expect(data.requirements).toEqual({
        currentlyDue: [],
        eventuallyDue: [],
        pastDue: [],
        pendingVerification: [],
      });
    });

    it("returns minimal status when user has no Stripe account", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        stripe_account_id: null,
        stripe_onboarding_complete: false,
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
        seller_terms_accepted_at: null,
        role: "BUYER",
      });

      const response = await connectStatusGET();
      const data = await parseResponse<ConnectStatusResponse>(response);

      expect(response.status).toBe(200);
      expect(data.hasAccount).toBe(false);
      expect(data.accountId).toBeNull();
      expect(data.chargesEnabled).toBe(false);
      expect(data.payoutsEnabled).toBe(false);
      expect(data.termsAccepted).toBe(false);
      expect(data.role).toBe("BUYER");
      expect(data.dashboardUrl).toBeNull();

      // Should NOT call Stripe API
      expect(mockGetConnectAccount).not.toHaveBeenCalled();
    });

    it("syncs status to database when Stripe status differs", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        stripe_account_id: "acct_test123",
        stripe_onboarding_complete: false,
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
        seller_terms_accepted_at: new Date("2024-01-15"),
        role: "BUYER",
      });
      // Stripe returns different status (onboarding completed)
      mockGetConnectAccount.mockResolvedValue({
        id: "acct_test123",
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
        requirements: null,
      });
      mockCreateExpressDashboardLink.mockResolvedValue({
        url: "https://dashboard.stripe.com/test",
      });
      mockUserUpdate.mockResolvedValue({});

      const response = await connectStatusGET();
      const data = await parseResponse<ConnectStatusResponse>(response);

      expect(response.status).toBe(200);
      expect(data.chargesEnabled).toBe(true);
      expect(data.payoutsEnabled).toBe(true);

      // Verify database was updated with new status
      // Role is also upgraded to SELLER when onboarding completes for BUYER users
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

    it("returns cached data when Stripe API fails", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        stripe_account_id: "acct_test123",
        stripe_onboarding_complete: true,
        stripe_charges_enabled: true,
        stripe_payouts_enabled: true,
        seller_terms_accepted_at: new Date("2024-01-15"),
        role: "SELLER",
      });
      mockGetConnectAccount.mockRejectedValue(new Error("Stripe API error"));

      const response = await connectStatusGET();
      const data = await parseResponse<ConnectStatusResponse>(response);

      expect(response.status).toBe(200);
      expect(data.hasAccount).toBe(true);
      expect(data.chargesEnabled).toBe(true);
      expect(data.payoutsEnabled).toBe(true);
      expect(data.error).toBe("Stripe-Status konnte nicht abgerufen werden");
      expect(data.dashboardUrl).toBeNull();
    });

    it("does not return dashboard link when charges not enabled", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue({
        stripe_account_id: "acct_test123",
        stripe_onboarding_complete: false,
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
        seller_terms_accepted_at: new Date("2024-01-15"),
        role: "BUYER",
      });
      mockGetConnectAccount.mockResolvedValue({
        id: "acct_test123",
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
        requirements: {
          currently_due: ["business_profile.url"],
          eventually_due: [],
          past_due: [],
          pending_verification: [],
        },
      });

      const response = await connectStatusGET();
      const data = await parseResponse<ConnectStatusResponse>(response);

      expect(response.status).toBe(200);
      expect(data.chargesEnabled).toBe(false);
      expect(data.dashboardUrl).toBeNull();

      // Should NOT call createExpressDashboardLink
      expect(mockCreateExpressDashboardLink).not.toHaveBeenCalled();
    });

    it("returns 401 when not authenticated", async () => {
      mockGetCurrentUserId.mockResolvedValue(null);

      const response = await connectStatusGET();
      const data = await parseResponse<ConnectStatusResponse>(response);

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 404 when user not found", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-123");
      mockUserFindUnique.mockResolvedValue(null);

      const response = await connectStatusGET();
      const data = await parseResponse<ConnectStatusResponse>(response);

      expect(response.status).toBe(404);
      expect(data.error).toBe("Not found");
    });
  });
});
