import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimited, badRequest, serverError } from "@/lib/api";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { captureError } from "@/lib/api-error";

/**
 * GET /api/curriculum/search
 *
 * Search LP21 competencies by code or text.
 * Supports fuzzy matching for LP21 codes (e.g., "D.4.A.1", "D 4 A 1", "D4A1").
 *
 * Query params:
 *   - q: search query (required)
 *   - type: "code" | "text" | "all" (default: all)
 *   - limit: max results (default: 20)
 *   - cycle: filter by cycle (1, 2, 3)
 *   - subject: filter by subject code (e.g., "MA")
 */
export async function GET(request: Request) {
  try {
    const rateLimit = checkRateLimit(getClientIP(request), "curriculum:search");
    if (!rateLimit.success) {
      return rateLimited();
    }
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "all";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const cycle = searchParams.get("cycle");
    const subjectCode = searchParams.get("subject");

    if (!query || query.length < 2) {
      return badRequest("Query too short");
    }

    // Normalize LP21 code for search (remove spaces, dots, convert to uppercase)
    const normalizedCode = query.replace(/[\s.]/g, "").toUpperCase();

    // Build where clause
    const whereClause: {
      OR?: Array<Record<string, unknown>>;
      cycle?: number;
      subject?: { code: string };
    } = {};

    // Build search conditions based on type
    const searchConditions: Array<Record<string, unknown>> = [];

    if (type === "code" || type === "all") {
      // Search by exact code match (MySQL collation is case-insensitive by default)
      searchConditions.push({
        code: {
          contains: query.toUpperCase(),
        },
      });

      // Search by normalized code (without dots/spaces)
      // This handles formats like "D4A1" matching "D.4.A.1"
      // We need to search by a pattern that matches the normalized version
    }

    if (type === "text" || type === "all") {
      // Search in description (MySQL collation is case-insensitive by default)
      searchConditions.push({
        description_de: {
          contains: query,
        },
      });
      searchConditions.push({
        description_fr: {
          contains: query,
        },
      });
      // Search in kompetenzbereich
      searchConditions.push({
        kompetenzbereich: {
          contains: query,
        },
      });
    }

    whereClause.OR = searchConditions;

    if (cycle) {
      whereClause.cycle = parseInt(cycle, 10);
    }

    if (subjectCode) {
      whereClause.subject = { code: subjectCode };
    }

    // Fetch matching competencies
    const competencies = await prisma.curriculumCompetency.findMany({
      where: whereClause,
      take: limit,
      orderBy: { code: "asc" },
      include: {
        subject: {
          select: {
            code: true,
            name_de: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    // Filter results by normalized code if the query looks like an LP21 code
    const isCodeQuery = /^[A-Z]{1,3}[.\s]?\d/.test(query.toUpperCase());
    let filteredCompetencies = competencies;

    if (isCodeQuery && normalizedCode.length >= 2) {
      // Additionally filter by normalized code pattern
      filteredCompetencies = competencies.filter((c) => {
        const normalizedCompCode = c.code.replace(/[\s.]/g, "").toUpperCase();
        return normalizedCompCode.includes(normalizedCode);
      });

      // If no results, fall back to original results
      if (filteredCompetencies.length === 0) {
        filteredCompetencies = competencies;
      }
    }

    // Also search transversal competencies if query matches pattern
    let transversalResults: Array<{
      id: string;
      code: string;
      category: string;
      name_de: string;
      name_fr: string | null;
      description_de: string;
      icon: string | null;
      color: string | null;
      type: "transversal";
    }> = [];

    if (type === "all" || type === "text") {
      const transversals = await prisma.transversalCompetency.findMany({
        where: {
          OR: [
            { code: { contains: query.toUpperCase() } },
            { name_de: { contains: query } },
            { description_de: { contains: query } },
          ],
        },
        take: 10,
        orderBy: { code: "asc" },
      });

      transversalResults = transversals.map((t) => ({
        ...t,
        type: "transversal" as const,
      }));
    }

    // Also search BNE themes
    let bneResults: Array<{
      id: string;
      code: string;
      name_de: string;
      name_fr: string | null;
      description_de: string;
      sdg_number: number | null;
      icon: string | null;
      color: string | null;
      type: "bne";
    }> = [];

    if (type === "all" || type === "text") {
      const bneThemes = await prisma.bneTheme.findMany({
        where: {
          OR: [
            { code: { contains: query.toUpperCase() } },
            { name_de: { contains: query } },
            { description_de: { contains: query } },
          ],
        },
        take: 10,
        orderBy: { code: "asc" },
      });

      bneResults = bneThemes.map((b) => ({
        ...b,
        type: "bne" as const,
      }));
    }

    return NextResponse.json({
      query,
      normalizedCode: isCodeQuery ? normalizedCode : null,
      competencies: filteredCompetencies.map((c) => ({
        id: c.id,
        code: c.code,
        description_de: c.description_de,
        description_fr: c.description_fr,
        cycle: c.cycle,
        kompetenzbereich: c.kompetenzbereich,
        handlungsaspekt: c.handlungsaspekt,
        anforderungsstufe: c.anforderungsstufe,
        subject: c.subject,
        type: "competency",
      })),
      transversalCompetencies: transversalResults,
      bneThemes: bneResults,
      total: filteredCompetencies.length + transversalResults.length + bneResults.length,
    });
  } catch (error) {
    captureError("Error searching curriculum:", error);
    return serverError();
  }
}
