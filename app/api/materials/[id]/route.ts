import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { getCurrentUserId } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { updateMaterialSchema } from "@/lib/validations/material";
import { formatPrice } from "@/lib/utils/price";
import { unlink } from "fs/promises";
import path from "path";

/**
 * GET /api/materials/[id]
 * Fetch a single material by ID
 * - Admins can view any material
 * - Regular users can only view published materials
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if user is admin
    const admin = await requireAdmin();
    const isAdmin = !!admin;

    // Get current user ID for access checks
    const userId = await getCurrentUserId();

    // Fetch the material with seller info and counts
    const material = await prisma.resource.findUnique({
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
          select: {
            transactions: { where: { status: "COMPLETED" } },
            downloads: true,
          },
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
    if (!material) {
      return NextResponse.json({ error: "Material nicht gefunden" }, { status: 404 });
    }

    // Check visibility: admins and material owners can see any material
    // Regular users can only see published materials
    const isOwner = userId === material.seller_id;

    if (!isAdmin && !isOwner && !material.is_published) {
      return NextResponse.json({ error: "Material nicht gefunden" }, { status: 404 });
    }

    // Check if user has access to full previews (owner, purchased, free, or admin)
    const hasPurchased = material.transactions && material.transactions.length > 0;
    const isFree = material.price === 0;
    const hasAccess = isOwner || hasPurchased || isFree || isAdmin;

    // Fetch related materials from the same subject using raw SQL for JSON overlap
    const materialSubjects = toStringArray(material.subjects);
    let relatedMaterials: {
      id: string;
      title: string;
      price: number;
      subjects: unknown;
      cycles: unknown;
      is_approved: boolean;
      preview_url: string | null;
      seller: { display_name: string | null };
    }[] = [];

    // Strategy: same subject → same cycle → most popular
    const materialCycles = toStringArray(material.cycles);

    if (materialSubjects.length > 0) {
      // First: try matching by subject
      const relatedIds = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `SELECT id FROM resources WHERE id != $1 AND is_published = true AND is_approved = true AND subjects::jsonb ?| $2::text[] LIMIT 3`,
        id,
        materialSubjects
      );

      if (relatedIds.length > 0) {
        relatedMaterials = await prisma.resource.findMany({
          where: { id: { in: relatedIds.map((r) => r.id) } },
          select: {
            id: true,
            title: true,
            price: true,
            subjects: true,
            cycles: true,
            is_approved: true,
            preview_url: true,
            seller: { select: { display_name: true } },
          },
          orderBy: { created_at: "desc" },
        });
      }
    }

    // Fallback: if not enough results, fill with same cycle materials
    if (relatedMaterials.length < 3 && materialCycles.length > 0) {
      const existingIds = [id, ...relatedMaterials.map((r) => r.id)];
      const cycleIds = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `SELECT id FROM resources WHERE id != ALL($1::text[]) AND is_published = true AND is_approved = true AND cycles::jsonb ?| $2::text[] LIMIT $3`,
        existingIds,
        materialCycles,
        3 - relatedMaterials.length
      );

      if (cycleIds.length > 0) {
        const cycleMaterials = await prisma.resource.findMany({
          where: { id: { in: cycleIds.map((r) => r.id) } },
          select: {
            id: true,
            title: true,
            price: true,
            subjects: true,
            cycles: true,
            is_approved: true,
            preview_url: true,
            seller: { select: { display_name: true } },
          },
          orderBy: { created_at: "desc" },
        });
        relatedMaterials.push(...cycleMaterials);
      }
    }

    // Last fallback: most popular materials
    if (relatedMaterials.length < 3) {
      const existingIds = [id, ...relatedMaterials.map((r) => r.id)];
      const popularMaterials = await prisma.resource.findMany({
        where: { id: { notIn: existingIds }, is_published: true, is_approved: true },
        select: {
          id: true,
          title: true,
          price: true,
          subjects: true,
          cycles: true,
          is_approved: true,
          preview_url: true,
          seller: { select: { display_name: true } },
        },
        orderBy: { transactions: { _count: "desc" } },
        take: 3 - relatedMaterials.length,
      });
      relatedMaterials.push(...popularMaterials);
    }

    // Transform the response
    const subjects = toStringArray(material.subjects);
    const cycles = toStringArray(material.cycles);

    // Parse preview_urls from JSON
    const previewUrls = Array.isArray(material.preview_urls)
      ? (material.preview_urls as string[])
      : [];

    // Derive file format from file_url extension
    const fileExt = material.file_url
      ? material.file_url.split(".").pop()?.toLowerCase() || "pdf"
      : "pdf";
    const formatMap: Record<string, string> = {
      pdf: "PDF",
      doc: "Word",
      docx: "Word",
      ppt: "PowerPoint",
      pptx: "PowerPoint",
      xls: "Excel",
      xlsx: "Excel",
      one: "OneNote",
      onetoc2: "OneNote",
    };
    const fileFormat = formatMap[fileExt] || fileExt.toUpperCase();

    const transformedMaterial = {
      id: material.id,
      title: material.title,
      description: material.description,
      price: material.price,
      priceFormatted: formatPrice(material.price),
      fileUrl: material.file_url,
      fileFormat,
      previewUrl: material.preview_url,
      previewUrls,
      previewCount: material.preview_count || 1,
      hasAccess, // true if user can see all preview pages without blur
      subjects,
      cycles,
      subject: subjects[0] || "Allgemein",
      cycle: cycles[0] || "",
      createdAt: material.created_at,
      downloadCount: material._count.transactions + material._count.downloads,
      isApproved: material.is_approved,
      status: material.status,
      seller: {
        id: material.seller.id,
        displayName: material.seller.display_name,
        image: material.seller.image,
        verified: material.seller.stripe_charges_enabled,
        materialCount: material.seller._count.resources,
      },
    };

    const transformedRelated = relatedMaterials.map((r) => {
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
        sellerName: r.seller.display_name,
      };
    });

    return NextResponse.json({
      material: transformedMaterial,
      relatedMaterials: transformedRelated,
    });
  } catch (error) {
    console.error("Error fetching material:", error);
    return NextResponse.json({ error: "Fehler beim Laden des Materials" }, { status: 500 });
  }
}

/**
 * PATCH /api/materials/[id]
 * Update a material (owner only)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authentication check
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Fetch the material to verify ownership
    const material = await prisma.resource.findUnique({
      where: { id },
      select: {
        id: true,
        seller_id: true,
        is_approved: true,
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Material nicht gefunden" }, { status: 404 });
    }

    // Check ownership
    if (material.seller_id !== userId) {
      return NextResponse.json(
        { error: "Keine Berechtigung zum Bearbeiten dieses Materials" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = updateMaterialSchema.safeParse(body);

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

    // If material is already approved, some fields cannot be changed
    // Price changes on approved materials would affect buyers
    if (material.is_approved && data.price !== undefined) {
      return NextResponse.json(
        { error: "Preis kann nach Genehmigung nicht mehr geändert werden" },
        { status: 400 }
      );
    }

    // Update the material
    const updatedMaterial = await prisma.resource.update({
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
      message: "Material erfolgreich aktualisiert",
      material: updatedMaterial,
    });
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

/**
 * DELETE /api/materials/[id]
 * Delete a material (owner only, no completed transactions)
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

    // Fetch the material with transaction count
    const material = await prisma.resource.findUnique({
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

    if (!material) {
      return NextResponse.json({ error: "Material nicht gefunden" }, { status: 404 });
    }

    // Check ownership
    if (material.seller_id !== userId) {
      return NextResponse.json(
        { error: "Keine Berechtigung zum Löschen dieses Materials" },
        { status: 403 }
      );
    }

    // Check for completed transactions
    if (material._count.transactions > 0) {
      return NextResponse.json(
        {
          error: "Material kann nicht gelöscht werden, da bereits Käufe existieren",
          transactionCount: material._count.transactions,
        },
        { status: 400 }
      );
    }

    // Delete associated files
    const uploadsDir = path.join(process.cwd(), "public");

    if (material.file_url) {
      try {
        const filePath = path.join(uploadsDir, material.file_url);
        await unlink(filePath);
      } catch {
        // File might not exist, continue with deletion
      }
    }

    if (material.preview_url) {
      try {
        const previewPath = path.join(uploadsDir, material.preview_url);
        await unlink(previewPath);
      } catch {
        // File might not exist, continue with deletion
      }
    }

    // Delete the material from database
    await prisma.resource.delete({ where: { id } });

    return NextResponse.json({
      message: "Material erfolgreich gelöscht",
    });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
