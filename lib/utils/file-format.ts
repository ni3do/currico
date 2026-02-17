/**
 * Derive a normalized file format key from a file URL or filename.
 * Returns a key compatible with MaterialTypeBadge FORMAT_CONFIG:
 * "pdf" | "word" | "powerpoint" | "excel" | "onenote" | "other"
 */

const EXT_TO_FORMAT: Record<string, string> = {
  pdf: "pdf",
  doc: "word",
  docx: "word",
  ppt: "powerpoint",
  pptx: "powerpoint",
  xls: "excel",
  xlsx: "excel",
  csv: "excel",
  one: "onenote",
  onetoc2: "onenote",
};

/**
 * Get normalized file format from a file URL or filename.
 * @example getFileFormat("materials/abc123/worksheet.pdf") → "pdf"
 * @example getFileFormat("doc.docx") → "word"
 */
export function getFileFormat(fileUrlOrName: string | null | undefined): string {
  if (!fileUrlOrName) return "other";
  const ext = fileUrlOrName.split(".").pop()?.toLowerCase();
  if (!ext) return "other";
  return EXT_TO_FORMAT[ext] || "other";
}

/**
 * Get a human-readable format label from a file URL or filename.
 * @example getFileFormatLabel("materials/abc123/worksheet.pdf") → "PDF"
 */
const FORMAT_LABELS: Record<string, string> = {
  pdf: "PDF",
  word: "Word",
  powerpoint: "PowerPoint",
  excel: "Excel",
  onenote: "OneNote",
  other: "Other",
};

export function getFileFormatLabel(fileUrlOrName: string | null | undefined): string {
  return FORMAT_LABELS[getFileFormat(fileUrlOrName)] || "Other";
}
