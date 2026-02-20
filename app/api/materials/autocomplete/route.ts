import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";
import { sanitizeSearchQuery } from "@/lib/search-utils";

/**
 * GET /api/materials/autocomplete
 * Lightweight endpoint returning up to 6 matching material titles for typeahead.
 *
 * Query params:
 *   - q: search query (min 2 chars)
 */
export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, "materials:list");

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests", code: "RATE_LIMITED" },
      { status: 429, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const sanitized = sanitizeSearchQuery(q);
  if (!sanitized) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // Use ILIKE for fast prefix/contains matching on titles
    const results = await prisma.$queryRaw<
      { id: string; title: string; price_cents: number; subjects: string }[]
    >`
      SELECT id, title, price_cents, subjects::text
      FROM resources
      WHERE is_published = true AND is_public = true
        AND title ILIKE '%' || ${sanitized} || '%'
      ORDER BY
        CASE WHEN title ILIKE ${sanitized} || '%' THEN 0 ELSE 1 END,
        title
      LIMIT 6
    `;

    const suggestions = results.map((r) => ({
      id: r.id,
      title: r.title,
      price: r.price_cents,
      subject: (() => {
        try {
          const arr = JSON.parse(r.subjects);
          return Array.isArray(arr) ? arr[0] || null : null;
        } catch {
          return null;
        }
      })(),
    }));

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
