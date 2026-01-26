import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray, toNumberArray } from "@/lib/json-array";

/**
 * GET /api/curriculum
 *
 * Fetches curriculum data for the upload form.
 * Query params:
 *   - curriculum: "LP21" | "PER" (default: LP21)
 *   - subject: subject code to filter competencies (e.g., "MA")
 *   - cycle: cycle number to filter competencies (1, 2, 3)
 *   - canton: canton code to filter lehrmittel (e.g., "ZH")
 *   - includeTransversal: "true" to include transversal competencies
 *   - includeBne: "true" to include BNE themes
 *   - hierarchical: "true" to return nested tree structure
 *   - anforderungsstufe: "grund" | "erweitert" | "all" (default: all)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const curriculumCode = searchParams.get("curriculum") || "LP21";
    const subjectCode = searchParams.get("subject");
    const cycle = searchParams.get("cycle");
    const canton = searchParams.get("canton");
    const includeTransversal = searchParams.get("includeTransversal") === "true";
    const includeBne = searchParams.get("includeBne") === "true";
    const hierarchical = searchParams.get("hierarchical") === "true";
    const anforderungsstufe = searchParams.get("anforderungsstufe") || "all";

    // Fetch curriculum with subjects
    const curriculum = await prisma.curriculum.findUnique({
      where: { code: curriculumCode },
      include: {
        subjects: {
          orderBy: { code: "asc" },
        },
      },
    });

    if (!curriculum) {
      return NextResponse.json({ error: "Curriculum not found" }, { status: 404 });
    }

    // Build competencies query
    const competenciesWhere: {
      subject?: { curriculum_id: string; code?: string };
      cycle?: number;
      anforderungsstufe?: string | { in: string[] } | null;
    } = {};

    if (subjectCode) {
      competenciesWhere.subject = {
        curriculum_id: curriculum.id,
        code: subjectCode,
      };
    } else {
      competenciesWhere.subject = {
        curriculum_id: curriculum.id,
      };
    }

    if (cycle) {
      competenciesWhere.cycle = parseInt(cycle, 10);
    }

    if (anforderungsstufe !== "all") {
      competenciesWhere.anforderungsstufe = anforderungsstufe;
    }

    // Fetch competencies
    const competencies = await prisma.curriculumCompetency.findMany({
      where: competenciesWhere,
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
        children: hierarchical
          ? {
              select: {
                id: true,
                code: true,
                description_de: true,
                description_fr: true,
                cycle: true,
                kompetenzbereich: true,
                handlungsaspekt: true,
                anforderungsstufe: true,
              },
            }
          : false,
      },
    });

    // Build lehrmittel query - for MySQL with JSON columns, use raw SQL for filtering
    let lehrmittelIds: string[] | null = null;

    if ((canton && canton !== "all") || cycle) {
      const conditions: string[] = [];
      const params: string[] = [];

      if (subjectCode) {
        conditions.push(`subject = ?`);
        params.push(subjectCode);
      }

      if (canton && canton !== "all") {
        conditions.push(`JSON_CONTAINS(cantons, ?)`);
        params.push(JSON.stringify(canton));
      }

      if (cycle) {
        conditions.push(`JSON_CONTAINS(cycles, ?)`);
        params.push(JSON.stringify(parseInt(cycle, 10)));
      }

      const sqlConditions = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const query = `SELECT id FROM lehrmittel ${sqlConditions}`;
      const results = await prisma.$queryRawUnsafe<{ id: string }[]>(query, ...params);
      lehrmittelIds = results.map((r) => r.id);
    }

    // Fetch lehrmittel
    const lehrmittelWhere: Record<string, unknown> = {};
    if (subjectCode && !lehrmittelIds) {
      lehrmittelWhere.subject = subjectCode;
    }
    if (lehrmittelIds !== null) {
      lehrmittelWhere.id = { in: lehrmittelIds };
    }

    const lehrmittelResults = await prisma.lehrmittel.findMany({
      where: lehrmittelWhere,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        publisher: true,
        subject: true,
        cantons: true,
        cycles: true,
      },
    });

    // Transform lehrmittel to use proper arrays
    const lehrmittel = lehrmittelResults.map((l) => ({
      ...l,
      cantons: toStringArray(l.cantons),
      cycles: toNumberArray(l.cycles),
    }));

    // Group competencies by kompetenzbereich for better UI
    type GroupedCompetency = {
      id: string;
      code: string;
      description_de: string;
      description_fr: string | null;
      cycle: number;
      kompetenzbereich: string | null;
      handlungsaspekt: string | null;
      anforderungsstufe: string | null;
      subject: {
        code: string;
        name_de: string;
        color: string | null;
        icon: string | null;
      };
    };

    const groupedCompetencies = competencies.reduce(
      (acc, comp) => {
        const key = comp.kompetenzbereich || "Andere";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push({
          id: comp.id,
          code: comp.code,
          description_de: comp.description_de,
          description_fr: comp.description_fr,
          cycle: comp.cycle,
          kompetenzbereich: comp.kompetenzbereich,
          handlungsaspekt: comp.handlungsaspekt,
          anforderungsstufe: comp.anforderungsstufe,
          subject: comp.subject,
        });
        return acc;
      },
      {} as Record<string, GroupedCompetency[]>
    );

    // Build hierarchical tree structure if requested
    let hierarchicalTree = null;
    if (hierarchical) {
      // Group by subject -> kompetenzbereich -> handlungsaspekt
      hierarchicalTree = curriculum.subjects.map((subject) => {
        const subjectCompetencies = competencies.filter((c) => c.subject.code === subject.code);

        const bereiche = Array.from(
          new Set(subjectCompetencies.map((c) => c.kompetenzbereich))
        ).filter(Boolean);

        return {
          code: subject.code,
          name_de: subject.name_de,
          name_fr: subject.name_fr,
          color: subject.color,
          icon: subject.icon,
          kompetenzbereiche: bereiche.map((bereich) => {
            const bereichCompetencies = subjectCompetencies.filter(
              (c) => c.kompetenzbereich === bereich
            );
            const aspekte = Array.from(
              new Set(bereichCompetencies.map((c) => c.handlungsaspekt))
            ).filter(Boolean);

            return {
              name: bereich,
              handlungsaspekte: aspekte.map((aspekt) => ({
                name: aspekt,
                competencies: bereichCompetencies
                  .filter((c) => c.handlungsaspekt === aspekt)
                  .map((c) => ({
                    id: c.id,
                    code: c.code,
                    description_de: c.description_de,
                    description_fr: c.description_fr,
                    cycle: c.cycle,
                    anforderungsstufe: c.anforderungsstufe,
                  })),
              })),
              competencies: bereichCompetencies
                .filter((c) => !c.handlungsaspekt)
                .map((c) => ({
                  id: c.id,
                  code: c.code,
                  description_de: c.description_de,
                  description_fr: c.description_fr,
                  cycle: c.cycle,
                  anforderungsstufe: c.anforderungsstufe,
                })),
            };
          }),
        };
      });
    }

    // Fetch transversal competencies if requested
    let transversalCompetencies = null;
    if (includeTransversal) {
      transversalCompetencies = await prisma.transversalCompetency.findMany({
        orderBy: { code: "asc" },
        select: {
          id: true,
          code: true,
          category: true,
          name_de: true,
          name_fr: true,
          description_de: true,
          description_fr: true,
          icon: true,
          color: true,
        },
      });
    }

    // Fetch BNE themes if requested
    let bneThemes = null;
    if (includeBne) {
      bneThemes = await prisma.bneTheme.findMany({
        orderBy: { code: "asc" },
        select: {
          id: true,
          code: true,
          name_de: true,
          name_fr: true,
          description_de: true,
          description_fr: true,
          sdg_number: true,
          icon: true,
          color: true,
        },
      });
    }

    return NextResponse.json({
      curriculum: {
        code: curriculum.code,
        name_de: curriculum.name_de,
        name_fr: curriculum.name_fr,
      },
      subjects: curriculum.subjects.map((s) => ({
        id: s.id,
        code: s.code,
        name_de: s.name_de,
        name_fr: s.name_fr,
        color: s.color,
        icon: s.icon,
      })),
      competencies: competencies.map((c) => ({
        id: c.id,
        code: c.code,
        description_de: c.description_de,
        description_fr: c.description_fr,
        cycle: c.cycle,
        kompetenzbereich: c.kompetenzbereich,
        handlungsaspekt: c.handlungsaspekt,
        anforderungsstufe: c.anforderungsstufe,
        subject: c.subject,
      })),
      groupedCompetencies,
      hierarchicalTree,
      lehrmittel,
      transversalCompetencies,
      bneThemes,
    });
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    return NextResponse.json({ error: "Failed to fetch curriculum data" }, { status: 500 });
  }
}
