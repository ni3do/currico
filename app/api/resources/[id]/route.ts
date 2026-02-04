import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { getCurrentUserId } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { updateResourceSchema } from "@/lib/validations/resource";
import { formatPrice } from "@/lib/utils/price";
import { unlink } from "fs/promises";
import path from "path";

/**
 * GET /api/resources/[id]
 * Fetch a single resource by ID
 * - Admins can view any resource
 * - Regular users can only view published resources
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if user is admin
    const admin = await requireAdmin();
    const isAdmin = !!admin;

    // Get current user ID for access checks
    const userId = await getCurrentUserId();

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
        preview_urls: true,
        preview_count: true,
        subjects: true,
        cycles: true,
        is_published: true,
        is_approved: true,
        status: true,
        created_at: true,
        seller_id: true,
        seller: {
          select: {
            id: true,
            display_name: true,
            image: true,
            stripe_charges_enabled: true,
            _count: {
              select: { resources: true },
            },
          },
        },
        _count: {
          select: { transactions: { where: { status: "COMPLETED" } } },
        },
        // Include transactions for the current user to check if they've purchased
        transactions: userId
          ? {
              where: {
                buyer_id: userId,
                status: "COMPLETED",
              },
              select: { id: true },
              take: 1,
            }
          : undefined,
      },
    });

    // Return 404 if not found
    if (!resource) {
      return NextResponse.json({ error: "Ressource nicht gefunden" }, { status: 404 });
    }

    // Check visibility: admins and resource owners can see any resource
    // Regular users can only see published resources
    const isOwner = userId === resource.seller_id;

    if (!isAdmin && !isOwner && !resource.is_published) {
      return NextResponse.json({ error: "Ressource nicht gefunden" }, { status: 404 });
    }

    // Check if user has access to full previews (owner, purchased, free, or admin)
    const hasPurchased = resource.transactions && resource.transactions.length > 0;
    const isFree = resource.price === 0;
    const hasAccess = isOwner || hasPurchased || isFree || isAdmin;

    // Fetch related resources from the same subject using raw SQL for JSON overlap
    const resourceSubjects = toStringArray(resource.subjects);
    let relatedResources: {
      id: string;
      title: string;
      price: number;
      subjects: unknown;
      cycles: unknown;
      is_approved: boolean;
      preview_url: string | null;
    }[] = [];

    if (resourceSubjects.length > 0) {
      // Get IDs of related resources using PostgreSQL JSONB ?| operator
      const relatedIds = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `SELECT id FROM resources WHERE id != $1 AND is_published = true AND is_approved = true AND subjects::jsonb ?| $2::text[] LIMIT 3`,
        id,
        resourceSubjects
      );

      if (relatedIds.length > 0) {
        relatedResources = await prisma.resource.findMany({
          where: {
            id: { in: relatedIds.map((r) => r.id) },
          },
          select: {
            id: true,
            title: true,
            price: true,
            subjects: true,
            cycles: true,
            is_approved: true,
            preview_url: true,
          },
          orderBy: { created_at: "desc" },
        });
      }
    }

    // Transform the response
    const subjects = toStringArray(resource.subjects);
    const cycles = toStringArray(resource.cycles);

    // Parse preview_urls from JSON
    const previewUrls = Array.isArray(resource.preview_urls)
      ? (resource.preview_urls as string[])
      : [];

    const transformedResource = {
      id: resource.id,
      title: resource.title,
      description: resource.description,
      price: resource.price,
      priceFormatted: formatPrice(resource.price),
      fileUrl: resource.file_url,
      previewUrl: resource.preview_url,
      previewUrls,
      previewCount: resource.preview_count || 1,
      hasAccess, // true if user can see all preview pages without blur
      subjects,
      cycles,
      subject: subjects[0] || "Allgemein",
      cycle: cycles[0] || "",
      createdAt: resource.created_at,
      downloadCount: resource._count.transactions,
      isApproved: resource.is_approved,
      status: resource.status,
      seller: {
        id: resource.seller.id,
        displayName: resource.seller.display_name,
        image: resource.seller.image,
        verified: resource.seller.stripe_charges_enabled,
        resourceCount: resource.seller._count.resources,
      },
    };

    const transformedRelated = relatedResources.map((r) => {
      const rSubjects = toStringArray(r.subjects);
      const rCycles = toStringArray(r.cycles);
      return {
        id: r.id,
        title: r.title,
        price: r.price,
        priceFormatted: formatPrice(r.price),
        subject: rSubjects[0] || "Allgemein",
        cycle: rCycles[0] || "",
        verified: r.is_approved,
        previewUrl: r.preview_url,
      };
    });

    return NextResponse.json({
      resource: transformedResource,
      relatedResources: transformedRelated,
    });
  } catch (error) {
    console.error("Error fetching resource:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Ressource" }, { status: 500 });
  }
}

/**
 * PATCH /api/resources/[id]
 * Update a resource (owner only)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authentication check
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
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
      return NextResponse.json({ error: "Ressource nicht gefunden" }, { status: 404 });
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
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
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
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
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
      return NextResponse.json({ error: "Ressource nicht gefunden" }, { status: 404 });
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
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
