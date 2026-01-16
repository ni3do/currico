import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/curriculum
 *
 * Fetches curriculum data for the upload form.
 * Query params:
 *   - curriculum: "LP21" | "PER" (default: LP21)
 *   - subject: subject code to filter competencies (e.g., "MA")
 *   - cycle: cycle number to filter competencies (1, 2, 3)
 *   - canton: canton code to filter lehrmittel (e.g., "ZH")
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const curriculumCode = searchParams.get("curriculum") || "LP21";
    const subjectCode = searchParams.get("subject");
    const cycle = searchParams.get("cycle");
    const canton = searchParams.get("canton");

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
      return NextResponse.json(
        { error: "Curriculum not found" },
        { status: 404 }
      );
    }

    // Build competencies query
    const competenciesWhere: {
      subject?: { curriculum_id: string; code: string };
      cycle?: number;
    } = {};

    if (subjectCode) {
      competenciesWhere.subject = {
        curriculum_id: curriculum.id,
        code: subjectCode,
      };
    }

    if (cycle) {
      competenciesWhere.cycle = parseInt(cycle, 10);
    }

    // Fetch competencies (only if subject is selected)
    let competencies: {
      id: string;
      code: string;
      description_de: string;
      description_fr: string | null;
      cycle: number;
      kompetenzbereich: string | null;
      handlungsaspekt: string | null;
    }[] = [];

    if (subjectCode) {
      competencies = await prisma.curriculumCompetency.findMany({
        where: competenciesWhere,
        orderBy: { code: "asc" },
        select: {
          id: true,
          code: true,
          description_de: true,
          description_fr: true,
          cycle: true,
          kompetenzbereich: true,
          handlungsaspekt: true,
        },
      });
    }

    // Build lehrmittel query
    const lehrmittelWhere: {
      subject?: string;
      cantons?: { has: string };
      cycles?: { has: number };
    } = {};

    if (subjectCode) {
      lehrmittelWhere.subject = subjectCode;
    }

    if (canton && canton !== "all") {
      lehrmittelWhere.cantons = { has: canton };
    }

    if (cycle) {
      lehrmittelWhere.cycles = { has: parseInt(cycle, 10) };
    }

    // Fetch lehrmittel
    const lehrmittel = await prisma.lehrmittel.findMany({
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

    // Group competencies by kompetenzbereich for better UI
    const groupedCompetencies = competencies.reduce(
      (acc, comp) => {
        const key = comp.kompetenzbereich || "Andere";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(comp);
        return acc;
      },
      {} as Record<string, typeof competencies>
    );

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
      })),
      competencies,
      groupedCompetencies,
      lehrmittel,
    });
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    return NextResponse.json(
      { error: "Failed to fetch curriculum data" },
      { status: 500 }
    );
  }
}
