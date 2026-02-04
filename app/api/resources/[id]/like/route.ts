import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit, rateLimitHeaders, isValidId } from "@/lib/rateLimit";

// POST /api/resources/[id]/like - Toggle like on a resource
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    // Rate limiting check
    const rateLimitResult = checkRateLimit(session.user.id, "resources:like");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    const { id: resourceId } = await params;

    // Validate resource ID format
    if (!isValidId(resourceId)) {
      return NextResponse.json({ error: "Ungültige Ressourcen-ID" }, { status: 400 });
    }

    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true, seller_id: true },
    });

    if (!resource) {
      return NextResponse.json({ error: "Ressource nicht gefunden" }, { status: 404 });
    }

    // Check if user already liked this resource
    const existingLike = await prisma.resourceLike.findUnique({
      where: {
        user_id_resource_id: {
          user_id: session.user.id,
          resource_id: resourceId,
        },
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.resourceLike.delete({
        where: { id: existingLike.id },
      });

      const likeCount = await prisma.resourceLike.count({
        where: { resource_id: resourceId },
      });

      return NextResponse.json({
        liked: false,
        likeCount,
        message: "Like entfernt",
      });
    } else {
      // Like - add new like
      await prisma.resourceLike.create({
        data: {
          user_id: session.user.id,
          resource_id: resourceId,
        },
      });

      const likeCount = await prisma.resourceLike.count({
        where: { resource_id: resourceId },
      });

      return NextResponse.json({
        liked: true,
        likeCount,
        message: "Ressource gefällt Ihnen",
      });
    }
  } catch (error) {
    console.error("Error toggling resource like:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

// GET /api/resources/[id]/like - Get like status for a resource
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id: resourceId } = await params;

    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    });

    if (!resource) {
      return NextResponse.json({ error: "Ressource nicht gefunden" }, { status: 404 });
    }

    // Get like count
    const likeCount = await prisma.resourceLike.count({
      where: { resource_id: resourceId },
    });

    // Check if current user has liked
    let liked = false;
    if (session?.user?.id) {
      const existingLike = await prisma.resourceLike.findUnique({
        where: {
          user_id_resource_id: {
            user_id: session.user.id,
            resource_id: resourceId,
          },
        },
      });
      liked = !!existingLike;
    }

    return NextResponse.json({ liked, likeCount });
  } catch (error) {
    console.error("Error getting resource like status:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
