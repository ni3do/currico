import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAuth,
  unauthorized,
  badRequest,
  notFound,
  forbidden,
  serverError,
  API_ERROR_CODES,
} from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { isValidId } from "@/lib/rateLimit";
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
    if (!isValidId(collectionId))
      return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);
    const body = await request.json();
    const validation = addItemSchema.safeParse(body);

    if (!validation.success) {
      return badRequest(
        "Invalid input",
        {
          details: validation.error.flatten().fieldErrors,
        },
        API_ERROR_CODES.INVALID_INPUT
      );
    }

    const { resourceId, position } = validation.data;

    // Check collection ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { owner_id: true },
    });

    if (!collection) {
      return notFound();
    }

    if (collection.owner_id !== userId) {
      return forbidden("Own collection only", API_ERROR_CODES.OWN_COLLECTION_ONLY);
    }

    // Check if resource exists and belongs to user (sellers can only add their own resources)
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true, seller_id: true, is_published: true },
    });

    if (!resource) {
      return notFound();
    }

    if (resource.seller_id !== userId) {
      return forbidden("Own material only", API_ERROR_CODES.FORBIDDEN);
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
      return badRequest("Already in collection", undefined, API_ERROR_CODES.ALREADY_IN_COLLECTION);
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
    captureError("Error adding item to collection:", error);
    return serverError();
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
    if (!isValidId(collectionId))
      return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);
    const body = await request.json();
    const validation = reorderItemsSchema.safeParse(body);

    if (!validation.success) {
      return badRequest(
        "Invalid input",
        {
          details: validation.error.flatten().fieldErrors,
        },
        API_ERROR_CODES.INVALID_INPUT
      );
    }

    // Check collection ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { owner_id: true },
    });

    if (!collection) {
      return notFound();
    }

    if (collection.owner_id !== userId) {
      return forbidden("Own collection only", API_ERROR_CODES.OWN_COLLECTION_ONLY);
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
      message: "Order updated",
    });
  } catch (error) {
    captureError("Error reordering collection items:", error);
    return serverError();
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
    if (!isValidId(collectionId))
      return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return badRequest("Invalid input", undefined, API_ERROR_CODES.INVALID_INPUT);
    }

    // Check collection ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { owner_id: true },
    });

    if (!collection) {
      return notFound();
    }

    if (collection.owner_id !== userId) {
      return forbidden("Own collection only", API_ERROR_CODES.OWN_COLLECTION_ONLY);
    }

    // Delete the item
    await prisma.collectionItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: "Item removed from collection",
    });
  } catch (error) {
    captureError("Error removing item from collection:", error);
    return serverError();
  }
}
