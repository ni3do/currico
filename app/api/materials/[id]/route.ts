import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { getCurrentUserId } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { updateMaterialSchema } from "@/lib/validations/material";
import { formatPrice } from "@/lib/utils/price";
import { getFileFormatLabel } from "@/lib/utils/file-format";
import { getStorage, isLegacyLocalPath, getLegacyFilePath } from "@/lib/storage";
import { unlink } from "fs/promises";

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
        is_mi_integrated: true,
        competencies: {
          select: {
            competency: {
              select: {
                id: true,
                code: true,
                description_de: true,
                anforderungsstufe: true,
                subject: {
                  select: {
                    code: true,
                    color: true,
                  },
                },
              },
            },
          },
        },
        transversals: {
          select: {
            transversal: {
              select: {
                id: true,
                code: true,
                name_de: true,
                icon: true,
                color: true,
              },
            },
          },
        },
        bne_themes: {
          select: {
            bne: {
              select: {
                id: true,
                code: true,
                name_de: true,
                icon: true,
                color: true,
              },
            },
          },
        },
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
      return NextResponse.json({ error: "MATERIAL_NOT_FOUND" }, { status: 404 });
    }

    // Check visibility: admins and material owners can see any material
    // Regular users can only see published materials
    const isOwner = userId === material.seller_id;

    if (!isAdmin && !isOwner && !material.is_published) {
      return NextResponse.json({ error: "MATERIAL_NOT_FOUND" }, { status: 404 });
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
      const relatedIds = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM resources
        WHERE id != ${id}
        AND is_published = true AND is_approved = true
        AND subjects::jsonb ?| ${materialSubjects}::text[]
        LIMIT 3
      `;

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
      const remaining = 3 - relatedMaterials.length;
      const cycleIds = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM resources
        WHERE id != ALL(${existingIds}::text[])
        AND is_published = true AND is_approved = true
        AND cycles::jsonb ?| ${materialCycles}::text[]
        LIMIT ${remaining}
      `;

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
    const fileFormat = getFileFormatLabel(material.file_url);

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
      createdAt: material.created_at,
      isMiIntegrated: material.is_mi_integrated,
      competencies: (material.competencies ?? []).map((rc) => ({
        id: rc.competency.id,
        code: rc.competency.code,
        description_de: rc.competency.description_de,
        anforderungsstufe: rc.competency.anforderungsstufe,
        subjectCode: rc.competency.subject.code,
        subjectColor: rc.competency.subject.color,
      })),
      transversals: (material.transversals ?? []).map((rt) => ({
        id: rt.transversal.id,
        code: rt.transversal.code,
        name_de: rt.transversal.name_de,
        icon: rt.transversal.icon,
        color: rt.transversal.color,
      })),
      bneThemes: (material.bne_themes ?? []).map((rb) => ({
        id: rb.bne.id,
        code: rb.bne.code,
        name_de: rb.bne.name_de,
        icon: rb.bne.icon,
        color: rb.bne.color,
      })),
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

    const transformedRelated = relatedMaterials.map((r) => ({
      id: r.id,
      title: r.title,
      price: r.price,
      priceFormatted: formatPrice(r.price),
      subjects: toStringArray(r.subjects),
      cycles: toStringArray(r.cycles),
      verified: r.is_approved,
      previewUrl: r.preview_url,
      sellerName: r.seller.display_name,
    }));

    return NextResponse.json({
      material: transformedMaterial,
      relatedMaterials: transformedRelated,
    });
  } catch (error) {
    console.error("Error fetching material:", error);
    return NextResponse.json({ error: "MATERIAL_FETCH_FAILED" }, { status: 500 });
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
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
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
      return NextResponse.json({ error: "MATERIAL_NOT_FOUND" }, { status: 404 });
    }

    // Check ownership
    if (material.seller_id !== userId) {
      return NextResponse.json({ error: "MATERIAL_EDIT_FORBIDDEN" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = updateMaterialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // If material is already approved, some fields cannot be changed
    // Price changes on approved materials would affect buyers
    if (material.is_approved && data.price !== undefined) {
      return NextResponse.json({ error: "PRICE_CHANGE_AFTER_APPROVAL" }, { status: 400 });
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
      message: "MATERIAL_UPDATED",
      material: {
        id: updatedMaterial.id,
        title: updatedMaterial.title,
        description: updatedMaterial.description,
        price: updatedMaterial.price,
        subjects: updatedMaterial.subjects,
        cycles: updatedMaterial.cycles,
        fileUrl: updatedMaterial.file_url,
        previewUrl: updatedMaterial.preview_url,
        isPublished: updatedMaterial.is_published,
        isApproved: updatedMaterial.is_approved,
        createdAt: updatedMaterial.created_at,
        updatedAt: updatedMaterial.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json({ error: "MATERIAL_UPDATE_FAILED" }, { status: 500 });
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
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
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
      return NextResponse.json({ error: "MATERIAL_NOT_FOUND" }, { status: 404 });
    }

    // Check ownership
    if (material.seller_id !== userId) {
      return NextResponse.json({ error: "MATERIAL_DELETE_FORBIDDEN" }, { status: 403 });
    }

    // Check for completed transactions
    if (material._count.transactions > 0) {
      return NextResponse.json(
        {
          error: "MATERIAL_HAS_PURCHASES",
          transactionCount: material._count.transactions,
        },
        { status: 400 }
      );
    }

    // Delete associated files using storage abstraction
    const storage = getStorage();

    if (material.file_url) {
      try {
        if (isLegacyLocalPath(material.file_url)) {
          await unlink(getLegacyFilePath(material.file_url));
        } else {
          await storage.delete(material.file_url, "material");
        }
      } catch {
        // File might not exist, continue with deletion
      }
    }

    if (material.preview_url) {
      try {
        if (isLegacyLocalPath(material.preview_url)) {
          await unlink(getLegacyFilePath(material.preview_url));
        } else {
          await storage.delete(material.preview_url, "preview");
        }
      } catch {
        // File might not exist, continue with deletion
      }
    }

    // Delete the material from database
    await prisma.resource.delete({ where: { id } });

    return NextResponse.json({
      message: "MATERIAL_DELETED",
    });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json({ error: "MATERIAL_DELETE_FAILED" }, { status: 500 });
  }
}
