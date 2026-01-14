import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/resources
 * Public endpoint to fetch published and approved resources
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const subject = searchParams.get("subject");
    const cycle = searchParams.get("cycle");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    const skip = (page - 1) * limit;

    // Build where clause - only show published and approved resources
    const where: Record<string, unknown> = {
      is_published: true,
      is_approved: true,
    };

    if (subject) {
      where.subjects = { has: subject };
    }

    if (cycle) {
      where.cycles = { has: cycle };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    let orderBy: Record<string, string> = { created_at: "desc" };
    if (sort === "price-low") {
      orderBy = { price: "asc" };
    } else if (sort === "price-high") {
      orderBy = { price: "desc" };
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          subjects: true,
          cycles: true,
          preview_url: true,
          created_at: true,
          seller: {
            select: {
              id: true,
              display_name: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.resource.count({ where }),
    ]);

    // Transform resources for frontend
    const transformedResources = resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      price: resource.price,
      priceFormatted: resource.price === 0 ? "Gratis" : `CHF ${(resource.price / 100).toFixed(2)}`,
      subject: resource.subjects[0] || "Allgemein",
      cycle: resource.cycles[0] || "",
      subjects: resource.subjects,
      cycles: resource.cycles,
      previewUrl: resource.preview_url,
      createdAt: resource.created_at,
      seller: resource.seller,
    }));

    return NextResponse.json({
      resources: transformedResources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
