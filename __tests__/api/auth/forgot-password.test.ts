import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/auth/forgot-password/route";
import { createMockRequest, parseResponse } from "../../helpers/api-test-utils";
import { prisma } from "@/lib/db";
import { clearAllRateLimits } from "@/lib/rateLimit";

// Mock email module
vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

import { sendPasswordResetEmail } from "@/lib/email";

const mockUserFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockPasswordResetTokenDeleteMany = (
  prisma as unknown as { passwordResetToken: { deleteMany: ReturnType<typeof vi.fn> } }
).passwordResetToken.deleteMany;
const mockPasswordResetTokenCreate = (
  prisma as unknown as { passwordResetToken: { create: ReturnType<typeof vi.fn> } }
).passwordResetToken.create;
const mockSendEmail = sendPasswordResetEmail as ReturnType<typeof vi.fn>;

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllRateLimits();
  });

  it("returns 429 when rate limited", async () => {
    // Exhaust rate limit (3 requests for forgot-password)
    for (let i = 0; i < 3; i++) {
      mockUserFindUnique.mockResolvedValue(null);
      const req = createMockRequest("/api/auth/forgot-password", {
        method: "POST",
        body: { email: `test${i}@example.com` },
        headers: { "x-forwarded-for": "10.0.0.50" },
      });
      await POST(req);
    }

    const request = createMockRequest("/api/auth/forgot-password", {
      method: "POST",
      body: { email: "test@example.com" },
      headers: { "x-forwarded-for": "10.0.0.50" },
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new Request("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid email", async () => {
    const request = createMockRequest("/api/auth/forgot-password", {
      method: "POST",
      body: { email: "not-an-email" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns generic message for nonexistent user (anti-enumeration)", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    const request = createMockRequest("/api/auth/forgot-password", {
      method: "POST",
      body: { email: "nonexistent@example.com" },
    });

    const response = await POST(request);
    const data = await parseResponse<{ message: string }>(response);

    expect(response.status).toBe(200);
    expect(data.message).toContain("Falls ein Konto");
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("returns generic message for OAuth user (no password)", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "user-1",
      password_hash: null,
      preferred_language: "de",
    });

    const request = createMockRequest("/api/auth/forgot-password", {
      method: "POST",
      body: { email: "oauth@example.com" },
    });

    const response = await POST(request);
    const data = await parseResponse<{ message: string }>(response);

    expect(response.status).toBe(200);
    expect(data.message).toContain("Falls ein Konto");
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("deletes existing tokens, creates new token, and sends email", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "user-1",
      password_hash: "hashed",
      preferred_language: "de",
    });
    mockPasswordResetTokenDeleteMany.mockResolvedValue({ count: 1 });
    mockPasswordResetTokenCreate.mockResolvedValue({
      id: "token-1",
      token: "abc",
    });

    const request = createMockRequest("/api/auth/forgot-password", {
      method: "POST",
      body: { email: "user@example.com" },
    });

    const response = await POST(request);
    const data = await parseResponse<{ message: string }>(response);

    expect(response.status).toBe(200);
    expect(data.message).toContain("Falls ein Konto");

    // Verify old tokens deleted
    expect(mockPasswordResetTokenDeleteMany).toHaveBeenCalledWith({
      where: { user_id: "user-1" },
    });

    // Verify new token created
    expect(mockPasswordResetTokenCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user_id: "user-1",
        token: expect.any(String),
        expires: expect.any(Date),
      }),
    });

    // Verify email sent
    expect(mockSendEmail).toHaveBeenCalledWith({
      email: "user@example.com",
      token: expect.any(String),
      locale: "de",
    });
  });

  it("returns 500 on unexpected error", async () => {
    mockUserFindUnique.mockRejectedValue(new Error("DB down"));

    const request = createMockRequest("/api/auth/forgot-password", {
      method: "POST",
      body: { email: "user@example.com" },
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
