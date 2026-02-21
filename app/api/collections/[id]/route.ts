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
    if (!isValidId(id)) return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);

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
      return notFound();
    }

    // Check access - public collections are viewable by all
    // Private collections only viewable by owner
    const userId = await requireAuth();
    if (!collection.is_public && collection.owner_id !== userId) {
      return forbidden("Collection is private", API_ERROR_CODES.COLLECTION_PRIVATE);
    }

    return NextResponse.json({
      collection: {
        ...collection,
        itemCount: collection.items.length,
      },
    });
  } catch (error) {
    captureError("Error fetching collection:", error);
    return serverError();
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
    if (!isValidId(id)) return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);
    const body = await request.json();
    const validation = updateCollectionSchema.safeParse(body);

    if (!validation.success) {
      return badRequest(
        "Invalid input",
        {
          details: validation.error.flatten().fieldErrors,
        },
        API_ERROR_CODES.INVALID_INPUT
      );
    }

    // Check ownership
    const existing = await prisma.collection.findUnique({
      where: { id },
      select: { owner_id: true },
    });

    if (!existing) {
      return notFound();
    }

    if (existing.owner_id !== userId) {
      return forbidden("Own collection only", API_ERROR_CODES.OWN_COLLECTION_ONLY);
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
    captureError("Error updating collection:", error);
    return serverError();
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
    if (!isValidId(id)) return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);

    // Check ownership
    const existing = await prisma.collection.findUnique({
      where: { id },
      select: { owner_id: true },
    });

    if (!existing) {
      return notFound();
    }

    if (existing.owner_id !== userId) {
      return forbidden("Own collection only", API_ERROR_CODES.OWN_COLLECTION_ONLY);
    }

    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Collection deleted",
    });
  } catch (error) {
    captureError("Error deleting collection:", error);
    return serverError();
  }
}
