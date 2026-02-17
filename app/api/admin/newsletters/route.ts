import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import { badRequest, serverError } from "@/lib/api";

/**
 * GET /api/admin/newsletters
 * List all newsletters ordered by created_at desc
 * Access: ADMIN only
 */
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return unauthorizedResponse();
    }

    const newsletters = await prisma.newsletter.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(newsletters);
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    return serverError();
  }
}

/**
 * POST /api/admin/newsletters
 * Create a new draft newsletter
 * Access: ADMIN only
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { subject, content } = body;

    if (!subject || !content) {
      return badRequest("Subject and content are required");
    }

    const newsletter = await prisma.newsletter.create({
      data: {
        subject,
        content,
        status: "DRAFT",
      },
    });

    return NextResponse.json(newsletter, { status: 201 });
  } catch (error) {
    console.error("Error creating newsletter:", error);
    return serverError();
  }
}
