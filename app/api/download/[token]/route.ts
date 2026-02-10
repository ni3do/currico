import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
 * GET /api/download/[token]
 * Download a resource file using a guest download token
 * - Validates token exists and is not expired
 * - Checks download count hasn't exceeded max
 * - Increments download count on successful download
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the download token with transaction and resource info
    const downloadToken = await prisma.downloadToken.findUnique({
      where: { token },
      select: {
        id: true,
        expires_at: true,
        download_count: true,
        max_downloads: true,
        transaction: {
          select: {
            id: true,
            status: true,
            resource: {
              select: {
                id: true,
                title: true,
                file_url: true,
              },
            },
          },
        },
      },
    });

    if (!downloadToken) {
      return NextResponse.json(
        { error: "invalid_token", message: "Download-Link nicht gefunden" },
        { status: 404 }
      );
    }

    // Check if transaction is completed
    if (downloadToken.transaction.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "payment_incomplete", message: "Zahlung wurde noch nicht abgeschlossen" },
        { status: 400 }
      );
    }

    // Check if token has expired
    const now = new Date();
    if (now > downloadToken.expires_at) {
      return NextResponse.json(
        { error: "expired", message: "Download-Link ist abgelaufen" },
        { status: 410 }
      );
    }

    // Check if max downloads exceeded
    if (downloadToken.download_count >= downloadToken.max_downloads) {
      return NextResponse.json(
        { error: "max_downloads", message: "Maximale Anzahl Downloads erreicht" },
        { status: 410 }
      );
    }

    const resource = downloadToken.transaction.resource;
    const storage = getStorage();
    const filename = getSafeFilename(resource.title, resource.file_url);
    const contentType = getContentType(resource.file_url);

    // Increment download count before serving the file
    await prisma.downloadToken.update({
      where: { id: downloadToken.id },
      data: { download_count: { increment: 1 } },
    });

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
        return NextResponse.json(
          { error: "file_not_found", message: "Datei nicht gefunden" },
          { status: 404 }
        );
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
          { error: "server_error", message: "Fehler beim Erstellen des Download-Links" },
          { status: 500 }
        );
      }
    }

    // For local storage, read and stream the file
    try {
      const fileBuffer = await storage.getFile(resource.file_url, "material");
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
          "Content-Length": fileBuffer.length.toString(),
        },
      });
    } catch {
      console.error("File not found:", resource.file_url);
      return NextResponse.json(
        { error: "file_not_found", message: "Datei nicht gefunden" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error processing download token:", error);
    return NextResponse.json(
      { error: "server_error", message: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
