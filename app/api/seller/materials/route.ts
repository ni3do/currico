import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils/price";

/**
 * GET /api/seller/materials
 * Fetch seller's own materials for bundle selection
 * Access: Authenticated seller only
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user is a seller
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "SELLER") {
      return NextResponse.json({ error: "SELLER_ONLY" }, { status: 403 });
    }

    // Fetch seller's published materials
    const materials = await prisma.resource.findMany({
      where: {
        seller_id: userId,
        is_published: true,
      },
      select: {
        id: true,
        title: true,
        price: true,
        subjects: true,
        cycles: true,
        preview_url: true,
      },
      orderBy: { created_at: "desc" },
      take: 100,
    });

    // Transform materials for bundle selection
    const transformedMaterials = materials.map((material) => {
      const subjects = toStringArray(material.subjects);
      const cycles = toStringArray(material.cycles);
      return {
        id: material.id,
        title: material.title,
        price: material.price,
        priceFormatted: formatPrice(material.price, { showFreeLabel: true }),
        subjects,
        cycles,
        previewUrl: material.preview_url,
      };
    });

    return NextResponse.json({
      materials: transformedMaterials,
    });
  } catch (error) {
    console.error("Error fetching seller materials:", error);
    return NextResponse.json({ error: "MATERIALS_FETCH_FAILED" }, { status: 500 });
  }
}
