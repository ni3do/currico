// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so mock variables are available in vi.mock factories
const { mockToBuffer, mockWebp, mockComposite, mockMetadata, mockResize, mockSharp } = vi.hoisted(
  () => {
    const mockToBuffer = vi.fn().mockResolvedValue(Buffer.from("fake-webp"));
    const mockWebp = vi.fn().mockReturnValue({ toBuffer: mockToBuffer });
    const mockComposite = vi.fn().mockReturnValue({ webp: mockWebp });
    const mockMetadata = vi.fn().mockResolvedValue({ width: 800, height: 1131 });
    const mockResize = vi.fn().mockReturnValue({
      metadata: mockMetadata,
      composite: mockComposite,
    });
    const mockSharp = vi.fn().mockReturnValue({ resize: mockResize });
    return { mockToBuffer, mockWebp, mockComposite, mockMetadata, mockResize, mockSharp };
  }
);

vi.mock("sharp", () => ({ default: mockSharp }));

// Mock child_process.exec so pdftoppm calls fail gracefully
const { mockExec } = vi.hoisted(() => {
  const mockExec = vi.fn();
  return { mockExec };
});

vi.mock("child_process", () => ({
  exec: mockExec,
}));

import {
  canGeneratePreview,
  generatePreview,
  generateImagePreview,
  generatePdfPreview,
  generatePdfPreviewPages,
} from "@/lib/utils/preview-generator";

beforeEach(() => {
  vi.clearAllMocks();
  // Restore default mock implementations
  mockToBuffer.mockResolvedValue(Buffer.from("fake-webp"));
  mockWebp.mockReturnValue({ toBuffer: mockToBuffer });
  mockComposite.mockReturnValue({ webp: mockWebp });
  mockMetadata.mockResolvedValue({ width: 800, height: 1131 });
  mockResize.mockReturnValue({
    metadata: mockMetadata,
    composite: mockComposite,
  });
  // exec: callback with error (pdftoppm not found)
  mockExec.mockImplementation((_cmd: string, _opts: unknown, cb?: (err: Error | null) => void) => {
    if (cb) cb(new Error("pdftoppm not found"));
  });
});

describe("canGeneratePreview", () => {
  it("returns true for PDF files", () => {
    expect(canGeneratePreview("application/pdf")).toBe(true);
  });

  it("returns true for image types", () => {
    expect(canGeneratePreview("image/png")).toBe(true);
    expect(canGeneratePreview("image/jpeg")).toBe(true);
    expect(canGeneratePreview("image/webp")).toBe(true);
    expect(canGeneratePreview("image/gif")).toBe(true);
  });

  it("returns false for Office documents", () => {
    expect(
      canGeneratePreview("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ).toBe(false);
    expect(
      canGeneratePreview(
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      )
    ).toBe(false);
    expect(canGeneratePreview("application/msword")).toBe(false);
  });

  it("returns false for zip files", () => {
    expect(canGeneratePreview("application/zip")).toBe(false);
  });

  it("returns false for unknown types", () => {
    expect(canGeneratePreview("text/plain")).toBe(false);
    expect(canGeneratePreview("application/octet-stream")).toBe(false);
  });
});

describe("generateImagePreview", () => {
  it("returns a buffer on success", async () => {
    const result = await generateImagePreview(Buffer.from("fake-image"));
    expect(result).toBeInstanceOf(Buffer);
  });

  it("calls sharp with correct resize params", async () => {
    await generateImagePreview(Buffer.from("fake-image"));

    expect(mockSharp).toHaveBeenCalledWith(Buffer.from("fake-image"));
    expect(mockResize).toHaveBeenCalledWith(800, 1131, {
      fit: "inside",
      withoutEnlargement: true,
    });
  });

  it("composites a watermark SVG overlay", async () => {
    await generateImagePreview(Buffer.from("fake-image"), "Test Seller");

    expect(mockComposite).toHaveBeenCalledWith([
      expect.objectContaining({
        input: expect.any(Buffer),
        blend: "over",
      }),
    ]);

    // The watermark SVG should contain the seller name
    const svgBuffer = mockComposite.mock.calls[0][0][0].input;
    const svgString = svgBuffer.toString();
    expect(svgString).toContain("Test Seller");
    expect(svgString).toContain("<svg");
    expect(svgString).toContain("rotate(-30");
  });

  it("uses fallback watermark text when no seller name provided", async () => {
    await generateImagePreview(Buffer.from("fake-image"));

    const svgBuffer = mockComposite.mock.calls[0][0][0].input;
    const svgString = svgBuffer.toString();
    expect(svgString).toContain("currico.ch");
  });

  it("escapes XML special characters in seller name", async () => {
    await generateImagePreview(Buffer.from("fake-image"), 'Test <&> "Seller"');

    const svgBuffer = mockComposite.mock.calls[0][0][0].input;
    const svgString = svgBuffer.toString();
    expect(svgString).toContain("Test &lt;&amp;&gt; &quot;Seller&quot;");
    expect(svgString).not.toContain("<&>");
  });

  it("outputs WebP format with quality 60", async () => {
    await generateImagePreview(Buffer.from("fake-image"));
    expect(mockWebp).toHaveBeenCalledWith({ quality: 60 });
  });

  it("returns null on sharp error", async () => {
    mockResize.mockReturnValueOnce({
      metadata: vi.fn().mockRejectedValue(new Error("Invalid image")),
    });

    const result = await generateImagePreview(Buffer.from("bad-image"));
    expect(result).toBeNull();
  });

  it("uses fallback dimensions when metadata returns undefined", async () => {
    mockMetadata.mockResolvedValueOnce({ width: undefined, height: undefined });
    mockResize.mockReturnValueOnce({
      metadata: mockMetadata,
      composite: mockComposite,
    });

    const result = await generateImagePreview(Buffer.from("fake-image"));
    expect(result).not.toBeNull();
  });
});

describe("generatePdfPreview", () => {
  it("returns null when pdftoppm is not available", async () => {
    const result = await generatePdfPreview(Buffer.from("fake-pdf"));
    expect(result).toBeNull();
  });
});

describe("generatePdfPreviewPages", () => {
  it("returns empty array when pdftoppm is not available", async () => {
    const result = await generatePdfPreviewPages(Buffer.from("fake-pdf"));
    expect(result).toEqual([]);
  });
});

describe("generatePreview", () => {
  it("routes PDF to generatePdfPreview", async () => {
    const result = await generatePreview(Buffer.from("fake-pdf"), "application/pdf");
    expect(result).toBeNull();
  });

  it("routes images to generateImagePreview", async () => {
    const result = await generatePreview(Buffer.from("fake-image"), "image/png");
    expect(result).toBeInstanceOf(Buffer);
  });

  it("routes image/jpeg to generateImagePreview", async () => {
    const result = await generatePreview(Buffer.from("fake-image"), "image/jpeg");
    expect(result).toBeInstanceOf(Buffer);
  });

  it("returns null for unsupported types", async () => {
    expect(await generatePreview(Buffer.from("test"), "application/zip")).toBeNull();
    expect(await generatePreview(Buffer.from("test"), "text/plain")).toBeNull();
    expect(await generatePreview(Buffer.from("test"), "application/msword")).toBeNull();
  });

  it("passes seller name through to watermark", async () => {
    await generatePreview(Buffer.from("fake-image"), "image/png", "My Seller");

    const svgBuffer = mockComposite.mock.calls[0][0][0].input;
    const svgString = svgBuffer.toString();
    expect(svgString).toContain("My Seller");
  });
});
