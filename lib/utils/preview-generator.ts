import sharp from "sharp";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, readFile, mkdtemp, readdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const execAsync = promisify(exec);

const PREVIEW_WIDTH = 800;
const PREVIEW_HEIGHT = 1131; // A4 aspect ratio (roughly)
const PREVIEW_QUALITY = 60; // WebP quality
const WATERMARK_OPACITY = 0.18;
const WATERMARK_FALLBACK = "currico.ch";

/**
 * Escapes special XML characters for safe SVG text content.
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Creates an SVG watermark overlay with the seller's name tiled diagonally.
 * The name is repeated densely across the entire image at -30 degrees.
 */
function createWatermarkSvg(width: number, height: number, sellerName?: string): Buffer {
  const text = escapeXml(sellerName?.trim() || WATERMARK_FALLBACK);
  const fontSize = Math.round(width / 20);
  const rowSpacing = fontSize * 2.5;
  // Minimum column spacing prevents SVG explosion with short names (e.g. "Jo")
  const colSpacing = Math.max(fontSize * 8, text.length * fontSize * 0.7);
  const lines: string[] = [];
  let rowIndex = 0;

  // Tile text diagonally across the full image. Over-extend by 2x to ensure
  // full coverage after rotation. Alternate rows are offset by half the column
  // spacing for a staggered, harder-to-crop pattern.
  for (let y = -height; y < height * 2; y += rowSpacing) {
    const xOffset = rowIndex % 2 === 0 ? 0 : colSpacing / 2;
    for (let x = -width + xOffset; x < width * 2; x += colSpacing) {
      lines.push(
        `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="Arial, sans-serif" ` +
          `fill="rgba(0,0,0,${WATERMARK_OPACITY})" text-anchor="middle" ` +
          `transform="rotate(-30, ${x}, ${y})">${text}</text>`
      );
    }
    rowIndex++;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    ${lines.join("\n    ")}
  </svg>`;

  return Buffer.from(svg);
}

/**
 * Result of multi-page preview generation
 */
export interface PreviewPage {
  pageNumber: number;
  buffer: Buffer;
}

/**
 * Generates preview images from multiple pages of a PDF file.
 * Returns an array of buffers with page numbers (1-indexed).
 *
 * @param pdfBuffer The PDF file as a buffer
 * @param maxPages Maximum number of pages to generate (default: 3)
 * @param sellerName Seller's display name used as watermark text
 * @returns Array of preview pages with page numbers and image buffers
 */
export async function generatePdfPreviewPages(
  pdfBuffer: Buffer,
  maxPages: number = 3,
  sellerName?: string
): Promise<PreviewPage[]> {
  let tempDir: string | null = null;

  try {
    // Create a temporary directory for the conversion
    tempDir = await mkdtemp(join(tmpdir(), "pdf-preview-"));
    const inputPath = join(tempDir, "input.pdf");
    const outputPrefix = join(tempDir, "output");

    // Write PDF buffer to temp file
    await writeFile(inputPath, pdfBuffer);

    // Use pdftoppm to convert first N pages to PNG
    // -png: output PNG format
    // -f 1 -l {maxPages}: first to maxPages
    // -r 150: 150 DPI resolution (good balance of quality/size)
    await execAsync(`pdftoppm -png -f 1 -l ${maxPages} -r 150 "${inputPath}" "${outputPrefix}"`, {
      timeout: 60000, // Longer timeout for multiple pages
    });

    // Read all generated PNG files
    // pdftoppm outputs files like output-1.png, output-2.png, etc.
    const files = await readdir(tempDir);
    const pngFiles = files
      .filter((f) => f.startsWith("output-") && f.endsWith(".png"))
      .sort((a, b) => {
        // Sort by page number
        const numA = parseInt(a.match(/output-(\d+)\.png/)?.[1] || "0", 10);
        const numB = parseInt(b.match(/output-(\d+)\.png/)?.[1] || "0", 10);
        return numA - numB;
      });

    const results: PreviewPage[] = [];

    for (const pngFile of pngFiles) {
      const pageNumber = parseInt(pngFile.match(/output-(\d+)\.png/)?.[1] || "0", 10);
      if (pageNumber === 0) continue;

      const outputPath = join(tempDir, pngFile);
      const pngBuffer = await readFile(outputPath);

      // Create watermarked preview:
      // 1. Resize to preview dimensions
      // 2. Composite a repeating diagonal watermark overlay
      // 3. Output as WebP for compression
      const resized = sharp(pngBuffer).resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      });
      const { width: actualW, height: actualH } = await resized.metadata();
      const w = actualW || PREVIEW_WIDTH;
      const h = actualH || PREVIEW_HEIGHT;
      const watermarkSvg = createWatermarkSvg(w, h, sellerName);

      const watermarked = await resized
        .composite([{ input: watermarkSvg, blend: "over" }])
        .webp({ quality: PREVIEW_QUALITY })
        .toBuffer();

      results.push({
        pageNumber,
        buffer: watermarked,
      });
    }

    return results;
  } catch (error) {
    // Check if pdftoppm is not available
    if (error instanceof Error && error.message.includes("not found")) {
      console.warn("pdftoppm not available - PDF preview generation disabled");
    } else {
      console.error("Error generating PDF preview pages:", error);
    }
    return [];
  } finally {
    // Clean up temp files
    if (tempDir) {
      try {
        const { rm } = await import("fs/promises");
        await rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Generates a preview image from a PDF file buffer using pdftoppm (poppler-utils).
 * Returns the first page rendered as a PNG buffer.
 * @deprecated Use generatePdfPreviewPages for multi-page support
 */
export async function generatePdfPreview(
  pdfBuffer: Buffer,
  sellerName?: string
): Promise<Buffer | null> {
  const pages = await generatePdfPreviewPages(pdfBuffer, 1, sellerName);
  return pages.length > 0 ? pages[0].buffer : null;
}

/**
 * Generates a pixelated preview image from an image file buffer.
 * Creates a heavily pixelated version that's unusable as the actual content.
 */
export async function generateImagePreview(
  imageBuffer: Buffer,
  sellerName?: string
): Promise<Buffer | null> {
  try {
    // Create watermarked preview:
    // 1. Resize to preview dimensions
    // 2. Composite a repeating diagonal watermark overlay
    // 3. Output as WebP for compression
    const resized = sharp(imageBuffer).resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, {
      fit: "inside",
      withoutEnlargement: true,
    });
    const { width: actualW, height: actualH } = await resized.metadata();
    const w = actualW || PREVIEW_WIDTH;
    const h = actualH || PREVIEW_HEIGHT;
    const watermarkSvg = createWatermarkSvg(w, h, sellerName);

    const watermarked = await resized
      .composite([{ input: watermarkSvg, blend: "over" }])
      .webp({ quality: PREVIEW_QUALITY })
      .toBuffer();

    return watermarked;
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
  mimeType: string,
  sellerName?: string
): Promise<Buffer | null> {
  // PDF files
  if (mimeType === "application/pdf") {
    return generatePdfPreview(fileBuffer, sellerName);
  }

  // Image files - create a resized preview
  if (mimeType.startsWith("image/")) {
    return generateImagePreview(fileBuffer, sellerName);
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
