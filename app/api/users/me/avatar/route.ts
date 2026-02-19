import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, badRequest, serverError } from "@/lib/api";
import {
  getStorage,
  generateStorageKey,
  isLegacyLocalPath,
  getLegacyFilePath,
} from "@/lib/storage";
import { unlink } from "fs/promises";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

// Magic bytes for image type validation
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47], // \x89PNG
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF (WebP also has WEBP at offset 8)
};

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const expectedBytes = MAGIC_BYTES[mimeType];
  if (!expectedBytes) return false;

  for (let i = 0; i < expectedBytes.length; i++) {
    if (buffer[i] !== expectedBytes[i]) return false;
  }

  // Additional check for WebP: bytes 8-11 should be "WEBP"
  if (mimeType === "image/webp") {
    const webpSignature = [0x57, 0x45, 0x42, 0x50]; // WEBP
    for (let i = 0; i < webpSignature.length; i++) {
      if (buffer[8 + i] !== webpSignature[i]) return false;
    }
  }

  return true;
}

/**
 * POST /api/users/me/avatar
 * Upload a new avatar image
 * Access: Authenticated user only
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return badRequest("Keine Datei hochgeladen");
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return badRequest("Ungültiger Dateityp. Erlaubt: JPG, PNG, WebP");
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return badRequest("Datei zu gross. Maximum: 2MB");
    }

    // Validate file content with magic bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateMagicBytes(buffer, file.type)) {
      return badRequest("Dateiinhalt stimmt nicht mit dem Dateityp überein");
    }

    // Delete old avatar file if it exists
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    const storage = getStorage();

    if (currentUser?.image) {
      try {
        if (isLegacyLocalPath(currentUser.image)) {
          await unlink(getLegacyFilePath(currentUser.image));
        } else {
          await storage.delete(currentUser.image, "avatar");
        }
      } catch {
        // Old file might not exist, continue
      }
    }

    // Upload via storage abstraction
    const ext = file.type.split("/")[1];
    const result = await storage.upload(buffer, {
      category: "avatar",
      userId,
      filename: `avatar.${ext}`,
      contentType: file.type,
    });

    const imageUrl = result.publicUrl || result.key;

    // Update user's image in database
    await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });

    return NextResponse.json({
      message: "Avatar erfolgreich hochgeladen",
      url: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return serverError("Interner Serverfehler");
  }
}

/**
 * DELETE /api/users/me/avatar
 * Remove the current avatar
 * Access: Authenticated user only
 */
export async function DELETE() {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    // Remove avatar from database (keep file for now, could add cleanup later)
    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });

    return NextResponse.json({
      message: "Avatar erfolgreich entfernt",
    });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return serverError("Interner Serverfehler");
  }
}
