/**
 * File name validation and sanitization utilities.
 */

export interface FileNameValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized: string;
}

/** Characters that are dangerous in file names (path traversal, shell injection, etc.) */
const DANGEROUS_CHARS = /[<>:"/\\|?*\x00-\x1f]/g;

/** Maximum allowed file name length (including extension) */
const MAX_FILENAME_LENGTH = 100;

/**
 * Validate a file name for safety and length.
 * Returns validation result with any errors and a sanitized version.
 */
export function validateFileName(fileName: string): FileNameValidationResult {
  const errors: string[] = [];

  if (!fileName || fileName.trim().length === 0) {
    return { isValid: false, errors: ["fileNameEmpty"], sanitized: "" };
  }

  if (fileName.length > MAX_FILENAME_LENGTH) {
    errors.push("fileNameTooLong");
  }

  if (DANGEROUS_CHARS.test(fileName)) {
    errors.push("fileNameDangerousChars");
  }

  // Check for path traversal
  if (fileName.includes("..") || fileName.startsWith("/") || fileName.startsWith("\\")) {
    errors.push("fileNamePathTraversal");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: sanitizeFileName(fileName),
  };
}

/**
 * Sanitize a file name by removing dangerous characters and truncating.
 */
export function sanitizeFileName(fileName: string): string {
  // Extract extension
  const lastDot = fileName.lastIndexOf(".");
  const hasExtension = lastDot > 0;
  const name = hasExtension ? fileName.slice(0, lastDot) : fileName;
  const ext = hasExtension ? fileName.slice(lastDot) : "";

  // Remove dangerous characters and trim
  let sanitized = name
    .replace(DANGEROUS_CHARS, "_")
    .replace(/\.{2,}/g, ".")
    .trim();

  // Truncate name portion to fit within max length (including extension)
  const maxNameLength = MAX_FILENAME_LENGTH - ext.length;
  if (sanitized.length > maxNameLength) {
    sanitized = sanitized.slice(0, maxNameLength);
  }

  // Ensure we have a valid name
  if (!sanitized) {
    sanitized = "file";
  }

  return sanitized + ext;
}
