import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, badRequest } from "@/lib/api";
import { z } from "zod";

const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  is_public: z.boolean().default(true),
});

/**
 * GET /api/collections
 * Get current user's collections
 */
export async function GET() {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const collections = await prisma.collection.findMany({
      where: { owner_id: userId },
      select: {
        id: true,
        name: true,
        description: true,
        is_public: true,
        position: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: { items: true },
        },
        items: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            position: true,
            resource: {
              select: {
                id: true,
                title: true,
                preview_url: true,
                price: true,
                subjects: true,
              },
            },
          },
        },
      },
      orderBy: { position: "asc" },
    });

    const transformedCollections = collections.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      is_public: c.is_public,
      position: c.position,
      created_at: c.created_at,
      updated_at: c.updated_at,
      itemCount: c._count.items,
      items: c.items.map((i) => ({
        id: i.id,
        position: i.position,
        resource: i.resource,
      })),
    }));

    return NextResponse.json({ collections: transformedCollections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Sammlungen" }, { status: 500 });
  }
}

/**
 * POST /api/collections
 * Create a new collection
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();
    const validation = createCollectionSchema.safeParse(body);

    if (!validation.success) {
      return badRequest("Ungültige Eingabe", {
        details: validation.error.flatten().fieldErrors,
      });
    }

    const { name, description, is_public } = validation.data;

    // Get max position
    const maxPosition = await prisma.collection.aggregate({
      where: { owner_id: userId },
      _max: { position: true },
    });

    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        is_public,
        position: (maxPosition._max.position ?? -1) + 1,
        owner_id: userId,
      },
    });

    return NextResponse.json({
      success: true,
      collection,
    });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen der Sammlung" }, { status: 500 });
  }
}
