import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";

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
        { error: "invalid_token", message: "Download link not found" },
        { status: 404 }
      );
    }

    // Check if transaction is completed
    if (downloadToken.transaction.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "payment_incomplete", message: "Payment has not been completed" },
        { status: 400 }
      );
    }

    // Check if token has expired
    const now = new Date();
    if (now > downloadToken.expires_at) {
      return NextResponse.json(
        { error: "expired", message: "Download link has expired" },
        { status: 410 }
      );
    }

    // Check if max downloads exceeded
    if (downloadToken.download_count >= downloadToken.max_downloads) {
      return NextResponse.json(
        { error: "max_downloads", message: "Maximum downloads reached" },
        { status: 410 }
      );
    }

    const resource = downloadToken.transaction.resource;

    // Get the file path
    const filePath = path.join(process.cwd(), "public", resource.file_url);

    try {
      // Read the file
      const fileBuffer = await readFile(filePath);

      // Increment download count
      await prisma.downloadToken.update({
        where: { id: downloadToken.id },
        data: { download_count: { increment: 1 } },
      });

      // Determine content type based on file extension
      const ext = path.extname(resource.file_url).toLowerCase();
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

      const contentType = contentTypes[ext] || "application/octet-stream";

      // Create a safe filename
      const safeTitle = resource.title.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, "").trim();
      const filename = `${safeTitle}${ext}`;

      // Return the file
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
          "Content-Length": fileBuffer.length.toString(),
        },
      });
    } catch {
      console.error("File not found:", filePath);
      return NextResponse.json(
        { error: "file_not_found", message: "File not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error processing download token:", error);
    return NextResponse.json(
      { error: "server_error", message: "An error occurred" },
      { status: 500 }
    );
  }
}
