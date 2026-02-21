import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import {
  requireAuth,
  requireSeller,
  unauthorized,
  forbidden,
  serverError,
  API_ERROR_CODES,
} from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { formatPrice } from "@/lib/utils/price";

/**
 * GET /api/seller/materials
 * Fetch seller's own materials for bundle selection
 * Access: Authenticated seller only
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const seller = await requireSeller(userId);
    if (!seller) return forbidden("Seller only", API_ERROR_CODES.SELLER_ONLY);

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
    captureError("Error fetching seller materials:", error);
    return serverError("MATERIALS_FETCH_FAILED");
  }
}
