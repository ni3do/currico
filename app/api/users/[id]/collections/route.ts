import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { notFound, serverError } from "@/lib/api";

/**
 * GET /api/users/[id]/collections
 * Get a user's public collections (or all if viewing own profile)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUserId = await getCurrentUserId();
    const isOwnProfile = currentUserId === id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return notFound();
    }

    // Get collections - all if own profile, only public otherwise
    const collections = await prisma.collection.findMany({
      where: {
        owner_id: id,
        ...(isOwnProfile ? {} : { is_public: true }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        is_public: true,
        position: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: { items: true },
        },
        items: {
          take: 4, // Preview first 4 items
          orderBy: { position: "asc" },
          select: {
            resource: {
              select: {
                id: true,
                title: true,
                preview_url: true,
              },
            },
          },
        },
      },
      orderBy: { position: "asc" },
    });

    // Transform response
    const transformedCollections = collections.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      is_public: c.is_public,
      position: c.position,
      created_at: c.created_at,
      updated_at: c.updated_at,
      itemCount: c._count.items,
      previewItems: c.items.map((i) => ({
        id: i.resource.id,
        title: i.resource.title,
        preview_url: i.resource.preview_url,
      })),
    }));

    return NextResponse.json({
      collections: transformedCollections,
      isOwnProfile,
    });
  } catch (error) {
    console.error("Error fetching user collections:", error);
    return serverError();
  }
}
