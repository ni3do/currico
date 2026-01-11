import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";

/**
 * GET /api/admin/reports
 * List all reports with pagination
 * Access: ADMIN only
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return unauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status"); // Filter by status

    const where = status ? { status: status as "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED" } : {};

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip: (page - 1) * limit,
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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/reports
 * Update report status (resolve, dismiss, etc.)
 * Access: ADMIN only
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { id, status, resolution } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Report ID ist erforderlich" },
        { status: 400 }
      );
    }

    if (!status || !["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"].includes(status)) {
      return NextResponse.json(
        { error: "Ungültiger Status" },
        { status: 400 }
      );
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status: status as "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED",
        ...(resolution && { resolution }),
        // Mark as handled if resolving or dismissing
        ...((status === "RESOLVED" || status === "DISMISSED") && {
          handled_by: { connect: { id: admin.id } },
          handled_at: new Date(),
        }),
      },
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
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
