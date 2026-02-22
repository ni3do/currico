import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, PATCH, DELETE } from "@/app/api/materials/[id]/route";
import {
  createMockRequest,
  parseResponse,
  createRouteParams,
  mockAuthenticated,
  mockUnauthenticated,
} from "../../helpers/api-test-utils";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

// Mock admin-auth
vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: vi.fn().mockResolvedValue(null),
}));

// Mock storage
vi.mock("@/lib/storage", () => ({
  getStorage: vi.fn(() => ({
    delete: vi.fn().mockResolvedValue(undefined),
    isLocal: vi.fn().mockReturnValue(false),
  })),
  isLegacyLocalPath: vi.fn().mockReturnValue(false),
  getLegacyFilePath: vi.fn((p: string) => `/legacy${p}`),
}));

// Mock fs/promises
vi.mock("fs/promises", () => ({
  default: {},
  unlink: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
}));

import { requireAdmin } from "@/lib/admin-auth";

const mockGetCurrentUserId = getCurrentUserId as ReturnType<typeof vi.fn>;
const mockRequireAdmin = requireAdmin as ReturnType<typeof vi.fn>;
const mockResourceFindUnique = prisma.resource.findUnique as ReturnType<typeof vi.fn>;
const mockResourceUpdate = prisma.resource.update as ReturnType<typeof vi.fn>;
const mockResourceDelete = prisma.resource.delete as ReturnType<typeof vi.fn>;
const mockResourceFindMany = prisma.resource.findMany as ReturnType<typeof vi.fn>;
const mockQueryRaw = prisma.$queryRaw as ReturnType<typeof vi.fn>;

const validId = "cm1234567890abcdefghijklmn";

const baseMaterial = {
  id: validId,
  title: "Test Material",
  description: "A test material",
  price: 500,
  file_url: "materials/test.pdf",
  preview_url: "previews/test.png",
  preview_urls: [],
  preview_count: 1,
  subjects: ["MA"],
  cycles: ["Z1"],
  tags: ["test"],
  is_mi_integrated: false,
  competencies: [],
  transversals: [],
  bne_themes: [],
  is_published: true,
  is_approved: true,
  status: "APPROVED",
  created_at: new Date(),
  seller_id: "seller-1",
  seller: {
    id: "seller-1",
    display_name: "Test Seller",
    image: null,
    stripe_charges_enabled: true,
    _count: { resources: 5 },
  },
  _count: { transactions: 10, downloads: 3 },
  transactions: [],
};

describe("GET /api/materials/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUserId.mockResolvedValue(null);
    mockRequireAdmin.mockResolvedValue(null);
    mockQueryRaw.mockResolvedValue([]);
    mockResourceFindMany.mockResolvedValue([]);
  });

  it("returns 404 when material not found", async () => {
    mockResourceFindUnique.mockResolvedValue(null);

    const request = createMockRequest(`/api/materials/${validId}`);
    const response = await GET(request, createRouteParams({ id: validId }));

    expect(response.status).toBe(404);
  });

  it("returns 404 for unpublished material when not owner", async () => {
    mockResourceFindUnique.mockResolvedValue({
      ...baseMaterial,
      is_published: false,
    });

    const request = createMockRequest(`/api/materials/${validId}`);
    const response = await GET(request, createRouteParams({ id: validId }));

    expect(response.status).toBe(404);
  });

  it("returns published material to anonymous user", async () => {
    mockResourceFindUnique.mockResolvedValue(baseMaterial);

    const request = createMockRequest(`/api/materials/${validId}`);
    const response = await GET(request, createRouteParams({ id: validId }));
    const data = await parseResponse<{ material: { id: string; title: string } }>(response);

    expect(response.status).toBe(200);
    expect(data.material.id).toBe(validId);
    expect(data.material.title).toBe("Test Material");
  });

  it("owner can see unpublished material", async () => {
    mockGetCurrentUserId.mockResolvedValue("seller-1");
    mockResourceFindUnique.mockResolvedValue({
      ...baseMaterial,
      is_published: false,
    });

    const request = createMockRequest(`/api/materials/${validId}`);
    const response = await GET(request, createRouteParams({ id: validId }));

    expect(response.status).toBe(200);
  });

  it("hasAccess is true for free material", async () => {
    mockResourceFindUnique.mockResolvedValue({ ...baseMaterial, price: 0 });

    const request = createMockRequest(`/api/materials/${validId}`);
    const response = await GET(request, createRouteParams({ id: validId }));
    const data = await parseResponse<{ material: { hasAccess: boolean } }>(response);

    expect(response.status).toBe(200);
    expect(data.material.hasAccess).toBe(true);
  });

  it("hasAccess is true for purchased material", async () => {
    mockGetCurrentUserId.mockResolvedValue("buyer-1");
    mockResourceFindUnique.mockResolvedValue({
      ...baseMaterial,
      transactions: [{ id: "tx-1" }],
    });

    const request = createMockRequest(`/api/materials/${validId}`);
    const response = await GET(request, createRouteParams({ id: validId }));
    const data = await parseResponse<{ material: { hasAccess: boolean } }>(response);

    expect(response.status).toBe(200);
    expect(data.material.hasAccess).toBe(true);
  });

  it("hasAccess is true for owner", async () => {
    mockGetCurrentUserId.mockResolvedValue("seller-1");
    mockResourceFindUnique.mockResolvedValue(baseMaterial);

    const request = createMockRequest(`/api/materials/${validId}`);
    const response = await GET(request, createRouteParams({ id: validId }));
    const data = await parseResponse<{ material: { hasAccess: boolean } }>(response);

    expect(response.status).toBe(200);
    expect(data.material.hasAccess).toBe(true);
  });

  it("admin can see unpublished material", async () => {
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockResourceFindUnique.mockResolvedValue({
      ...baseMaterial,
      is_published: false,
    });

    const request = createMockRequest(`/api/materials/${validId}`);
    const response = await GET(request, createRouteParams({ id: validId }));

    expect(response.status).toBe(200);
  });

  it("returns 400 for invalid ID", async () => {
    const request = createMockRequest("/api/materials/;;;invalid");
    const response = await GET(request, createRouteParams({ id: ";;;invalid" }));

    expect(response.status).toBe(400);
  });
});

