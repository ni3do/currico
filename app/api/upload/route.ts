import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized, badRequest, serverError } from "@/lib/api";
import path from "path";
import { getStorage } from "@/lib/storage";
import type { FileCategory } from "@/lib/storage";

// Maximum file sizes
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for main files
const MAX_PREVIEW_SIZE = 10 * 1024 * 1024; // 10MB for previews

// Allowed file types
const ALLOWED_MAIN_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ALLOWED_PREVIEW_TYPES = ["image/png", "image/jpeg", "image/jpg"];

/**
 * POST /api/upload
 * Upload files for a resource (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const formData = await request.formData();
    const fileType = formData.get("type") as string; // "main" or "preview"
    const file = formData.get("file") as File;

    if (!file) {
      return badRequest("Keine Datei angegeben");
    }

    // Validate file type
    const isPreview = fileType === "preview";
    const allowedTypes = isPreview ? ALLOWED_PREVIEW_TYPES : ALLOWED_MAIN_TYPES;
    const maxSize = isPreview ? MAX_PREVIEW_SIZE : MAX_FILE_SIZE;

    if (!allowedTypes.includes(file.type)) {
      return badRequest(`Invalid file type: ${file.type}`, {
        allowed: allowedTypes,
      });
    }

    if (file.size > maxSize) {
      return badRequest(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`, {
        size: file.size,
        maxSize,
      });
    }

    // Get storage provider
    const storage = getStorage();

    // Determine category based on file type
    const category: FileCategory = isPreview ? "preview" : "material";

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to storage
    const result = await storage.upload(buffer, {
      category,
      userId,
      filename: file.name,
      contentType: file.type,
    });

    // Return the storage key and public URL if available
    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.publicUrl || result.key,
      filename: path.basename(result.key),
      originalName: file.name,
      size: result.size,
      type: result.contentType,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return serverError("Fehler beim Hochladen der Datei");
  }
}
