import { describe, it, expect } from "vitest";
import {
  createMaterialSchema,
  validateMagicBytes,
  isAllowedMaterialType,
  isAllowedPreviewType,
  getExtensionFromMimeType,
} from "@/lib/validations/material";

describe("createMaterialSchema", () => {
  const validInput = {
    title: "Test Material",
    description: "A great teaching material for students",
    price: 500,
    subjects: ["MA"],
    cycles: ["Z1"],
    tags: ["math"],
  };

  it("accepts valid input", () => {
    const result = createMaterialSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 3 characters", () => {
    const result = createMaterialSchema.safeParse({ ...validInput, title: "AB" });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 64 characters", () => {
    const result = createMaterialSchema.safeParse({
      ...validInput,
      title: "A".repeat(65),
    });
    expect(result.success).toBe(false);
  });

  it("rejects description shorter than 10 characters", () => {
    const result = createMaterialSchema.safeParse({
      ...validInput,
      description: "Short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = createMaterialSchema.safeParse({ ...validInput, price: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects price not in 50-cent increments", () => {
    const result = createMaterialSchema.safeParse({ ...validInput, price: 75 });
    expect(result.success).toBe(false);
  });

  it("accepts free price (0)", () => {
    const result = createMaterialSchema.safeParse({ ...validInput, price: 0 });
    expect(result.success).toBe(true);
  });

  it("accepts valid paid price (50 cent increments)", () => {
    const result = createMaterialSchema.safeParse({ ...validInput, price: 250 });
    expect(result.success).toBe(true);
  });

  it("rejects price below 50 cents (non-zero)", () => {
    const result = createMaterialSchema.safeParse({ ...validInput, price: 25 });
    expect(result.success).toBe(false);
  });

  it("requires cycles when subject is not SONSTIGE", () => {
    const result = createMaterialSchema.safeParse({
      ...validInput,
      subjects: ["MA"],
      cycles: [],
    });
    expect(result.success).toBe(false);
  });

  it("allows empty cycles when subject is SONSTIGE", () => {
    const result = createMaterialSchema.safeParse({
      ...validInput,
      subjects: ["SONSTIGE"],
      cycles: [],
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one subject", () => {
    const result = createMaterialSchema.safeParse({
      ...validInput,
      subjects: [],
    });
    expect(result.success).toBe(false);
  });

  it("transforms tags to lowercase", () => {
    const result = createMaterialSchema.safeParse({
      ...validInput,
      tags: ["Math", "SCIENCE"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(["math", "science"]);
    }
  });
});

describe("validateMagicBytes", () => {
  it("validates PDF magic bytes correctly", () => {
    const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
    expect(validateMagicBytes(pdfBuffer, "application/pdf")).toBe(true);
  });

  it("rejects mismatched magic bytes", () => {
    const notPdf = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    expect(validateMagicBytes(notPdf, "application/pdf")).toBe(false);
  });

  it("returns true for unknown MIME types (no signature defined)", () => {
    const buffer = Buffer.from([0x00, 0x01, 0x02]);
    expect(validateMagicBytes(buffer, "text/plain")).toBe(true);
  });

  it("validates JPEG magic bytes", () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    expect(validateMagicBytes(jpeg, "image/jpeg")).toBe(true);
  });

  it("validates PNG magic bytes", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    expect(validateMagicBytes(png, "image/png")).toBe(true);
  });

  it("validates Office ZIP magic bytes (PK)", () => {
    const pk = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    expect(
      validateMagicBytes(
        pk,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe(true);
  });
});

describe("isAllowedMaterialType", () => {
  it("accepts PDF for pdf resource type", () => {
    expect(isAllowedMaterialType("application/pdf", "pdf")).toBe(true);
  });

  it("rejects Word MIME for pdf resource type", () => {
    expect(isAllowedMaterialType("application/msword", "pdf")).toBe(false);
  });

  it("accepts Word MIME for word resource type", () => {
    expect(isAllowedMaterialType("application/msword", "word")).toBe(true);
    expect(
      isAllowedMaterialType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "word"
      )
    ).toBe(true);
  });

  it("accepts various types for 'other' resource type", () => {
    expect(isAllowedMaterialType("application/pdf", "other")).toBe(true);
    expect(isAllowedMaterialType("text/plain", "other")).toBe(true);
    expect(isAllowedMaterialType("image/jpeg", "other")).toBe(true);
  });

  it("rejects unknown MIME type for specific resource type", () => {
    expect(isAllowedMaterialType("application/octet-stream", "pdf")).toBe(false);
  });

  it("returns false for unknown resource type", () => {
    expect(isAllowedMaterialType("application/pdf", "unknown")).toBe(false);
  });
});

describe("isAllowedPreviewType", () => {
  it("accepts allowed preview types", () => {
    expect(isAllowedPreviewType("image/jpeg")).toBe(true);
    expect(isAllowedPreviewType("image/png")).toBe(true);
    expect(isAllowedPreviewType("image/webp")).toBe(true);
  });

  it("rejects non-image types", () => {
    expect(isAllowedPreviewType("application/pdf")).toBe(false);
    expect(isAllowedPreviewType("image/gif")).toBe(false);
  });
});

describe("getExtensionFromMimeType", () => {
  it("returns correct extensions for known MIME types", () => {
    expect(getExtensionFromMimeType("application/pdf")).toBe("pdf");
    expect(getExtensionFromMimeType("application/msword")).toBe("doc");
    expect(
      getExtensionFromMimeType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe("docx");
    expect(getExtensionFromMimeType("image/jpeg")).toBe("jpg");
    expect(getExtensionFromMimeType("image/png")).toBe("png");
  });

  it("returns 'bin' for unknown MIME types", () => {
    expect(getExtensionFromMimeType("application/octet-stream")).toBe("bin");
    expect(getExtensionFromMimeType("text/html")).toBe("bin");
  });
});
