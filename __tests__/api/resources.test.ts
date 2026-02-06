import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "@/app/api/materials/route";
import { createMockRequest, parseResponse } from "../helpers/api-test-utils";
import { prisma } from "@/lib/db";
import { clearAllRateLimits } from "@/lib/rateLimit";

// Get mocked prisma functions
const mockMaterialFindMany = prisma.resource.findMany as ReturnType<typeof vi.fn>;
const mockMaterialCount = prisma.resource.count as ReturnType<typeof vi.fn>;

describe("GET /api/materials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllRateLimits();
  });

  it("returns paginated materials", async () => {
    const mockMaterials = [
      {
        id: "mat-1",
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
        id: "mat-2",
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

    mockMaterialFindMany.mockResolvedValue(mockMaterials);
    mockMaterialCount.mockResolvedValue(2);

    const request = createMockRequest("/api/materials");
    const response = await GET(request);
    const data = await parseResponse<{
      materials: unknown[];
      pagination: { page: number; total: number };
    }>(response);

    expect(response.status).toBe(200);
    expect(data.materials).toHaveLength(2);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.total).toBe(2);
  });

  it("formats prices correctly", async () => {
    mockMaterialFindMany.mockResolvedValue([
      {
        id: "mat-1",
        title: "Paid Material",
        description: "Description",
        price: 1299,
        subjects: ["Mathematik"],
        cycles: ["Zyklus 1"],
        preview_url: null,
        created_at: new Date(),
        seller: { id: "seller-1", display_name: "Teacher" },
      },
      {
        id: "mat-2",
        title: "Free Material",
        description: "Description",
        price: 0,
        subjects: ["Deutsch"],
        cycles: ["Zyklus 1"],
        preview_url: null,
        created_at: new Date(),
        seller: { id: "seller-2", display_name: "Teacher" },
      },
    ]);
    mockMaterialCount.mockResolvedValue(2);

    const request = createMockRequest("/api/materials");
    const response = await GET(request);
    const data = await parseResponse<{
      materials: { priceFormatted: string }[];
    }>(response);

    expect(data.materials[0].priceFormatted).toBe("CHF 12.99");
    expect(data.materials[1].priceFormatted).toBe("Gratis");
  });

  it("filters by subject", async () => {
    // Mock the raw query for JSON filtering (PostgreSQL uses $queryRaw with tagged templates)
    const mockQueryRaw = prisma.$queryRaw as ReturnType<typeof vi.fn>;
    mockQueryRaw.mockResolvedValue([{ id: "mat-1" }]);
    mockMaterialFindMany.mockResolvedValue([]);
    mockMaterialCount.mockResolvedValue(0);

    const request = createMockRequest("/api/materials", {
      searchParams: { subject: "Mathematik" },
    });

    await GET(request);

    // Should use raw SQL for JSON filtering
    expect(mockQueryRaw).toHaveBeenCalled();
    expect(mockMaterialFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ["mat-1"] },
        }),
      })
    );
  });

  it("filters by cycle", async () => {
    // Mock the raw query for JSON filtering (PostgreSQL uses $queryRaw with tagged templates)
    const mockQueryRaw = prisma.$queryRaw as ReturnType<typeof vi.fn>;
    mockQueryRaw.mockResolvedValue([{ id: "mat-2" }]);
    mockMaterialFindMany.mockResolvedValue([]);
    mockMaterialCount.mockResolvedValue(0);

    const request = createMockRequest("/api/materials", {
      searchParams: { cycle: "Zyklus 2" },
    });

    await GET(request);

    // Should use raw SQL for JSON filtering
    expect(mockQueryRaw).toHaveBeenCalled();
    expect(mockMaterialFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ["mat-2"] },
        }),
      })
    );
  });

  it("supports search query", async () => {
    // PostgreSQL uses full-text search via $queryRaw
    const mockQueryRaw = prisma.$queryRaw as ReturnType<typeof vi.fn>;
    mockQueryRaw.mockResolvedValue([{ id: "mat-1", rank: 0.5 }]);
    mockMaterialFindMany.mockResolvedValue([]);
    mockMaterialCount.mockResolvedValue(0);

    const request = createMockRequest("/api/materials", {
      searchParams: { search: "math" },
    });

    await GET(request);

    // PostgreSQL full-text search uses $queryRaw with plainto_tsquery
    expect(mockQueryRaw).toHaveBeenCalled();
    expect(mockMaterialFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ["mat-1"] },
        }),
      })
    );
  });

  it("supports pagination parameters", async () => {
    mockMaterialFindMany.mockResolvedValue([]);
    mockMaterialCount.mockResolvedValue(50);

    const request = createMockRequest("/api/materials", {
      searchParams: { page: "2", limit: "10" },
    });

    const response = await GET(request);
    const data = await parseResponse<{
      pagination: { page: number; limit: number; totalPages: number };
    }>(response);

    expect(mockMaterialFindMany).toHaveBeenCalledWith(
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
    mockMaterialFindMany.mockResolvedValue([]);
    mockMaterialCount.mockResolvedValue(0);

    const request = createMockRequest("/api/materials", {
      searchParams: { sort: "price-low" },
    });

    await GET(request);

    expect(mockMaterialFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { price: "asc" },
      })
    );
  });

  it("sorts by price descending", async () => {
    mockMaterialFindMany.mockResolvedValue([]);
    mockMaterialCount.mockResolvedValue(0);

    const request = createMockRequest("/api/materials", {
      searchParams: { sort: "price-high" },
    });

    await GET(request);

    expect(mockMaterialFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { price: "desc" },
      })
    );
  });

  it("defaults to newest sort order", async () => {
    mockMaterialFindMany.mockResolvedValue([]);
    mockMaterialCount.mockResolvedValue(0);

    const request = createMockRequest("/api/materials");

    await GET(request);

    expect(mockMaterialFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { created_at: "desc" },
      })
    );
  });

  it("only returns published and public materials", async () => {
    mockMaterialFindMany.mockResolvedValue([]);
    mockMaterialCount.mockResolvedValue(0);

    const request = createMockRequest("/api/materials");

    await GET(request);

    expect(mockMaterialFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          is_published: true,
          is_public: true,
        }),
      })
    );
  });

  it("rate limits excessive requests", async () => {
    mockMaterialFindMany.mockResolvedValue([]);
    mockMaterialCount.mockResolvedValue(0);

    // Make 60 requests (the limit per minute)
    for (let i = 0; i < 60; i++) {
      const request = createMockRequest("/api/materials", {
        headers: { "x-forwarded-for": "10.0.0.1" },
      });
      await GET(request);
    }

    // 61st request should be rate limited
    const request = createMockRequest("/api/materials", {
      headers: { "x-forwarded-for": "10.0.0.1" },
    });

    const response = await GET(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(429);
    expect(data.error).toContain("Zu viele Anfragen");
  });

  it("returns 500 on database error", async () => {
    mockMaterialFindMany.mockRejectedValue(new Error("Database error"));

    const request = createMockRequest("/api/materials");
    const response = await GET(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch materials");
  });
});
