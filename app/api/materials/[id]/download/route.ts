import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { readFile } from "fs/promises";
import path from "path";
import { getStorage, isLegacyLocalPath, getLegacyFilePath } from "@/lib/storage";
import { checkAndUpdateVerification } from "@/lib/utils/verified-seller";
import {
  badRequest,
  unauthorized,
  notFound,
  forbidden,
  serverError,
  API_ERROR_CODES,
} from "@/lib/api";
import { isValidId } from "@/lib/rateLimit";
import { checkDownloadMilestone } from "@/lib/notifications";
import { captureError } from "@/lib/api-error";

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
 * Create a safe filename from material title
 */
function getSafeFilename(title: string, filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const safeTitle = title.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, "").trim();
  return `${safeTitle}${ext}`;
}

/**
 * GET /api/materials/[id]/download
 * Download a material file
 * - Admins can download any material
 * - Free materials: any authenticated user can download
 * - Paid materials: only users who have purchased can download
 * - Owners can always download their own materials
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authentication check
  const userId = await getCurrentUserId();
  if (!userId) {
    return unauthorized();
  }

  // Check if user is admin
  const admin = await requireAdmin();
  const isAdmin = !!admin;

  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);

    // Fetch the material with related data
    const material = await prisma.resource.findUnique({
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

    if (!material) {
      return notFound();
    }

    // Check if material is accessible
    // Admins can access any material
    const isOwner = material.seller_id === userId;
    const isPubliclyAccessible =
      material.is_published && material.is_approved && material.is_public;

    if (!isAdmin && !isOwner && !isPubliclyAccessible) {
      return forbidden("Material unavailable", API_ERROR_CODES.MATERIAL_UNAVAILABLE);
    }

    // Check access rights for downloads
    // Admins always have access
    const isFree = material.price === 0;
    const hasPurchased = material.transactions.length > 0;
    const hasDownloaded = material.downloads.length > 0;
    const isVerified = material.is_approved;

    if (process.env.NODE_ENV === "development") {
      console.log("[DOWNLOAD] ACCESS CHECK:", {
        id,
        userId,
        isAdmin,
        isOwner,
        isFree,
        isVerified,
        hasPurchased,
        hasDownloaded,
      });
    }

    // Regular users cannot download unverified materials (except owners/admins)
    if (!isAdmin && !isOwner && !isVerified) {
      if (process.env.NODE_ENV === "development")
        console.log("[DOWNLOAD] ACCESS DENIED - not verified");
      return forbidden("Material under review", API_ERROR_CODES.MATERIAL_UNDER_REVIEW);
    }

    // Grant access if: admin, owner, free material, or has purchased
    const hasAccess = isAdmin || isOwner || isFree || hasPurchased;
    if (process.env.NODE_ENV === "development") console.log("[DOWNLOAD] hasAccess:", hasAccess);

    if (!hasAccess) {
      return forbidden("Purchase required", API_ERROR_CODES.PURCHASE_REQUIRED);
    }

    // Record download for free materials (if not already recorded)
    if (isFree && !isOwner && !hasDownloaded) {
      await prisma.download.create({
        data: {
          user_id: userId,
          resource_id: id,
        },
      });

      // Check for download milestones (fire-and-forget)
      checkDownloadMilestone(id).catch((err) =>
        captureError("Milestone check failed after free download:", err)
      );
    }

    const storage = getStorage();
    const filename = getSafeFilename(material.title, material.file_url);
    const contentType = getContentType(material.file_url);

    // Check if this is a legacy local path (starts with /uploads/)
    if (isLegacyLocalPath(material.file_url)) {
      // Handle legacy local file
      const filePath = getLegacyFilePath(material.file_url);
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
        captureError("Legacy file not found:", filePath);
        return notFound();
      }
    }

    // For S3 storage, redirect to signed URL
    if (!storage.isLocal()) {
      try {
        const signedUrl = await storage.getSignedUrl(material.file_url, {
          expiresIn: 3600, // 1 hour
          downloadFilename: filename,
        });
        return NextResponse.redirect(signedUrl);
      } catch (error) {
        captureError("Failed to generate signed URL:", error);
        return serverError();
      }
    }

    // For local storage, read and stream the file
    try {
      const fileBuffer = await storage.getFile(material.file_url, "material");
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
          "Content-Length": fileBuffer.length.toString(),
        },
      });
    } catch {
      captureError("File not found:", material.file_url);
      return notFound();
    }
  } catch (error) {
    captureError("Error downloading material:", error);
    return serverError();
  }
}

/**
 * POST /api/materials/[id]/download
 * Record a download without actually downloading the file
 * Returns the download URL for the client to use
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authentication check
  const userId = await getCurrentUserId();
  if (!userId) {
    return unauthorized();
  }

  // Check if user is admin
  const admin = await requireAdmin();
  const isAdmin = !!admin;

  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);

    // Fetch the material
    const material = await prisma.resource.findUnique({
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

    if (!material) {
      return notFound();
    }

    // Check access - admins can access any material
    const isOwner = material.seller_id === userId;

    // Regular users cannot download unverified materials
    if (!isAdmin && !isOwner && !material.is_approved) {
      return forbidden("Material under review", API_ERROR_CODES.MATERIAL_UNDER_REVIEW);
    }

    const isPubliclyAccessible =
      material.is_published && material.is_approved && material.is_public;

    if (!isAdmin && !isOwner && !isPubliclyAccessible) {
      return forbidden("Material unavailable", API_ERROR_CODES.MATERIAL_UNAVAILABLE);
    }

    const isFree = material.price === 0;
    const hasPurchased = material.transactions.length > 0;
    const hasAccess = isAdmin || isOwner || isFree || hasPurchased;

    if (!hasAccess) {
      return forbidden("Purchase required", API_ERROR_CODES.PURCHASE_REQUIRED);
    }

    // Record download for free materials
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

      // Check if seller now qualifies for verified status (fire-and-forget)
      checkAndUpdateVerification(material.seller_id).catch((err) =>
        captureError("Verification check failed after download:", err)
      );

      // Check for download milestones (fire-and-forget)
      checkDownloadMilestone(id).catch((err) =>
        captureError("Milestone check failed after free download record:", err)
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: `/api/materials/${id}/download`,
    });
  } catch (error) {
    captureError("Error recording download:", error);
    return serverError();
  }
}
