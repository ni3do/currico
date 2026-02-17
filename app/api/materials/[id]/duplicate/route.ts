import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { badRequest } from "@/lib/api";
import { checkRateLimit, isValidId } from "@/lib/rateLimit";

/**
 * POST /api/materials/[id]/duplicate
 * Duplicate a material owned by the current user.
 * Copies metadata, file reference, and curriculum associations.
 * New material starts as PENDING status.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(userId, "resources:duplicate");
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID");

    // Fetch the original material with all relations
    const original = await prisma.resource.findUnique({
      where: { id },
      include: {
        competencies: true,
        lehrmittel: true,
        transversals: true,
        bne_themes: true,
      },
    });

    if (!original) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    // Only the owner can duplicate their own material
    if (original.seller_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create the duplicate with copied fields
    const duplicate = await prisma.resource.create({
      data: {
        title: `${original.title} (Kopie)`.slice(0, 64),
        description: original.description,
        price: original.price,
        file_url: original.file_url,
        preview_url: original.preview_url,
        preview_urls: original.preview_urls ?? undefined,
        preview_count: original.preview_count,
        subjects: original.subjects ?? undefined,
        cycles: original.cycles ?? undefined,
        is_published: false,
        is_approved: false,
        status: "PENDING",
        is_public: false,
        eszett_checked: original.eszett_checked,
        swiss_verified: false,
        language: original.language,
        dialect: original.dialect,
        seller_id: userId,
        // Copy curriculum associations
        competencies: {
          create: original.competencies.map((c) => ({
            competency_id: c.competency_id,
          })),
        },
        lehrmittel: {
          create: original.lehrmittel.map((l) => ({
            lehrmittel_id: l.lehrmittel_id,
          })),
        },
        transversals: {
          create: original.transversals.map((t) => ({
            transversal_id: t.transversal_id,
          })),
        },
        bne_themes: {
          create: original.bne_themes.map((b) => ({
            bne_id: b.bne_id,
          })),
        },
      },
    });

    return NextResponse.json({
      id: duplicate.id,
      title: duplicate.title,
    });
  } catch (error) {
    console.error("Error duplicating material:", error);
    return NextResponse.json({ error: "Failed to duplicate material" }, { status: 500 });
  }
}
