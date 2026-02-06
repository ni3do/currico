import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parsePagination, paginationResponse } from "@/lib/api";

/**
 * GET /api/users/[id]/materials
 * Get a user's public materials
 * Query params:
 *   - page, limit: pagination
 *   - sort: "newest" | "popular" | "price-low" | "price-high"
 *   - best: "true" to get only top materials (most downloaded)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, { limit: 12 });
    const sort = searchParams.get("sort") || "newest";
    const best = searchParams.get("best") === "true";

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, display_name: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    // Build orderBy based on sort param
    let orderBy: Record<string, string | object> = { created_at: "desc" };
    if (sort === "popular") {
      orderBy = { downloads: { _count: "desc" } };
    } else if (sort === "price-low") {
      orderBy = { price: "asc" };
    } else if (sort === "price-high") {
      orderBy = { price: "desc" };
    }

    // Base where clause
    const where = {
      seller_id: id,
      is_published: true,
      is_public: true,
    };

    // Get total count
    const total = await prisma.resource.count({ where });

    // If requesting "best" materials, get top 6 by download count
    const materials = await prisma.resource.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        preview_url: true,
        subjects: true,
        cycles: true,
        created_at: true,
        _count: {
          select: {
            downloads: true,
            transactions: { where: { status: "COMPLETED" } },
          },
        },
      },
      orderBy: best ? { downloads: { _count: "desc" } } : orderBy,
      skip: best ? 0 : skip,
      take: best ? 6 : limit,
    });

    // Transform response
    const transformedMaterials = materials.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      price: r.price,
      preview_url: r.preview_url,
      subjects: r.subjects,
      cycles: r.cycles,
      created_at: r.created_at,
      downloadCount: r._count.downloads,
      salesCount: r._count.transactions,
    }));

    return NextResponse.json({
      materials: transformedMaterials,
      seller: {
        id: user.id,
        name: user.display_name || user.name,
      },
      pagination: best ? null : paginationResponse(page, limit, total),
    });
  } catch (error) {
    console.error("Error fetching user materials:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
