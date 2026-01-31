import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray, toNumberArray } from "@/lib/json-array";

// Static ZYKLEN data - these don't change
const ZYKLEN = [
  {
    id: 1,
    name: "Zyklus 1",
    shortName: "Z1",
    grades: ["KG", "1", "2"],
    description: "Kindergarten – 2. Klasse",
  },
  {
    id: 2,
    name: "Zyklus 2",
    shortName: "Z2",
    grades: ["3", "4", "5", "6"],
    description: "3. – 6. Klasse",
  },
  {
    id: 3,
    name: "Zyklus 3",
    shortName: "Z3",
    grades: ["7", "8", "9"],
    description: "7. – 9. Klasse",
  },
];

/**
 * GET /api/curriculum
 *
 * Fetches curriculum data for the upload form.
 * Query params:
 *   - format: "filter" to return data structured for LP21FilterSidebar
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
    const format = searchParams.get("format");

    // Handle filter format for LP21FilterSidebar
    if (format === "filter") {
      return handleFilterFormat();
    }

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

    // Build lehrmittel query - for PostgreSQL with JSONB columns, use raw SQL for filtering
    let lehrmittelIds: string[] | null = null;

    if ((canton && canton !== "all") || cycle) {
      const conditions: string[] = [];
      const params: (string | number)[] = [];
      let paramIndex = 1;

      if (subjectCode) {
        conditions.push(`subject = $${paramIndex}`);
        params.push(subjectCode);
        paramIndex++;
      }

      if (canton && canton !== "all") {
        conditions.push(`cantons::jsonb @> $${paramIndex}::jsonb`);
        params.push(JSON.stringify(canton));
        paramIndex++;
      }

      if (cycle) {
        conditions.push(`cycles::jsonb @> $${paramIndex}::jsonb`);
        params.push(JSON.stringify(parseInt(cycle, 10)));
        paramIndex++;
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

/**
 * Handle format=filter request for LP21FilterSidebar
 * Returns data structured for the filter sidebar with nested hierarchy
 */
async function handleFilterFormat() {
  try {
    // Fetch LP21 curriculum with all subjects and competencies
    const curriculum = await prisma.curriculum.findUnique({
      where: { code: "LP21" },
      include: {
        subjects: {
          orderBy: { code: "asc" },
          include: {
            competencies: {
              orderBy: { code: "asc" },
            },
          },
        },
      },
    });

    if (!curriculum) {
      return NextResponse.json({ error: "LP21 curriculum not found" }, { status: 404 });
    }

    // Color class mapping based on subject code
    const colorClassMap: Record<string, string> = {
      D: "subject-deutsch",
      FS: "subject-fremdsprachen",
      FS1E: "subject-fremdsprachen",
      FS2F: "subject-fremdsprachen",
      MA: "subject-mathe",
      NMG: "subject-nmg",
      NT: "subject-nt",
      WAH: "subject-wah",
      RZG: "subject-rzg",
      ERG: "subject-erg",
      BG: "subject-gestalten",
      TTG: "subject-ttg",
      MU: "subject-musik",
      BS: "subject-sport",
      MI: "subject-medien",
      BO: "subject-bo",
      PU: "subject-pu",
    };

    // Short name mapping
    const shortNameMap: Record<string, string> = {
      D: "DE",
      FS: "FS",
      FS1E: "English",
      FS2F: "Französisch",
      MA: "MA",
      NMG: "NMG",
      NT: "NT",
      WAH: "WAH",
      RZG: "RZG",
      ERG: "ERG",
      BG: "BG",
      TTG: "TTG",
      MU: "MU",
      BS: "BS",
      MI: "MI",
      BO: "BO",
      PU: "PU",
    };

    // Transform subjects into Fachbereiche with nested hierarchy
    const fachbereiche = curriculum.subjects.map((subject) => {
      // Get all unique cycles from competencies
      const cycles = [...new Set(subject.competencies.map((c) => c.cycle))].sort();

      // Group competencies by kompetenzbereich
      const kompetenzbereichMap = new Map<
        string,
        { code: string; name: string; kompetenzen: { code: string; name: string }[] }
      >();

      for (const comp of subject.competencies) {
        if (!comp.kompetenzbereich) continue;

        // The kompetenzbereich code should be like "D.1", "MA.2", etc.
        const kbCode = comp.kompetenzbereich;

        if (!kompetenzbereichMap.has(kbCode)) {
          // Find the parent competency that represents the kompetenzbereich
          const parentComp = subject.competencies.find(
            (c) => c.code.startsWith(kbCode + "_") && !c.handlungsaspekt
          );
          kompetenzbereichMap.set(kbCode, {
            code: kbCode,
            name: parentComp?.description_de || kbCode,
            kompetenzen: [],
          });
        }

        // Add individual kompetenzen (those with handlungsaspekt)
        if (comp.handlungsaspekt) {
          const kb = kompetenzbereichMap.get(kbCode)!;
          // Extract the base code without the cycle suffix
          const baseCode = comp.handlungsaspekt;
          // Only add if not already present (avoid duplicates across cycles)
          if (!kb.kompetenzen.some((k) => k.code === baseCode)) {
            kb.kompetenzen.push({
              code: baseCode,
              name: comp.description_de,
            });
          }
        }
      }

      return {
        code: subject.code,
        name: subject.name_de,
        shortName: shortNameMap[subject.code] || subject.code,
        color: subject.color || "#7c7f93",
        colorClass: colorClassMap[subject.code] || "subject-default",
        icon: subject.icon || "book-open",
        cycles,
        kompetenzbereiche: Array.from(kompetenzbereichMap.values()),
      };
    });

    return NextResponse.json({
      zyklen: ZYKLEN,
      fachbereiche,
    });
  } catch (error) {
    console.error("Error fetching curriculum filter data:", error);
    return NextResponse.json({ error: "Failed to fetch curriculum filter data" }, { status: 500 });
  }
}
