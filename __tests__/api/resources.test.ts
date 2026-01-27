import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "@/app/api/resources/route";
import { createMockRequest, parseResponse } from "../helpers/api-test-utils";
import { prisma } from "@/lib/db";
import { clearAllRateLimits } from "@/lib/rateLimit";

// Get mocked prisma functions
const mockResourceFindMany = prisma.resource.findMany as ReturnType<typeof vi.fn>;
const mockResourceCount = prisma.resource.count as ReturnType<typeof vi.fn>;

describe("GET /api/resources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllRateLimits();
  });

  it("returns paginated resources", async () => {
    const mockResources = [
      {
        id: "res-1",
        title: "Math Worksheet",
        description: "A worksheet for math",
        price: 500,
        subjects: ["Mathematik"],
        cycles: ["Zyklus 1"],
        preview_url: "/preview1.jpg",
        created_at: new Date(),
        seller: { id: "seller-1", display_name: "Teacher A" },
      },
      {
        id: "res-2",
        title: "German Exercise",
        description: "German language exercise",
        price: 0,
        subjects: ["Deutsch"],
        cycles: ["Zyklus 2"],
        preview_url: null,
        created_at: new Date(),
        seller: { id: "seller-2", display_name: "Teacher B" },
      },
    ];

    mockResourceFindMany.mockResolvedValue(mockResources);
    mockResourceCount.mockResolvedValue(2);

    const request = createMockRequest("/api/resources");
    const response = await GET(request);
    const data = await parseResponse<{
      resources: unknown[];
      pagination: { page: number; total: number };
    }>(response);

    expect(response.status).toBe(200);
    expect(data.resources).toHaveLength(2);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.total).toBe(2);
  });

  it("formats prices correctly", async () => {
    mockResourceFindMany.mockResolvedValue([
      {
        id: "res-1",
        title: "Paid Resource",
        description: "Description",
        price: 1299,
        subjects: ["Mathematik"],
        cycles: ["Zyklus 1"],
        preview_url: null,
        created_at: new Date(),
        seller: { id: "seller-1", display_name: "Teacher" },
      },
      {
        id: "res-2",
        title: "Free Resource",
        description: "Description",
        price: 0,
        subjects: ["Deutsch"],
        cycles: ["Zyklus 1"],
        preview_url: null,
        created_at: new Date(),
        seller: { id: "seller-2", display_name: "Teacher" },
      },
    ]);
    mockResourceCount.mockResolvedValue(2);

    const request = createMockRequest("/api/resources");
    const response = await GET(request);
    const data = await parseResponse<{
      resources: { priceFormatted: string }[];
    }>(response);

    expect(data.resources[0].priceFormatted).toBe("CHF 12.99");
    expect(data.resources[1].priceFormatted).toBe("Gratis");
  });

  it("filters by subject", async () => {
    // Mock the raw query for JSON filtering
    const mockQueryRawUnsafe = prisma.$queryRawUnsafe as ReturnType<typeof vi.fn>;
    mockQueryRawUnsafe.mockResolvedValue([{ id: "res-1" }]);
    mockResourceFindMany.mockResolvedValue([]);
    mockResourceCount.mockResolvedValue(0);

    const request = createMockRequest("/api/resources", {
      searchParams: { subject: "Mathematik" },
    });

    await GET(request);

    // Should use raw SQL for JSON filtering
    expect(mockQueryRawUnsafe).toHaveBeenCalled();
    expect(mockResourceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ["res-1"] },
        }),
      })
    );
  });

  it("filters by cycle", async () => {
    // Mock the raw query for JSON filtering
    const mockQueryRawUnsafe = prisma.$queryRawUnsafe as ReturnType<typeof vi.fn>;
    mockQueryRawUnsafe.mockResolvedValue([{ id: "res-2" }]);
    mockResourceFindMany.mockResolvedValue([]);
    mockResourceCount.mockResolvedValue(0);

    const request = createMockRequest("/api/resources", {
      searchParams: { cycle: "Zyklus 2" },
    });

    await GET(request);

    // Should use raw SQL for JSON filtering
    expect(mockQueryRawUnsafe).toHaveBeenCalled();
    expect(mockResourceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ["res-2"] },
        }),
      })
    );
  });

  it("supports search query", async () => {
    mockResourceFindMany.mockResolvedValue([]);
    mockResourceCount.mockResolvedValue(0);

    const request = createMockRequest("/api/resources", {
      searchParams: { search: "math" },
    });

    await GET(request);

    // MySQL doesn't support mode: "insensitive", so we just use contains
    expect(mockResourceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ title: { contains: "math" } }, { description: { contains: "math" } }],
        }),
      })
    );
  });

  it("supports pagination parameters", async () => {
    mockResourceFindMany.mockResolvedValue([]);
    mockResourceCount.mockResolvedValue(50);

    const request = createMockRequest("/api/resources", {
      searchParams: { page: "2", limit: "10" },
    });

    const response = await GET(request);
    const data = await parseResponse<{
      pagination: { page: number; limit: number; totalPages: number };
    }>(response);

    expect(mockResourceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10, // (page 2 - 1) * limit 10
        take: 10,
      })
    );
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(10);
    expect(data.pagination.totalPages).toBe(5);
  });

  it("sorts by price ascending", async () => {
    mockResourceFindMany.mockResolvedValue([]);
    mockResourceCount.mockResolvedValue(0);

    const request = createMockRequest("/api/resources", {
      searchParams: { sort: "price-low" },
    });

    await GET(request);

    expect(mockResourceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { price: "asc" },
      })
    );
  });

  it("sorts by price descending", async () => {
    mockResourceFindMany.mockResolvedValue([]);
    mockResourceCount.mockResolvedValue(0);

    const request = createMockRequest("/api/resources", {
      searchParams: { sort: "price-high" },
    });

    await GET(request);

    expect(mockResourceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { price: "desc" },
      })
    );
  });

  it("defaults to newest sort order", async () => {
    mockResourceFindMany.mockResolvedValue([]);
    mockResourceCount.mockResolvedValue(0);

    const request = createMockRequest("/api/resources");

    await GET(request);

    expect(mockResourceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { created_at: "desc" },
      })
    );
  });

  it("only returns published and public resources", async () => {
    mockResourceFindMany.mockResolvedValue([]);
    mockResourceCount.mockResolvedValue(0);

    const request = createMockRequest("/api/resources");

    await GET(request);

    expect(mockResourceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          is_published: true,
          is_public: true,
        }),
      })
    );
  });

  it("rate limits excessive requests", async () => {
    mockResourceFindMany.mockResolvedValue([]);
    mockResourceCount.mockResolvedValue(0);

    // Make 60 requests (the limit per minute)
    for (let i = 0; i < 60; i++) {
      const request = createMockRequest("/api/resources", {
        headers: { "x-forwarded-for": "10.0.0.1" },
      });
      await GET(request);
    }

    // 61st request should be rate limited
    const request = createMockRequest("/api/resources", {
      headers: { "x-forwarded-for": "10.0.0.1" },
    });

    const response = await GET(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(429);
    expect(data.error).toContain("Zu viele Anfragen");
  });

  it("returns 500 on database error", async () => {
    mockResourceFindMany.mockRejectedValue(new Error("Database error"));

    const request = createMockRequest("/api/resources");
    const response = await GET(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch resources");
  });
});
