import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api";

/**
 * GET /api/drafts?type=material
 * Fetch the latest draft for the current user
 */
export async function GET(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "material";

    const draft = await prisma.draft.findUnique({
      where: {
        user_id_type: {
          user_id: userId,
          type,
        },
      },
      select: {
        id: true,
        type: true,
        data: true,
        updated_at: true,
      },
    });

    if (!draft) {
      return NextResponse.json({ draft: null });
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("Error fetching draft:", error);
    return NextResponse.json({ error: "Fehler beim Laden des Entwurfs" }, { status: 500 });
  }
}

/**
 * POST /api/drafts
 * Create or update a draft (upsert by userId + type)
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: "Typ und Daten sind erforderlich" }, { status: 400 });
    }

    if (!["material", "bundle"].includes(type)) {
      return NextResponse.json({ error: "Ungültiger Entwurfstyp" }, { status: 400 });
    }

    const draft = await prisma.draft.upsert({
      where: {
        user_id_type: {
          user_id: userId,
          type,
        },
      },
      create: {
        user_id: userId,
        type,
        data,
      },
      update: {
        data,
      },
      select: {
        id: true,
        updated_at: true,
      },
    });

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json({ error: "Fehler beim Speichern des Entwurfs" }, { status: 500 });
  }
}
