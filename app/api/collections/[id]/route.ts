import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, badRequest, notFound, forbidden } from "@/lib/api";
import { z } from "zod";

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  is_public: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

/**
 * GET /api/collections/[id]
 * Get a single collection with all items
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const collection = await prisma.collection.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        is_public: true,
        position: true,
        created_at: true,
        updated_at: true,
        owner_id: true,
        owner: {
          select: {
            id: true,
            name: true,
            display_name: true,
            image: true,
          },
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
                description: true,
                preview_url: true,
                price: true,
                subjects: true,
                cycles: true,
              },
            },
          },
        },
      },
    });

    if (!collection) {
      return notFound("Sammlung nicht gefunden");
    }

    // Check access - public collections are viewable by all
    // Private collections only viewable by owner
    const userId = await requireAuth();
    if (!collection.is_public && collection.owner_id !== userId) {
      return forbidden("Diese Sammlung ist privat");
    }

    return NextResponse.json({
      collection: {
        ...collection,
        itemCount: collection.items.length,
      },
    });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Sammlung" }, { status: 500 });
  }
}

/**
 * PATCH /api/collections/[id]
 * Update a collection
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateCollectionSchema.safeParse(body);

    if (!validation.success) {
      return badRequest("Ungültige Eingabe", {
        details: validation.error.flatten().fieldErrors,
      });
    }

    // Check ownership
    const existing = await prisma.collection.findUnique({
      where: { id },
      select: { owner_id: true },
    });

    if (!existing) {
      return notFound("Sammlung nicht gefunden");
    }

    if (existing.owner_id !== userId) {
      return forbidden("Sie können nur Ihre eigenen Sammlungen bearbeiten");
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({
      success: true,
      collection,
    });
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren der Sammlung" }, { status: 500 });
  }
}

/**
 * DELETE /api/collections/[id]
 * Delete a collection
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { id } = await params;

    // Check ownership
    const existing = await prisma.collection.findUnique({
      where: { id },
      select: { owner_id: true },
    });

    if (!existing) {
      return notFound("Sammlung nicht gefunden");
    }

    if (existing.owner_id !== userId) {
      return forbidden("Sie können nur Ihre eigenen Sammlungen löschen");
    }

    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Sammlung gelöscht",
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ error: "Fehler beim Löschen der Sammlung" }, { status: 500 });
  }
}
