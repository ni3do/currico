import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, forbiddenResponse } from "@/lib/admin-auth";
import { serverError, parsePagination, paginationResponse } from "@/lib/api";

/**
 * GET /api/admin/messages
 * List all contact messages with pagination
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
    const status = searchParams.get("status");

    const where = status ? { status: status as "NEW" | "READ" | "REPLIED" | "ARCHIVED" } : {};

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return NextResponse.json({
      messages,
      pagination: paginationResponse(page, limit, total),
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return serverError();
  }
}
