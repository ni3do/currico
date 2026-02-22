import { describe, it, expect } from "vitest";
import { getFileFormat, getFileFormatLabel } from "@/lib/utils/file-format";

describe("getFileFormat", () => {
  it("returns 'pdf' for .pdf files", () => {
    expect(getFileFormat("materials/abc123/worksheet.pdf")).toBe("pdf");
  });

  it("returns 'word' for .doc files", () => {
    expect(getFileFormat("file.doc")).toBe("word");
  });

  it("returns 'word' for .docx files", () => {
    expect(getFileFormat("doc.docx")).toBe("word");
  });

  it("returns 'powerpoint' for .ppt files", () => {
    expect(getFileFormat("slides.ppt")).toBe("powerpoint");
  });

  it("returns 'powerpoint' for .pptx files", () => {
    expect(getFileFormat("presentation.pptx")).toBe("powerpoint");
  });

  it("returns 'excel' for .xlsx files", () => {
    expect(getFileFormat("data.xlsx")).toBe("excel");
  });

  it("returns 'excel' for .csv files", () => {
    expect(getFileFormat("data.csv")).toBe("excel");
  });

  it("returns 'onenote' for .one files", () => {
    expect(getFileFormat("notes.one")).toBe("onenote");
  });

  it("returns 'other' for unknown extensions", () => {
    expect(getFileFormat("file.zip")).toBe("other");
    expect(getFileFormat("file.txt")).toBe("other");
  });

  it("returns 'other' for null/undefined input", () => {
    expect(getFileFormat(null)).toBe("other");
    expect(getFileFormat(undefined)).toBe("other");
  });

  it("returns 'other' for files with no extension", () => {
    expect(getFileFormat("README")).toBe("other");
  });

  it("handles uppercase extensions (case insensitive)", () => {
    expect(getFileFormat("FILE.PDF")).toBe("pdf");
    expect(getFileFormat("FILE.DOCX")).toBe("word");
  });
});

describe("getFileFormatLabel", () => {
  it("returns 'PDF' for pdf files", () => {
    expect(getFileFormatLabel("file.pdf")).toBe("PDF");
  });

  it("returns 'Word' for word files", () => {
    expect(getFileFormatLabel("file.docx")).toBe("Word");
  });

  it("returns 'PowerPoint' for ppt files", () => {
    expect(getFileFormatLabel("file.pptx")).toBe("PowerPoint");
  });

  it("returns 'Excel' for excel files", () => {
    expect(getFileFormatLabel("file.xlsx")).toBe("Excel");
  });

  it("returns 'OneNote' for onenote files", () => {
    expect(getFileFormatLabel("file.one")).toBe("OneNote");
  });

  it("returns 'Other' for unknown files", () => {
    expect(getFileFormatLabel("file.zip")).toBe("Other");
    expect(getFileFormatLabel(null)).toBe("Other");
  });
});
