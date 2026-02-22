import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, PATCH, DELETE } from "@/app/api/users/me/route";
import {
  createMockRequest,
  parseResponse,
  mockAuthenticated,
  mockUnauthenticated,
} from "../../helpers/api-test-utils";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

// Mock json-array
vi.mock("@/lib/json-array", () => ({
  toStringArray: vi.fn((val: unknown) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String);
    return [];
  }),
}));

const mockGetCurrentUserId = getCurrentUserId as ReturnType<typeof vi.fn>;
const mockUserFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockUserUpdate = prisma.user.update as ReturnType<typeof vi.fn>;
const mockUserDelete = prisma.user.delete as ReturnType<typeof vi.fn>;
const mockTransactionCount = prisma.transaction.count as ReturnType<typeof vi.fn>;
const mockTransaction = prisma.$transaction as ReturnType<typeof vi.fn>;

const mockUserData = {
  id: "user-1",
  display_name: "Test User",
  email: "test@example.com",
  bio: "A teacher",
  subjects: ["MA", "DE"],
  cycles: ["Z1"],
  cantons: ["Zürich"],
};

describe("GET /api/users/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUserId.mockResolvedValue(null);
  });

  it("returns 401 when not authenticated", async () => {
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns 404 when user not found", async () => {
    await mockAuthenticated("user-1");
    mockUserFindUnique.mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(404);
  });

  it("returns 200 with user profile and array fields", async () => {
    await mockAuthenticated("user-1");
    mockUserFindUnique.mockResolvedValue(mockUserData);

    const response = await GET();
    const data = await parseResponse<{ display_name: string; subjects: string[] }>(response);

    expect(response.status).toBe(200);
    expect(data.display_name).toBe("Test User");
    expect(data.subjects).toEqual(["MA", "DE"]);
  });
});

describe("PATCH /api/users/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUserId.mockResolvedValue(null);
  });

  it("returns 401 when not authenticated", async () => {
    const request = createMockRequest("/api/users/me", {
      method: "PATCH",
      body: { display_name: "New Name" },
    });

    const response = await PATCH(request);
    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid input (name too short)", async () => {
    await mockAuthenticated("user-1");

    const request = createMockRequest("/api/users/me", {
      method: "PATCH",
      body: { display_name: "A" },
    });

    const response = await PATCH(request);
    expect(response.status).toBe(400);
  });

  it("returns 200 on successful profile update", async () => {
    await mockAuthenticated("user-1");
    mockUserUpdate.mockResolvedValue({
      ...mockUserData,
      display_name: "Updated Name",
      bio: "New bio",
    });

    const request = createMockRequest("/api/users/me", {
      method: "PATCH",
      body: {
        display_name: "Updated Name",
        bio: "New bio",
      },
    });

    const response = await PATCH(request);
    const data = await parseResponse<{ display_name: string }>(response);

    expect(response.status).toBe(200);
    expect(data.display_name).toBe("Updated Name");
  });

  it("handles optional social fields correctly", async () => {
    await mockAuthenticated("user-1");
    mockUserUpdate.mockResolvedValue({
      ...mockUserData,
      instagram: null,
      pinterest: null,
      website: null,
    });

    const request = createMockRequest("/api/users/me", {
      method: "PATCH",
      body: {
        display_name: "Test User",
        instagram: null,
        pinterest: null,
        website: "",
      },
    });

    const response = await PATCH(request);
    expect(response.status).toBe(200);
  });
});

describe("DELETE /api/users/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUserId.mockResolvedValue(null);
  });

  it("returns 401 when not authenticated", async () => {
    const response = await DELETE();
    expect(response.status).toBe(401);
  });

  it("returns 400 when user has seller transactions", async () => {
    await mockAuthenticated("user-1");
    mockTransactionCount.mockResolvedValue(5);

    const response = await DELETE();
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain("Cannot delete account");
  });

  it("returns 200 on successful account deletion", async () => {
    await mockAuthenticated("user-1");
    mockTransactionCount.mockResolvedValue(0);
    mockTransaction.mockResolvedValue(undefined);

    const response = await DELETE();
    const data = await parseResponse<{ message: string }>(response);

    expect(response.status).toBe(200);
    expect(data.message).toBe("Account deleted");
    expect(mockTransaction).toHaveBeenCalled();
  });
});
