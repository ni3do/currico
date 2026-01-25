import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils/price";

/**
 * GET /api/seller/resources
 * Fetch seller's own resources for bundle selection
 * Access: Authenticated seller only
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user is a seller
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { is_seller: true, role: true },
    });

    if (!user?.is_seller && user?.role !== "SELLER") {
      return NextResponse.json(
        { error: "Nur für Verkäufer zugänglich" },
        { status: 403 }
      );
    }

    // Fetch seller's published resources
    const resources = await prisma.resource.findMany({
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
    });

    // Transform resources for bundle selection
    const transformedResources = resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      price: resource.price,
      priceFormatted: formatPrice(resource.price, { showFreeLabel: true }),
      subject: resource.subjects[0] || "",
      subjects: resource.subjects,
      cycles: resource.cycles,
      previewUrl: resource.preview_url,
    }));

    return NextResponse.json({
      resources: transformedResources,
    });
  } catch (error) {
    console.error("Error fetching seller resources:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Ressourcen" },
      { status: 500 }
    );
  }
}
