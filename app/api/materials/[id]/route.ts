import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { getCurrentUserId } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { requireAuth, unauthorized, badRequest, notFound, forbidden, serverError } from "@/lib/api";
import { isValidId } from "@/lib/rateLimit";
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
    if (!isValidId(id)) return badRequest("Invalid ID");

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
        tags: true,
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
      return notFound("MATERIAL_NOT_FOUND");
    }

    // Check visibility: admins and material owners can see any material
    // Regular users can only see published materials
    const isOwner = userId === material.seller_id;

    if (!isAdmin && !isOwner && !material.is_published) {
      return notFound("MATERIAL_NOT_FOUND");
    }

    // Check if user has access to full previews (owner, purchased, free, or admin)
    const hasPurchased = material.transactions && material.transactions.length > 0;
    const isFree = material.price === 0;
    const hasAccess = isOwner || hasPurchased || isFree || isAdmin;

    // Fetch related materials using a single ranked query:
    // Priority 1: same subject, Priority 2: same cycle, Priority 3: most popular
    const materialSubjects = toStringArray(material.subjects);
    const materialCycles = toStringArray(material.cycles);

    const hasSubjects = materialSubjects.length > 0;
    const hasCycles = materialCycles.length > 0;

    const rankedIds = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM resources
      WHERE id != ${id}
        AND is_published = true AND is_approved = true
      ORDER BY
        CASE WHEN ${hasSubjects} AND subjects::jsonb ?| ${materialSubjects.length > 0 ? materialSubjects : [""]}::text[] THEN 0 ELSE 1 END,
        CASE WHEN ${hasCycles} AND cycles::jsonb ?| ${materialCycles.length > 0 ? materialCycles : [""]}::text[] THEN 0 ELSE 1 END,
        created_at DESC
      LIMIT 3
    `;

    const relatedMaterials =
      rankedIds.length > 0
        ? await prisma.resource.findMany({
            where: { id: { in: rankedIds.map((r) => r.id) } },
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
          })
        : [];

    // Transform the response
    const subjects = toStringArray(material.subjects);
    const cycles = toStringArray(material.cycles);
    const tags = toStringArray(material.tags);

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
      tags,
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
      isPublished: material.is_published,
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
    return serverError("MATERIAL_FETCH_FAILED");
  }
}

/**
 * PATCH /api/materials/[id]
 * Update a material (owner only)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID");

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
      return notFound("MATERIAL_NOT_FOUND");
    }

    // Check ownership
    if (material.seller_id !== userId) {
      return forbidden("MATERIAL_EDIT_FORBIDDEN");
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = updateMaterialSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("VALIDATION_ERROR", {
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    // If material is already approved, some fields cannot be changed
    // Price changes on approved materials would affect buyers
    if (material.is_approved && data.price !== undefined) {
      return badRequest("PRICE_CHANGE_AFTER_APPROVAL");
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
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.is_published !== undefined && { is_published: data.is_published }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        subjects: true,
        cycles: true,
        tags: true,
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
        tags: updatedMaterial.tags,
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
    return serverError("MATERIAL_UPDATE_FAILED");
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
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID");

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
      return notFound("MATERIAL_NOT_FOUND");
    }

    // Check ownership
    if (material.seller_id !== userId) {
      return forbidden("MATERIAL_DELETE_FORBIDDEN");
    }

    // Check for completed transactions
    if (material._count.transactions > 0) {
      return badRequest("MATERIAL_HAS_PURCHASES", {
        transactionCount: material._count.transactions,
      });
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
    return serverError("MATERIAL_DELETE_FAILED");
  }
}
