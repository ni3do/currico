import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, forbiddenResponse } from "@/lib/admin-auth";
import { badRequest, serverError } from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { createNewsletterSchema } from "@/lib/validations/admin";

/**
 * GET /api/admin/newsletters
 * List all newsletters ordered by created_at desc
 * Access: ADMIN only
 */
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse();
    }

    const newsletters = await prisma.newsletter.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(newsletters);
  } catch (error) {
    captureError("Error fetching newsletters:", error);
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
      return forbiddenResponse();
    }

    const body = await request.json();
    const parsed = createNewsletterSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid input", { details: parsed.error.flatten().fieldErrors });
    }
    const { subject, content } = parsed.data;

    const newsletter = await prisma.newsletter.create({
      data: {
        subject,
        content,
        status: "DRAFT",
      },
    });

    return NextResponse.json(newsletter, { status: 201 });
  } catch (error) {
    captureError("Error creating newsletter:", error);
    return serverError();
  }
}
