import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { updateResourceSchema } from "@/lib/validations/resource";
import { unlink } from "fs/promises";
import path from "path";

/**
 * GET /api/resources/[id]
 * Fetch a single published and approved resource by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the resource with seller info and counts
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        file_url: true,
        preview_url: true,
        subjects: true,
        cycles: true,
        is_published: true,
        is_approved: true,
        created_at: true,
        seller: {
          select: {
            id: true,
            display_name: true,
            image: true,
            seller_verified: true,
            _count: {
              select: { resources: true },
            },
          },
        },
        _count: {
          select: { transactions: { where: { status: "COMPLETED" } } },
        },
      },
    });

    // Return 404 if not found or not publicly visible
    if (!resource || !resource.is_published || !resource.is_approved) {
      return NextResponse.json(
        { error: "Ressource nicht gefunden" },
        { status: 404 }
      );
    }

    // Fetch related resources from the same subject
    const relatedResources = await prisma.resource.findMany({
      where: {
        id: { not: id },
        is_published: true,
        is_approved: true,
        subjects: { hasSome: resource.subjects },
      },
      select: {
        id: true,
        title: true,
        price: true,
        subjects: true,
        cycles: true,
        is_approved: true,
      },
      take: 3,
      orderBy: { created_at: "desc" },
    });

    // Transform the response
    const transformedResource = {
      id: resource.id,
      title: resource.title,
      description: resource.description,
      price: resource.price,
      priceFormatted: resource.price === 0 ? "Gratis" : `CHF ${(resource.price / 100).toFixed(2)}`,
      fileUrl: resource.file_url,
      previewUrl: resource.preview_url,
      subjects: resource.subjects,
      cycles: resource.cycles,
      subject: resource.subjects[0] || "Allgemein",
      cycle: resource.cycles[0] || "",
      createdAt: resource.created_at,
      downloadCount: resource._count.transactions,
      seller: {
        id: resource.seller.id,
        displayName: resource.seller.display_name,
        image: resource.seller.image,
        verified: resource.seller.seller_verified,
        resourceCount: resource.seller._count.resources,
      },
    };

    const transformedRelated = relatedResources.map((r) => ({
      id: r.id,
      title: r.title,
      price: r.price,
      priceFormatted: r.price === 0 ? "Gratis" : `CHF ${(r.price / 100).toFixed(2)}`,
      subject: r.subjects[0] || "Allgemein",
      cycle: r.cycles[0] || "",
      verified: r.is_approved,
    }));

    return NextResponse.json({
      resource: transformedResource,
      relatedResources: transformedRelated,
    });
  } catch (error) {
    console.error("Error fetching resource:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Ressource" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/resources/[id]
 * Update a resource (owner only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authentication check
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Fetch the resource to verify ownership
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: {
        id: true,
        seller_id: true,
        is_approved: true,
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Ressource nicht gefunden" },
        { status: 404 }
      );
    }

    // Check ownership
    if (resource.seller_id !== userId) {
      return NextResponse.json(
        { error: "Keine Berechtigung zum Bearbeiten dieser Ressource" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = updateResourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Ungültige Eingabe",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // If resource is already approved, some fields cannot be changed
    // Price changes on approved resources would affect buyers
    if (resource.is_approved && data.price !== undefined) {
      return NextResponse.json(
        { error: "Preis kann nach Genehmigung nicht mehr geändert werden" },
        { status: 400 }
      );
    }

    // Update the resource
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.subjects && { subjects: data.subjects }),
        ...(data.cycles && { cycles: data.cycles }),
        ...(data.is_published !== undefined && { is_published: data.is_published }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        subjects: true,
        cycles: true,
        file_url: true,
        preview_url: true,
        is_published: true,
        is_approved: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({
      message: "Ressource erfolgreich aktualisiert",
      resource: updatedResource,
    });
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resources/[id]
 * Delete a resource (owner only, no completed transactions)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authentication check
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Fetch the resource with transaction count
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: {
        id: true,
        seller_id: true,
        file_url: true,
        preview_url: true,
        _count: {
          select: { transactions: { where: { status: "COMPLETED" } } },
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Ressource nicht gefunden" },
        { status: 404 }
      );
    }

    // Check ownership
    if (resource.seller_id !== userId) {
      return NextResponse.json(
        { error: "Keine Berechtigung zum Löschen dieser Ressource" },
        { status: 403 }
      );
    }

    // Check for completed transactions
    if (resource._count.transactions > 0) {
      return NextResponse.json(
        {
          error: "Ressource kann nicht gelöscht werden, da bereits Käufe existieren",
          transactionCount: resource._count.transactions,
        },
        { status: 400 }
      );
    }

    // Delete associated files
    const uploadsDir = path.join(process.cwd(), "public");

    if (resource.file_url) {
      try {
        const filePath = path.join(uploadsDir, resource.file_url);
        await unlink(filePath);
      } catch {
        // File might not exist, continue with deletion
      }
    }

    if (resource.preview_url) {
      try {
        const previewPath = path.join(uploadsDir, resource.preview_url);
        await unlink(previewPath);
      } catch {
        // File might not exist, continue with deletion
      }
    }

    // Delete the resource from database
    await prisma.resource.delete({ where: { id } });

    return NextResponse.json({
      message: "Ressource erfolgreich gelöscht",
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
