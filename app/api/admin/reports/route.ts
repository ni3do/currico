import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, forbiddenResponse } from "@/lib/admin-auth";
import { serverError, parsePagination, paginationResponse } from "@/lib/api";

/**
 * GET /api/admin/reports
 * List all reports with pagination
 * Access: ADMIN only
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(searchParams);
    const status = searchParams.get("status"); // Filter by status

    const where = status
      ? { status: status as "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED" }
      : {};

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          reporter: {
            select: { id: true, display_name: true, email: true },
          },
          reported_user: {
            select: { id: true, display_name: true, email: true },
          },
          resource: {
            select: { id: true, title: true },
          },
          handled_by: {
            select: { id: true, display_name: true },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: paginationResponse(page, limit, total),
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return serverError();
  }
}
