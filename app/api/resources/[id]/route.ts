import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
