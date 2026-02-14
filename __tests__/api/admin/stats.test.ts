import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "@/app/api/admin/stats/route";
import { parseResponse } from "../../helpers/api-test-utils";
import { prisma } from "@/lib/db";

// Get mocked prisma functions
const mockUserCount = prisma.user.count as ReturnType<typeof vi.fn>;
const mockMaterialCount = prisma.resource.count as ReturnType<typeof vi.fn>;
const mockTransactionAggregate = prisma.transaction.aggregate as ReturnType<typeof vi.fn>;
const mockReportCount = prisma.report.count as ReturnType<typeof vi.fn>;

// Mock admin auth
const mockRequireAdmin = vi.fn();
vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: () => mockRequireAdmin(),
  unauthorizedResponse: () =>
    new Response(JSON.stringify({ error: "Zugriff verweigert" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    }),
}));

describe("GET /api/admin/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockReset();
  });

  it("returns stats for authenticated admin", async () => {
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "ADMIN" });

    mockUserCount
      .mockResolvedValueOnce(100) // totalUsers
      .mockResolvedValueOnce(5) // newUsersToday
      .mockResolvedValueOnce(20) // sellerCount
      .mockResolvedValueOnce(70) // buyerCount
      .mockResolvedValueOnce(10); // adminCount

    mockMaterialCount
      .mockResolvedValueOnce(50) // totalMaterials
      .mockResolvedValueOnce(3); // pendingApproval

    mockTransactionAggregate
      .mockResolvedValueOnce({ _sum: { amount: 100000 } }) // totalTransactions
      .mockResolvedValueOnce({ _sum: { amount: 5000 } }) // todayTransactions
      // Weekly revenue (7 days)
      .mockResolvedValueOnce({ _sum: { amount: 1000 } })
      .mockResolvedValueOnce({ _sum: { amount: 2000 } })
      .mockResolvedValueOnce({ _sum: { amount: 1500 } })
      .mockResolvedValueOnce({ _sum: { amount: 3000 } })
      .mockResolvedValueOnce({ _sum: { amount: 2500 } })
      .mockResolvedValueOnce({ _sum: { amount: 4000 } })
      .mockResolvedValueOnce({ _sum: { amount: 5000 } });

    mockReportCount.mockResolvedValueOnce(2); // openReports

    const response = await GET();
    const data = await parseResponse<{
      totalUsers: number;
      totalRevenue: number;
      pendingApproval: number;
    }>(response);

    expect(response.status).toBe(200);
    expect(data.totalUsers).toBe(100);
    expect(data.totalRevenue).toBe(1000); // 100000 cents = 1000 CHF
    expect(data.pendingApproval).toBe(3);
  });

  it("denies access to non-admin users", async () => {
    mockRequireAdmin.mockResolvedValue(null);

    const response = await GET();
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(403);
    expect(data.error).toBe("Zugriff verweigert");
  });

  it("handles null revenue values", async () => {
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "ADMIN" });

    mockUserCount.mockResolvedValue(0);
    mockMaterialCount.mockResolvedValue(0);
    mockTransactionAggregate.mockResolvedValue({ _sum: { amount: null } });
    mockReportCount.mockResolvedValue(0);

    const response = await GET();
    const data = await parseResponse<{
      totalRevenue: number;
      revenueToday: number;
    }>(response);

    expect(response.status).toBe(200);
    expect(data.totalRevenue).toBe(0);
    expect(data.revenueToday).toBe(0);
  });

  it("returns user breakdown by role", async () => {
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "ADMIN" });

    mockUserCount
      .mockResolvedValueOnce(100) // totalUsers
      .mockResolvedValueOnce(5) // newUsersToday
      .mockResolvedValueOnce(20) // sellerCount
      .mockResolvedValueOnce(70) // buyerCount
      .mockResolvedValueOnce(10); // adminCount

    mockMaterialCount.mockResolvedValue(0);
    mockTransactionAggregate.mockResolvedValue({ _sum: { amount: 0 } });
    mockReportCount.mockResolvedValue(0);

    const response = await GET();
    const data = await parseResponse<{
      userBreakdown: { buyers: number; sellers: number; admins: number };
    }>(response);

    expect(response.status).toBe(200);
    expect(data.userBreakdown.buyers).toBe(70);
    expect(data.userBreakdown.sellers).toBe(20);
    expect(data.userBreakdown.admins).toBe(10);
  });

  it("returns 500 on database error", async () => {
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockUserCount.mockRejectedValue(new Error("Database error"));

    const response = await GET();
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe("Fehler beim Laden der Statistiken");
  });
});
