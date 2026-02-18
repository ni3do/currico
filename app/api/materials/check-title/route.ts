import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, serverError } from "@/lib/api";

/**
 * GET /api/materials/check-title?title=...
 * Check if the current user already has a material with the same or similar title.
 * Returns { exists: boolean, matchType?: "exact" | "similar", existingTitle?: string, existingId?: string, similarity?: number }
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const title = request.nextUrl.searchParams.get("title");
    const excludeId = request.nextUrl.searchParams.get("excludeId");
    if (!title || title.trim().length < 3) {
      return NextResponse.json({ exists: false });
    }

    const trimmedTitle = title.trim();

    // Tier 1: Exact case-insensitive match
    const exact = await prisma.resource.findFirst({
      where: {
        seller_id: userId,
        title: { equals: trimmedTitle, mode: "insensitive" },
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true, title: true },
    });

    if (exact) {
      return NextResponse.json({
        exists: true,
        matchType: "exact",
        existingTitle: exact.title,
        existingId: exact.id,
      });
    }

    // Tier 2: Fuzzy match using pg_trgm word_similarity (already enabled for search)
    const similar = await prisma.$queryRaw<{ id: string; title: string; similarity: number }[]>`
      SELECT id, title, word_similarity(${trimmedTitle}, title) AS similarity
      FROM resources
      WHERE seller_id = ${userId}
        AND word_similarity(${trimmedTitle}, title) > 0.4
        ${excludeId ? Prisma.sql`AND id != ${excludeId}` : Prisma.empty}
      ORDER BY similarity DESC
      LIMIT 1
    `;

    if (similar.length > 0) {
      return NextResponse.json({
        exists: true,
        matchType: "similar",
        existingTitle: similar[0].title,
        existingId: similar[0].id,
        similarity: Math.round(similar[0].similarity * 100) / 100,
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error("Error checking title:", error);
    return serverError("CHECK_FAILED");
  }
}
