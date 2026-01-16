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

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllRateLimits();
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
    expect(data.error).toContain("mindestens 2 Zeichen");
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
    expect(data.error).toContain("E-Mail");
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
    expect(data.error).toContain("Passwort");
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
    expect(data.error).toContain("Gross-, Kleinbuchstaben und Zahlen");
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
        accountType: "school",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockUserCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        cantons: ["Zürich"],
        subjects: ["Mathematik", "Deutsch"],
        cycles: ["Zyklus 1"],
        role: "SCHOOL",
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
});