describe("PATCH /api/materials/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUserId.mockResolvedValue(null);
  });

  it("returns 401 when not authenticated", async () => {
    const request = createMockRequest(`/api/materials/${validId}`, {
      method: "PATCH",
      body: { title: "Updated" },
    });

    const response = await PATCH(request, createRouteParams({ id: validId }));
    expect(response.status).toBe(401);
  });

  it("returns 404 when material not found", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue(null);

    const request = createMockRequest(`/api/materials/${validId}`, {
      method: "PATCH",
      body: { title: "Updated Title" },
    });

    const response = await PATCH(request, createRouteParams({ id: validId }));
    expect(response.status).toBe(404);
  });

  it("returns 403 when not owner", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue({
      id: validId,
      seller_id: "other-user",
      is_approved: false,
    });

    const request = createMockRequest(`/api/materials/${validId}`, {
      method: "PATCH",
      body: { title: "Updated Title" },
    });

    const response = await PATCH(request, createRouteParams({ id: validId }));
    expect(response.status).toBe(403);
  });

  it("returns 400 for validation error", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue({
      id: validId,
      seller_id: "user-1",
      is_approved: false,
    });

    const request = createMockRequest(`/api/materials/${validId}`, {
      method: "PATCH",
      body: { title: "AB" }, // too short (min 3)
    });

    const response = await PATCH(request, createRouteParams({ id: validId }));
    expect(response.status).toBe(400);
  });

  it("returns 400 for price change after approval", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue({
      id: validId,
      seller_id: "user-1",
      is_approved: true,
    });

    const request = createMockRequest(`/api/materials/${validId}`, {
      method: "PATCH",
      body: { price: 1000 },
    });

    const response = await PATCH(request, createRouteParams({ id: validId }));
    const data = await parseResponse<{ code: string }>(response);

    expect(response.status).toBe(400);
    expect(data.code).toBe("PRICE_CHANGE_AFTER_APPROVAL");
  });

  it("returns 200 on successful update", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue({
      id: validId,
      seller_id: "user-1",
      is_approved: false,
    });
    mockResourceUpdate.mockResolvedValue({
      id: validId,
      title: "Updated Title",
      description: "Some description",
      price: 500,
      subjects: ["MA"],
      cycles: ["Z1"],
      tags: [],
      file_url: "file.pdf",
      preview_url: "preview.png",
      is_published: false,
      is_approved: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const request = createMockRequest(`/api/materials/${validId}`, {
      method: "PATCH",
      body: { title: "Updated Title" },
    });

    const response = await PATCH(request, createRouteParams({ id: validId }));
    const data = await parseResponse<{ message: string }>(response);

    expect(response.status).toBe(200);
    expect(data.message).toBe("Material updated");
  });
});

describe("DELETE /api/materials/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUserId.mockResolvedValue(null);
  });

  it("returns 401 when not authenticated", async () => {
    const request = createMockRequest(`/api/materials/${validId}`, { method: "DELETE" });
    const response = await DELETE(request, createRouteParams({ id: validId }));
    expect(response.status).toBe(401);
  });

  it("returns 404 when material not found", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue(null);

    const request = createMockRequest(`/api/materials/${validId}`, { method: "DELETE" });
    const response = await DELETE(request, createRouteParams({ id: validId }));
    expect(response.status).toBe(404);
  });

  it("returns 403 when not owner", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue({
      id: validId,
      seller_id: "other-user",
      file_url: "test.pdf",
      preview_url: null,
      _count: { transactions: 0 },
    });

    const request = createMockRequest(`/api/materials/${validId}`, { method: "DELETE" });
    const response = await DELETE(request, createRouteParams({ id: validId }));
    expect(response.status).toBe(403);
  });

  it("returns 400 when material has purchases", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue({
      id: validId,
      seller_id: "user-1",
      file_url: "test.pdf",
      preview_url: null,
      _count: { transactions: 3 },
    });

    const request = createMockRequest(`/api/materials/${validId}`, { method: "DELETE" });
    const response = await DELETE(request, createRouteParams({ id: validId }));
    const data = await parseResponse<{ code: string }>(response);

    expect(response.status).toBe(400);
    expect(data.code).toBe("MATERIAL_HAS_PURCHASES");
  });

  it("returns 200 on successful delete", async () => {
    await mockAuthenticated("user-1");
    mockResourceFindUnique.mockResolvedValue({
      id: validId,
      seller_id: "user-1",
      file_url: "materials/test.pdf",
      preview_url: "previews/test.png",
      _count: { transactions: 0 },
    });
    mockResourceDelete.mockResolvedValue({});

    const request = createMockRequest(`/api/materials/${validId}`, { method: "DELETE" });
    const response = await DELETE(request, createRouteParams({ id: validId }));
    const data = await parseResponse<{ message: string }>(response);

    expect(response.status).toBe(200);
    expect(data.message).toBe("Material deleted");
    expect(mockResourceDelete).toHaveBeenCalledWith({ where: { id: validId } });
  });
});
