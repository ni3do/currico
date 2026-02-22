import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/materials/[id]/reviews/route";
import {
  createMockRequest,
  createRouteParams,
  parseResponse,
  mockAuthenticated,
} from "../../helpers/api-test-utils";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { clearAllRateLimits } from "@/lib/rateLimit";

// Mock notifications
vi.mock("@/lib/notifications", () => ({
  notifyReview: vi.fn(),
}));

// Mock verified-seller
vi.mock("@/lib/utils/verified-seller", () => ({
  checkAndUpdateVerification: vi.fn().mockResolvedValue(undefined),
}));

const mockGetCurrentUserId = getCurrentUserId as ReturnType<typeof vi.fn>;
const mockResourceFindUnique = prisma.resource.findUnique as ReturnType<typeof vi.fn>;
const mockTransactionFindFirst = prisma.transaction.findFirst as ReturnType<typeof vi.fn>;
const mockDownloadFindFirst = prisma.download.findFirst as ReturnType<typeof vi.fn>;
const mockReviewFindUnique = (
  prisma as unknown as { review: { findUnique: ReturnType<typeof vi.fn> } }
).review.findUnique;
const mockReviewCreate = (prisma as unknown as { review: { create: ReturnType<typeof vi.fn> } })
  .review.create;

const validId = "cm1234567890abcdefghijklmn";

describe("POST /api/materials/[id]/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllRateLimits();
    mockGetCurrentUserId.mockResolvedValue(null);
  });

  it("returns 401 when not authenticated", async () => {
    const request = createMockRequest(`/api/materials/${validId}/reviews`, {
      method: "POST",
      body: { rating: 5 },
    });

    // POST in reviews uses Request not NextRequest
    const response = await POST(request as unknown as Request, createRouteParams({ id: validId }));
    expect(response.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue(null);

    // Exhaust rate limit (5 requests for materials:review)
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest(`/api/materials/${validId}/reviews`, {
        method: "POST",
        body: { rating: 5 },
      });
      await POST(req as unknown as Request, createRouteParams({ id: validId }));
    }

    const request = createMockRequest(`/api/materials/${validId}/reviews`, {
      method: "POST",
      body: { rating: 5 },
    });
    const response = await POST(request as unknown as Request, createRouteParams({ id: validId }));
    expect(response.status).toBe(429);
  });

  it("returns 404 when material not found", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue(null);

    const request = createMockRequest(`/api/materials/${validId}/reviews`, {
      method: "POST",
      body: { rating: 5 },
    });
    const response = await POST(request as unknown as Request, createRouteParams({ id: validId }));
    expect(response.status).toBe(404);
  });

  it("returns 403 when reviewing own material", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue({
      id: validId,
      seller_id: "user-1",
      title: "My Material",
    });

    const request = createMockRequest(`/api/materials/${validId}/reviews`, {
      method: "POST",
      body: { rating: 5 },
    });
    const response = await POST(request as unknown as Request, createRouteParams({ id: validId }));
    const data = await parseResponse<{ code: string }>(response);

    expect(response.status).toBe(403);
    expect(data.code).toBe("CANNOT_REVIEW_OWN");
  });

  it("returns 403 when user hasn't purchased/downloaded", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue({
      id: validId,
      seller_id: "seller-1",
      title: "Material",
    });
    mockTransactionFindFirst.mockResolvedValue(null);
    mockDownloadFindFirst.mockResolvedValue(null);

    const request = createMockRequest(`/api/materials/${validId}/reviews`, {
      method: "POST",
      body: { rating: 5 },
    });
    const response = await POST(request as unknown as Request, createRouteParams({ id: validId }));
    const data = await parseResponse<{ code: string }>(response);

    expect(response.status).toBe(403);
    expect(data.code).toBe("MUST_PURCHASE_TO_REVIEW");
  });

  it("returns 400 when already reviewed", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue({
      id: validId,
      seller_id: "seller-1",
      title: "Material",
    });
    mockTransactionFindFirst.mockResolvedValue({ id: "tx-1" });
    mockDownloadFindFirst.mockResolvedValue(null);
    mockReviewFindUnique.mockResolvedValue({ id: "review-1" });

    const request = createMockRequest(`/api/materials/${validId}/reviews`, {
      method: "POST",
      body: { rating: 5 },
    });
    const response = await POST(request as unknown as Request, createRouteParams({ id: validId }));
    const data = await parseResponse<{ code: string }>(response);

    expect(response.status).toBe(400);
    expect(data.code).toBe("ALREADY_REVIEWED");
  });

  it("returns 400 for invalid input (rating out of range)", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue({
      id: validId,
      seller_id: "seller-1",
      title: "Material",
    });
    mockTransactionFindFirst.mockResolvedValue({ id: "tx-1" });
    mockDownloadFindFirst.mockResolvedValue(null);
    mockReviewFindUnique.mockResolvedValue(null);

    const request = createMockRequest(`/api/materials/${validId}/reviews`, {
      method: "POST",
      body: { rating: 10 },
    });
    const response = await POST(request as unknown as Request, createRouteParams({ id: validId }));

    expect(response.status).toBe(400);
  });

  it("returns 200 and creates review successfully", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue({
      id: validId,
      seller_id: "seller-1",
      title: "Great Material",
    });
    mockTransactionFindFirst.mockResolvedValue({ id: "tx-1" });
    mockDownloadFindFirst.mockResolvedValue(null);
    mockReviewFindUnique.mockResolvedValue(null);
    mockReviewCreate.mockResolvedValue({
      id: "review-1",
      rating: 5,
      title: "Amazing",
      content: "Very helpful",
      created_at: new Date(),
      user_id: "user-1",
      user: {
        id: "user-1",
        display_name: "Teacher",
        name: "Teacher Name",
        image: null,
      },
    });

    const request = createMockRequest(`/api/materials/${validId}/reviews`, {
      method: "POST",
      body: { rating: 5, title: "Amazing", content: "Very helpful" },
    });
    const response = await POST(request as unknown as Request, createRouteParams({ id: validId }));
    const data = await parseResponse<{ review: { id: string; rating: number }; message: string }>(
      response
    );

    expect(response.status).toBe(200);
    expect(data.review.rating).toBe(5);
    expect(data.message).toBe("Review created");
  });

  it("creates review with minimum fields (rating only)", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue({
      id: validId,
      seller_id: "seller-1",
      title: "Material",
    });
    mockTransactionFindFirst.mockResolvedValue({ id: "tx-1" });
    mockDownloadFindFirst.mockResolvedValue(null);
    mockReviewFindUnique.mockResolvedValue(null);
    mockReviewCreate.mockResolvedValue({
      id: "review-2",
      rating: 3,
      title: null,
      content: null,
      created_at: new Date(),
      user_id: "user-1",
      user: {
        id: "user-1",
        display_name: null,
        name: "Anon",
        image: null,
      },
    });

    const request = createMockRequest(`/api/materials/${validId}/reviews`, {
      method: "POST",
      body: { rating: 3 },
    });
    const response = await POST(request as unknown as Request, createRouteParams({ id: validId }));

    expect(response.status).toBe(200);
  });
});
