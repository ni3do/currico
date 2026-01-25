import sharp from "sharp";
import { pdf } from "pdf-to-img";

const PREVIEW_WIDTH = 800;
const PREVIEW_HEIGHT = 1131; // A4 aspect ratio (roughly)
const PREVIEW_QUALITY = 80;

/**
 * Generates a preview image from a PDF file buffer.
 * Returns the first page rendered as a PNG buffer.
 */
export async function generatePdfPreview(pdfBuffer: Buffer): Promise<Buffer | null> {
  try {
    // pdf-to-img returns an async iterator of page images
    const document = await pdf(pdfBuffer, { scale: 2.0 });

    // Get only the first page
    for await (const image of document) {
      // 'image' is a Buffer containing PNG data
      // Resize it to our preview dimensions
      const resized = await sharp(image)
        .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .png({ quality: PREVIEW_QUALITY })
        .toBuffer();

      return resized;
    }

    return null;
  } catch (error) {
    console.error("Error generating PDF preview:", error);
    return null;
  }
}

/**
 * Generates a preview image from an image file buffer.
 * Resizes the image to preview dimensions.
 */
export async function generateImagePreview(imageBuffer: Buffer): Promise<Buffer | null> {
  try {
    const resized = await sharp(imageBuffer)
      .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .png({ quality: PREVIEW_QUALITY })
      .toBuffer();

    return resized;
  } catch (error) {
    console.error("Error generating image preview:", error);
    return null;
  }
}

/**
 * Determines the appropriate preview generation method based on file type
 * and generates a preview image.
 */
export async function generatePreview(
  fileBuffer: Buffer,
  mimeType: string
): Promise<Buffer | null> {
  // PDF files
  if (mimeType === "application/pdf") {
    return generatePdfPreview(fileBuffer);
  }

  // Image files - create a resized preview
  if (mimeType.startsWith("image/")) {
    return generateImagePreview(fileBuffer);
  }

  // For Office documents (Word, PowerPoint, Excel), we cannot easily
  // generate a preview without external tools like LibreOffice.
  // Return null to indicate no preview can be generated.
  // The frontend can show a type-specific placeholder icon instead.
  return null;
}

/**
 * Supported file types that can have auto-generated previews.
 */
export function canGeneratePreview(mimeType: string): boolean {
  return mimeType === "application/pdf" || mimeType.startsWith("image/");
}
