import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/auth/change-password/route";
import { createMockRequest, parseResponse } from "../../helpers/api-test-utils";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { clearAllRateLimits } from "@/lib/rateLimit";

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn().mockResolvedValue("new_hashed_password"),
  },
}));

import bcrypt from "bcryptjs";

const mockGetCurrentUserId = getCurrentUserId as ReturnType<typeof vi.fn>;
const mockUserFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockUserUpdate = prisma.user.update as ReturnType<typeof vi.fn>;
const mockCompare = bcrypt.compare as ReturnType<typeof vi.fn>;

describe("POST /api/auth/change-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllRateLimits();
    mockGetCurrentUserId.mockResolvedValue(null);
  });

  const validBody = {
    currentPassword: "OldPassword1",
    newPassword: "NewPassword1",
    confirmPassword: "NewPassword1",
  };

  it("returns 401 when not authenticated", async () => {
    const request = createMockRequest("/api/auth/change-password", {
      method: "POST",
      body: validBody,
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockUserFindUnique.mockResolvedValue({ password_hash: "hash" });
    mockCompare.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    mockUserUpdate.mockResolvedValue({});

    // Exhaust rate limit (5 requests)
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest("/api/auth/change-password", {
        method: "POST",
        body: validBody,
        headers: { "x-forwarded-for": "10.0.0.99" },
      });
      await POST(req);
    }

    const request = createMockRequest("/api/auth/change-password", {
      method: "POST",
      body: validBody,
      headers: { "x-forwarded-for": "10.0.0.99" },
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
  });

  it("returns 400 for invalid JSON body", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");

    // Create a request with invalid JSON
    const request = new Request("http://localhost:3000/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request as any);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe("INVALID_BODY");
  });

  it("returns 400 when fields are missing", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");

    const request = createMockRequest("/api/auth/change-password", {
      method: "POST",
      body: { currentPassword: "Old1" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for short password", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");

    const request = createMockRequest("/api/auth/change-password", {
      method: "POST",
      body: { currentPassword: "Old1", newPassword: "Ab1", confirmPassword: "Ab1" },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe("PASSWORD_TOO_SHORT");
  });

  it("returns 400 for weak password (no uppercase)", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");

    const request = createMockRequest("/api/auth/change-password", {
      method: "POST",
      body: {
        currentPassword: "Old1",
        newPassword: "alllowercase1",
        confirmPassword: "alllowercase1",
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe("PASSWORD_TOO_WEAK");
  });

  it("returns 400 when passwords don't match", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");

    const request = createMockRequest("/api/auth/change-password", {
      method: "POST",
      body: {
        currentPassword: "Old1",
        newPassword: "NewPassword1",
        confirmPassword: "DifferentPassword1",
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe("PASSWORDS_MISMATCH");
  });

  it("returns 400 when user not found", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockUserFindUnique.mockResolvedValue(null);

    const request = createMockRequest("/api/auth/change-password", {
      method: "POST",
      body: validBody,
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe("USER_NOT_FOUND");
  });

  it("returns 400 when user has no password (OAuth account)", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockUserFindUnique.mockResolvedValue({ password_hash: null });

    const request = createMockRequest("/api/auth/change-password", {
      method: "POST",
      body: validBody,
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe("NO_PASSWORD_SET");
  });

  it("returns 400 when current password is wrong", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockUserFindUnique.mockResolvedValue({ password_hash: "existing_hash" });
    mockCompare.mockResolvedValue(false);

    const request = createMockRequest("/api/auth/change-password", {
      method: "POST",
      body: validBody,
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe("CURRENT_PASSWORD_WRONG");
  });

  it("returns 400 when new password is the same as current", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockUserFindUnique.mockResolvedValue({ password_hash: "existing_hash" });
    // First compare (current vs stored) = true, second compare (new vs stored) = true
    mockCompare.mockResolvedValueOnce(true).mockResolvedValueOnce(true);

    const request = createMockRequest("/api/auth/change-password", {
      method: "POST",
      body: {
        currentPassword: "OldPassword1",
        newPassword: "OldPassword1",
        confirmPassword: "OldPassword1",
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe("SAME_PASSWORD");
  });

  it("returns 200 on successful password change", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockUserFindUnique.mockResolvedValue({ password_hash: "existing_hash" });
    // First compare (current vs stored) = true, second compare (new vs stored) = false
    mockCompare.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    mockUserUpdate.mockResolvedValue({});

    const request = createMockRequest("/api/auth/change-password", {
      method: "POST",
      body: validBody,
    });

    const response = await POST(request);
    const data = await parseResponse<{ success: boolean }>(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password_hash: "new_hashed_password" },
    });
  });
});
