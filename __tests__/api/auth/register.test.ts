import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/auth/register/route";
import { createMockRequest, parseResponse } from "../../helpers/api-test-utils";
import { prisma } from "@/lib/db";
import { clearAllRateLimits } from "@/lib/rateLimit";

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
  },
}));

// Get mocked prisma functions
const mockUserFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockUserCreate = prisma.user.create as ReturnType<typeof vi.fn>;
const mockTransactionFindMany = prisma.transaction.findMany as ReturnType<typeof vi.fn>;
const mockTransactionUpdateMany = prisma.transaction.updateMany as ReturnType<typeof vi.fn>;
const mockDownloadCreateMany = (
  prisma as unknown as { download: { createMany: ReturnType<typeof vi.fn> } }
).download.createMany;

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllRateLimits();
    // Default: no guest transactions
    mockTransactionFindMany.mockResolvedValue([]);
  });

  it("successfully registers a new user", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
    });

    const request = createMockRequest("/api/auth/register", {
      method: "POST",
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ message: string; user: { id: string } }>(response);

    expect(response.status).toBe(201);
    expect(data.message).toBe("Benutzer erfolgreich erstellt");
    expect(data.user.id).toBe("user-123");
  });

  it("rejects registration with existing email", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "existing-user",
      email: "test@example.com",
    });

    const request = createMockRequest("/api/auth/register", {
      method: "POST",
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe("Ein Benutzer mit dieser E-Mail existiert bereits");
  });

  it("validates name minimum length", async () => {
    const request = createMockRequest("/api/auth/register", {
      method: "POST",
      body: {
        name: "A",
        email: "test@example.com",
        password: "Password123",
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain("at least 2 characters");
  });

  it("validates email format", async () => {
    const request = createMockRequest("/api/auth/register", {
      method: "POST",
      body: {
        name: "Test User",
        email: "invalid-email",
        password: "Password123",
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain("email");
  });

  it("validates password requirements", async () => {
    const request = createMockRequest("/api/auth/register", {
      method: "POST",
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "weak",
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain("Password");
  });

  it("validates password requires uppercase, lowercase and numbers", async () => {
    const request = createMockRequest("/api/auth/register", {
      method: "POST",
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "alllowercase",
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain("uppercase, lowercase, and numbers");
  });

  it("handles optional fields correctly", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
    });

    const request = createMockRequest("/api/auth/register", {
      method: "POST",
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
        canton: "Zürich",
        subjects: ["Mathematik", "Deutsch"],
        cycles: ["Zyklus 1"],
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockUserCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        cantons: ["Zürich"],
        subjects: ["Mathematik", "Deutsch"],
        cycles: ["Zyklus 1"],
        role: "BUYER",
      }),
    });
  });

  it("rate limits excessive registration attempts", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
    });

    // Make 5 successful requests (the limit)
    for (let i = 0; i < 5; i++) {
      const request = createMockRequest("/api/auth/register", {
        method: "POST",
        body: {
          name: "Test User",
          email: `test${i}@example.com`,
          password: "Password123",
        },
        headers: { "x-forwarded-for": "192.168.1.100" },
      });
      await POST(request);
    }

    // 6th request should be rate limited
    const request = createMockRequest("/api/auth/register", {
      method: "POST",
      body: {
        name: "Test User",
        email: "test6@example.com",
        password: "Password123",
      },
      headers: { "x-forwarded-for": "192.168.1.100" },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(429);
    expect(data.error).toContain("Zu viele Anfragen");
  });

  it("links past guest purchases when user registers with same email", async () => {
    const guestEmail = "guest@example.com";
    const guestTransactions = [
      { id: "tx-1", resource_id: "resource-1" },
      { id: "tx-2", resource_id: "resource-2" },
    ];

    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({
      id: "user-123",
      name: "Test User",
      email: guestEmail,
    });
    mockTransactionFindMany.mockResolvedValue(guestTransactions);
    mockTransactionUpdateMany.mockResolvedValue({ count: 2 });
    mockDownloadCreateMany.mockResolvedValue({ count: 2 });

    const request = createMockRequest("/api/auth/register", {
      method: "POST",
      body: {
        name: "Test User",
        email: guestEmail,
        password: "Password123",
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ message: string; user: { id: string } }>(response);

    expect(response.status).toBe(201);
    expect(data.user.id).toBe("user-123");

    // Verify transactions were found
    expect(mockTransactionFindMany).toHaveBeenCalledWith({
      where: {
        guest_email: guestEmail,
        buyer_id: null,
        status: "COMPLETED",
      },
      select: {
        id: true,
        resource_id: true,
      },
    });

    // Verify transactions were linked to the new user
    expect(mockTransactionUpdateMany).toHaveBeenCalledWith({
      where: {
        guest_email: guestEmail,
        buyer_id: null,
        status: "COMPLETED",
      },
      data: {
        buyer_id: "user-123",
      },
    });

    // Verify Download records were created
    expect(mockDownloadCreateMany).toHaveBeenCalledWith({
      data: [
        { user_id: "user-123", resource_id: "resource-1" },
        { user_id: "user-123", resource_id: "resource-2" },
      ],
      skipDuplicates: true,
    });
  });

  it("does not link transactions when no guest purchases exist", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({
      id: "user-123",
      name: "Test User",
      email: "new@example.com",
    });
    mockTransactionFindMany.mockResolvedValue([]); // No guest transactions

    const request = createMockRequest("/api/auth/register", {
      method: "POST",
      body: {
        name: "Test User",
        email: "new@example.com",
        password: "Password123",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);

    // Transaction update should not be called when no guest transactions
    expect(mockTransactionUpdateMany).not.toHaveBeenCalled();
    expect(mockDownloadCreateMany).not.toHaveBeenCalled();
  });
});
