import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { readFile } from "fs/promises";
import path from "path";
import { getStorage, isLegacyLocalPath, getLegacyFilePath } from "@/lib/storage";

/**
 * Content type map for file extensions
 */
const contentTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".zip": "application/zip",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

/**
 * Get content type from file path/key
 */
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return contentTypes[ext] || "application/octet-stream";
}

/**
 * Create a safe filename from resource title
 */
function getSafeFilename(title: string, filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const safeTitle = title.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, "").trim();
  return `${safeTitle}${ext}`;
}

/**
 * GET /api/resources/[id]/download
 * Download a resource file
 * - Free resources: any authenticated user can download
 * - Paid resources: only users who have purchased can download
 * - Owners can always download their own resources
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authentication check
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Bitte melden Sie sich an, um Ressourcen herunterzuladen" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Fetch the resource with related data
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        price: true,
        file_url: true,
        is_published: true,
        is_approved: true,
        is_public: true,
        seller_id: true,
        transactions: {
          where: {
            buyer_id: userId,
            status: "COMPLETED",
          },
          select: { id: true },
          take: 1,
        },
        downloads: {
          where: { user_id: userId },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!resource) {
      return NextResponse.json({ error: "Ressource nicht gefunden" }, { status: 404 });
    }

    // Check if resource is accessible (published, approved, public) or user is owner
    const isOwner = resource.seller_id === userId;
    const isPubliclyAccessible =
      resource.is_published && resource.is_approved && resource.is_public;

    if (!isOwner && !isPubliclyAccessible) {
      return NextResponse.json({ error: "Diese Ressource ist nicht verfügbar" }, { status: 403 });
    }

    // Check access rights
    const isFree = resource.price === 0;
    const hasPurchased = resource.transactions.length > 0;
    const hasDownloaded = resource.downloads.length > 0;

    console.log("[DOWNLOAD] ========== ACCESS CHECK ==========");
    console.log("[DOWNLOAD] Resource ID:", id);
    console.log("[DOWNLOAD] User ID:", userId);
    console.log("[DOWNLOAD] Is Owner:", isOwner);
    console.log("[DOWNLOAD] Is Free:", isFree);
    console.log("[DOWNLOAD] Has Purchased (COMPLETED transactions):", hasPurchased);
    console.log("[DOWNLOAD] Transactions found:", resource.transactions.length);
    console.log("[DOWNLOAD] Has Download record:", hasDownloaded);

    // Grant access if: owner, free resource, or has purchased
    const hasAccess = isOwner || isFree || hasPurchased;
    console.log("[DOWNLOAD] Final hasAccess:", hasAccess);

    if (!hasAccess) {
      console.log("[DOWNLOAD] ACCESS DENIED - user needs to purchase");
      return NextResponse.json(
        { error: "Bitte kaufen Sie diese Ressource, um sie herunterzuladen" },
        { status: 403 }
      );
    }

    // Record download for free resources (if not already recorded)
    if (isFree && !isOwner && !hasDownloaded) {
      await prisma.download.create({
        data: {
          user_id: userId,
          resource_id: id,
        },
      });
    }

    const storage = getStorage();
    const filename = getSafeFilename(resource.title, resource.file_url);
    const contentType = getContentType(resource.file_url);

    // Check if this is a legacy local path (starts with /uploads/)
    if (isLegacyLocalPath(resource.file_url)) {
      // Handle legacy local file
      const filePath = getLegacyFilePath(resource.file_url);
      try {
        const fileBuffer = await readFile(filePath);
        return new NextResponse(new Uint8Array(fileBuffer), {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
            "Content-Length": fileBuffer.length.toString(),
          },
        });
      } catch {
        console.error("Legacy file not found:", filePath);
        return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 });
      }
    }

    // For S3 storage, redirect to signed URL
    if (!storage.isLocal()) {
      try {
        const signedUrl = await storage.getSignedUrl(resource.file_url, {
          expiresIn: 3600, // 1 hour
          downloadFilename: filename,
        });
        return NextResponse.redirect(signedUrl);
      } catch (error) {
        console.error("Failed to generate signed URL:", error);
        return NextResponse.json(
          { error: "Fehler beim Erstellen des Download-Links" },
          { status: 500 }
        );
      }
    }

    // For local storage, read and stream the file
    try {
      const fileBuffer = await storage.getFile(resource.file_url, "resource");
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
          "Content-Length": fileBuffer.length.toString(),
        },
      });
    } catch {
      console.error("File not found:", resource.file_url);
      return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error downloading resource:", error);
    return NextResponse.json({ error: "Fehler beim Herunterladen der Ressource" }, { status: 500 });
  }
}

/**
 * POST /api/resources/[id]/download
 * Record a download without actually downloading the file
 * Returns the download URL for the client to use
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authentication check
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Bitte melden Sie sich an" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Fetch the resource
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: {
        id: true,
        price: true,
        is_published: true,
        is_approved: true,
        is_public: true,
        seller_id: true,
        transactions: {
          where: {
            buyer_id: userId,
            status: "COMPLETED",
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!resource) {
      return NextResponse.json({ error: "Ressource nicht gefunden" }, { status: 404 });
    }

    // Check access
    const isOwner = resource.seller_id === userId;
    const isPubliclyAccessible =
      resource.is_published && resource.is_approved && resource.is_public;

    if (!isOwner && !isPubliclyAccessible) {
      return NextResponse.json({ error: "Diese Ressource ist nicht verfügbar" }, { status: 403 });
    }

    const isFree = resource.price === 0;
    const hasPurchased = resource.transactions.length > 0;
    const hasAccess = isOwner || isFree || hasPurchased;

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Bitte kaufen Sie diese Ressource zuerst" },
        { status: 403 }
      );
    }

    // Record download for free resources
    if (isFree && !isOwner) {
      await prisma.download.upsert({
        where: {
          user_id_resource_id: {
            user_id: userId,
            resource_id: id,
          },
        },
        create: {
          user_id: userId,
          resource_id: id,
        },
        update: {},
      });
    }

    return NextResponse.json({
      success: true,
      downloadUrl: `/api/resources/${id}/download`,
    });
  } catch (error) {
    console.error("Error recording download:", error);
    return NextResponse.json({ error: "Fehler beim Verarbeiten der Anfrage" }, { status: 500 });
  }
}
