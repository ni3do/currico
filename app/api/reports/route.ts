import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, badRequest, notFound } from "@/lib/api";
import { z } from "zod";

const createReportSchema = z
  .object({
    reason: z.enum(["copyright", "inappropriate", "spam", "fraud", "quality", "other"]),
    description: z.string().max(1000).optional(),
    resource_id: z.string().optional(),
    reported_user_id: z.string().optional(),
  })
  .refine((data) => data.resource_id || data.reported_user_id, {
    message: "Entweder resource_id oder reported_user_id muss angegeben werden",
  });

/**
 * POST /api/reports
 * Submit a report for a resource or user
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();
    const validation = createReportSchema.safeParse(body);

    if (!validation.success) {
      return badRequest("Ungültige Eingabe", {
        details: validation.error.flatten().fieldErrors,
      });
    }

    const { reason, description, resource_id, reported_user_id } = validation.data;

    // Validate that the referenced resource exists
    if (resource_id) {
      const resource = await prisma.resource.findUnique({
        where: { id: resource_id },
        select: { id: true },
      });
      if (!resource) {
        return notFound("Material nicht gefunden");
      }
    }

    // Validate that the referenced user exists
    if (reported_user_id) {
      const user = await prisma.user.findUnique({
        where: { id: reported_user_id },
        select: { id: true },
      });
      if (!user) {
        return notFound();
      }
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        reason,
        description,
        resource_id,
        reported_user_id,
        reporter_id: userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        report: {
          id: report.id,
          created_at: report.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen der Meldung" }, { status: 500 });
  }
}
