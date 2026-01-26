import { describe, it, expect } from "vitest";
import { StorageError } from "@/lib/storage/errors";

describe("StorageError", () => {
  it("creates error with code and message", () => {
    const error = new StorageError("UPLOAD_FAILED", "Upload failed");
    expect(error.code).toBe("UPLOAD_FAILED");
    expect(error.message).toBe("Upload failed");
    expect(error.name).toBe("StorageError");
  });

  it("includes cause when provided", () => {
    const cause = new Error("Network error");
    const error = new StorageError("UPLOAD_FAILED", "Upload failed", cause);
    expect(error.cause).toBe(cause);
  });

  it("is instanceof Error", () => {
    const error = new StorageError("FILE_NOT_FOUND", "Not found");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(StorageError);
  });

  it("has stack trace", () => {
    const error = new StorageError("DELETE_FAILED", "Delete failed");
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("StorageError");
  });

  describe("error codes", () => {
    it("accepts all valid error codes", () => {
      const codes = [
        "UPLOAD_FAILED",
        "DOWNLOAD_FAILED",
        "FILE_NOT_FOUND",
        "DELETE_FAILED",
        "INVALID_CONFIG",
        "PERMISSION_DENIED",
        "BUCKET_NOT_FOUND",
        "SIGNED_URL_FAILED",
      ] as const;

      codes.forEach((code) => {
        const error = new StorageError(code, `Error: ${code}`);
        expect(error.code).toBe(code);
      });
    });
  });
});
