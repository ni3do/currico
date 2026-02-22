import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/auth/reset-password/route";
import { createMockRequest, parseResponse } from "../../helpers/api-test-utils";
import { prisma } from "@/lib/db";
import { clearAllRateLimits } from "@/lib/rateLimit";

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("new_hashed_password"),
  },
}));

const mockPasswordResetTokenFindUnique = (
  prisma as unknown as { passwordResetToken: { findUnique: ReturnType<typeof vi.fn> } }
).passwordResetToken.findUnique;
const mockPasswordResetTokenDelete = (
  prisma as unknown as { passwordResetToken: { delete: ReturnType<typeof vi.fn> } }
).passwordResetToken.delete;
const mockTransaction = prisma.$transaction as ReturnType<typeof vi.fn>;

const validToken = "a".repeat(32);

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllRateLimits();
  });

  it("returns 429 when rate limited", async () => {
    mockPasswordResetTokenFindUnique.mockResolvedValue(null);

    // Exhaust rate limit (5 requests)
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest("/api/auth/reset-password", {
        method: "POST",
        body: { token: validToken, password: "NewPassword1" },
        headers: { "x-forwarded-for": "10.0.0.60" },
      });
      await POST(req);
    }

    const request = createMockRequest("/api/auth/reset-password", {
      method: "POST",
      body: { token: validToken, password: "NewPassword1" },
      headers: { "x-forwarded-for": "10.0.0.60" },
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid input (short token)", async () => {
    const request = createMockRequest("/api/auth/reset-password", {
      method: "POST",
      body: { token: "short", password: "NewPassword1" },
    });

    const response = await POST(request);
    const data = await parseResponse<{ code: string }>(response);

    expect(response.status).toBe(400);
    expect(data.code).toBe("INVALID_INPUT");
  });

  it("returns 400 for invalid input (weak password)", async () => {
    const request = createMockRequest("/api/auth/reset-password", {
      method: "POST",
      body: { token: validToken, password: "weak" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when token not found", async () => {
    mockPasswordResetTokenFindUnique.mockResolvedValue(null);

    const request = createMockRequest("/api/auth/reset-password", {
      method: "POST",
      body: { token: validToken, password: "NewPassword1" },
    });

    const response = await POST(request);
    const data = await parseResponse<{ code: string }>(response);

    expect(response.status).toBe(400);
    expect(data.code).toBe("INVALID_OR_EXPIRED_TOKEN");
  });

  it("returns 400 for expired token and cleans it up", async () => {
    const expiredDate = new Date(Date.now() - 3600 * 1000); // 1 hour ago
    mockPasswordResetTokenFindUnique.mockResolvedValue({
      id: "token-1",
      user_id: "user-1",
      expires: expiredDate,
    });
    mockPasswordResetTokenDelete.mockResolvedValue({});

    const request = createMockRequest("/api/auth/reset-password", {
      method: "POST",
      body: { token: validToken, password: "NewPassword1" },
    });

    const response = await POST(request);
    const data = await parseResponse<{ code: string }>(response);

    expect(response.status).toBe(400);
    expect(data.code).toBe("INVALID_OR_EXPIRED_TOKEN");
    expect(mockPasswordResetTokenDelete).toHaveBeenCalledWith({
      where: { id: "token-1" },
    });
  });

  it("returns 200 on successful password reset with transaction", async () => {
    const futureDate = new Date(Date.now() + 3600 * 1000); // 1 hour ahead
    mockPasswordResetTokenFindUnique.mockResolvedValue({
      id: "token-1",
      user_id: "user-1",
      expires: futureDate,
    });
    // Array-style $transaction returns the array
    mockTransaction.mockResolvedValue([{}, { count: 1 }]);

    const request = createMockRequest("/api/auth/reset-password", {
      method: "POST",
      body: { token: validToken, password: "NewPassword1" },
    });

    const response = await POST(request);
    const data = await parseResponse<{ message: string }>(response);

    expect(response.status).toBe(200);
    expect(data.message).toBe("Password reset successfully");
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("returns 500 on unexpected error", async () => {
    mockPasswordResetTokenFindUnique.mockRejectedValue(new Error("DB error"));

    const request = createMockRequest("/api/auth/reset-password", {
      method: "POST",
      body: { token: validToken, password: "NewPassword1" },
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
