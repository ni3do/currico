/**
 * Test script for PDF preview generation
 * Run with: npx tsx scripts/test-preview-generation.ts
 */

import { generatePreview, canGeneratePreview } from "../lib/utils/preview-generator";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

// Create a minimal valid PDF for testing
function createTestPdf(): Buffer {
  // This is a minimal valid PDF that contains one page with "Test" text
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 24 Tf
100 700 Td
(Test PDF) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000266 00000 n
0000000359 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
434
%%EOF`;

  return Buffer.from(pdfContent);
}

async function main() {
  console.log("🧪 Testing Preview Generation");
  console.log("==============================\n");

  // Create test output directory
  const testDir = path.join(process.cwd(), "test-output");
  if (!existsSync(testDir)) {
    mkdirSync(testDir, { recursive: true });
  }

  // Test 1: Check canGeneratePreview for different MIME types
  console.log("📋 Test 1: canGeneratePreview function");
  const mimeTypes = [
    { type: "application/pdf", expected: true },
    { type: "image/png", expected: true },
    { type: "image/jpeg", expected: true },
    {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      expected: false,
    },
    { type: "application/vnd.ms-powerpoint", expected: false },
  ];

  for (const { type, expected } of mimeTypes) {
    const result = canGeneratePreview(type);
    const status = result === expected ? "✅" : "❌";
    console.log(`   ${status} ${type}: ${result} (expected: ${expected})`);
  }

  // Test 2: Generate preview from a test PDF
  console.log("\n📋 Test 2: PDF Preview Generation");
  try {
    const testPdf = createTestPdf();
    const testPdfPath = path.join(testDir, "test-input.pdf");
    writeFileSync(testPdfPath, testPdf);
    console.log(`   Created test PDF: ${testPdfPath} (${testPdf.length} bytes)`);

    console.log("   Generating preview from PDF...");
    const preview = await generatePreview(testPdf, "application/pdf");

    if (preview) {
      const previewPath = path.join(testDir, "test-preview.png");
      writeFileSync(previewPath, preview);
      console.log(`   ✅ Preview generated: ${previewPath} (${preview.length} bytes)`);

      // Verify it's a valid PNG (check magic bytes)
      const pngMagic = [0x89, 0x50, 0x4e, 0x47]; // PNG header
      const isValidPng = pngMagic.every((byte, i) => preview[i] === byte);
      console.log(`   ${isValidPng ? "✅" : "❌"} Valid PNG format: ${isValidPng}`);
    } else {
      console.log("   ❌ Preview generation returned null");
    }
  } catch (error) {
    console.log(`   ❌ Preview generation failed: ${error}`);
  }

  // Test 3: Generate preview from a test image
  console.log("\n📋 Test 3: Image Preview Generation");
  try {
    // Create a simple 100x100 red PNG using sharp
    const sharp = (await import("sharp")).default;
    const testImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();

    const testImagePath = path.join(testDir, "test-input.png");
    writeFileSync(testImagePath, testImage);
    console.log(`   Created test image: ${testImagePath} (${testImage.length} bytes)`);

    console.log("   Generating preview from image...");
    const preview = await generatePreview(testImage, "image/png");

    if (preview) {
      const previewPath = path.join(testDir, "test-image-preview.png");
      writeFileSync(previewPath, preview);
      console.log(`   ✅ Preview generated: ${previewPath} (${preview.length} bytes)`);
    } else {
      console.log("   ❌ Preview generation returned null");
    }
  } catch (error) {
    console.log(`   ❌ Image preview generation failed: ${error}`);
  }

  // Test 4: Test with Office document (should return null)
  console.log("\n📋 Test 4: Office Document (should not generate preview)");
  const fakeDocx = Buffer.from("Not a real docx file");
  const officePreview = await generatePreview(
    fakeDocx,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  console.log(
    `   ${officePreview === null ? "✅" : "❌"} Office preview is null: ${officePreview === null}`
  );

  console.log("\n==============================");
  console.log("🧪 Tests completed!");
  console.log(`   Output files saved to: ${testDir}`);
}

main().catch(console.error);
