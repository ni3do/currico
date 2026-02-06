import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, badRequest, notFound, forbidden } from "@/lib/api";
import { z } from "zod";

const addItemSchema = z.object({
  resourceId: z.string().min(1),
  position: z.number().int().min(0).optional(),
});

const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      position: z.number().int().min(0),
    })
  ),
});

/**
 * POST /api/collections/[id]/items
 * Add a resource to a collection
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { id: collectionId } = await params;
    const body = await request.json();
    const validation = addItemSchema.safeParse(body);

    if (!validation.success) {
      return badRequest("Ungültige Eingabe", {
        details: validation.error.flatten().fieldErrors,
      });
    }

    const { resourceId, position } = validation.data;

    // Check collection ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { owner_id: true },
    });

    if (!collection) {
      return notFound("Sammlung nicht gefunden");
    }

    if (collection.owner_id !== userId) {
      return forbidden("Sie können nur Ihre eigenen Sammlungen bearbeiten");
    }

    // Check if resource exists and belongs to user (sellers can only add their own resources)
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true, seller_id: true, is_published: true },
    });

    if (!resource) {
      return notFound("Material nicht gefunden");
    }

    if (resource.seller_id !== userId) {
      return forbidden("Sie können nur Ihre eigenen Materialien zu Sammlungen hinzufügen");
    }

    // Check if already in collection
    const existing = await prisma.collectionItem.findUnique({
      where: {
        collection_id_resource_id: {
          collection_id: collectionId,
          resource_id: resourceId,
        },
      },
    });

    if (existing) {
      return badRequest("Dieses Material ist bereits in der Sammlung");
    }

    // Get max position if not provided
    let itemPosition = position;
    if (itemPosition === undefined) {
      const maxPosition = await prisma.collectionItem.aggregate({
        where: { collection_id: collectionId },
        _max: { position: true },
      });
      itemPosition = (maxPosition._max.position ?? -1) + 1;
    }

    const item = await prisma.collectionItem.create({
      data: {
        collection_id: collectionId,
        resource_id: resourceId,
        position: itemPosition,
      },
      include: {
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
    });

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        position: item.position,
        resource: item.resource,
      },
    });
  } catch (error) {
    console.error("Error adding item to collection:", error);
    return NextResponse.json({ error: "Fehler beim Hinzufügen zur Sammlung" }, { status: 500 });
  }
}

/**
 * PATCH /api/collections/[id]/items
 * Reorder items in a collection
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { id: collectionId } = await params;
    const body = await request.json();
    const validation = reorderItemsSchema.safeParse(body);

    if (!validation.success) {
      return badRequest("Ungültige Eingabe", {
        details: validation.error.flatten().fieldErrors,
      });
    }

    // Check collection ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { owner_id: true },
    });

    if (!collection) {
      return notFound("Sammlung nicht gefunden");
    }

    if (collection.owner_id !== userId) {
      return forbidden("Sie können nur Ihre eigenen Sammlungen bearbeiten");
    }

    // Update positions in transaction
    await prisma.$transaction(
      validation.data.items.map((item) =>
        prisma.collectionItem.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Reihenfolge aktualisiert",
    });
  } catch (error) {
    console.error("Error reordering collection items:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren der Reihenfolge" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/collections/[id]/items?itemId=...
 * Remove an item from a collection
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { id: collectionId } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return badRequest("itemId ist erforderlich");
    }

    // Check collection ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { owner_id: true },
    });

    if (!collection) {
      return notFound("Sammlung nicht gefunden");
    }

    if (collection.owner_id !== userId) {
      return forbidden("Sie können nur Ihre eigenen Sammlungen bearbeiten");
    }

    // Delete the item
    await prisma.collectionItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: "Material aus Sammlung entfernt",
    });
  } catch (error) {
    console.error("Error removing item from collection:", error);
    return NextResponse.json({ error: "Fehler beim Entfernen aus der Sammlung" }, { status: 500 });
  }
}
