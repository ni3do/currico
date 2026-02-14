import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getStorage,
  resetStorage,
  generateStorageKey,
  isLegacyLocalPath,
  legacyPathToKey,
  getLegacyFilePath,
} from "@/lib/storage";
import { LocalStorageAdapter } from "@/lib/storage/adapters/local";
import { S3StorageAdapter } from "@/lib/storage/adapters/s3";

// Store original env
const originalEnv = { ...process.env };

describe("Storage Factory", () => {
  beforeEach(() => {
    // Reset storage singleton before each test
    resetStorage();
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getStorage", () => {
    it("returns LocalStorageAdapter when STORAGE_PROVIDER is local", () => {
      process.env.STORAGE_PROVIDER = "local";
      const storage = getStorage();
      expect(storage).toBeInstanceOf(LocalStorageAdapter);
      expect(storage.isLocal()).toBe(true);
    });

    it("returns LocalStorageAdapter when STORAGE_PROVIDER is not set", () => {
      delete process.env.STORAGE_PROVIDER;
      const storage = getStorage();
      expect(storage).toBeInstanceOf(LocalStorageAdapter);
    });

    it("returns S3StorageAdapter when STORAGE_PROVIDER is s3", () => {
      process.env.STORAGE_PROVIDER = "s3";
      process.env.S3_ENDPOINT = "https://s3.example.com";
      process.env.S3_REGION = "us-east-1";
      process.env.S3_ACCESS_KEY_ID = "test-key";
      process.env.S3_SECRET_ACCESS_KEY = "test-secret";
      process.env.S3_PUBLIC_BUCKET = "public-bucket";
      process.env.S3_PRIVATE_BUCKET = "private-bucket";
      process.env.S3_PUBLIC_BUCKET_URL = "https://public-bucket.s3.example.com";

      const storage = getStorage();
      expect(storage).toBeInstanceOf(S3StorageAdapter);
      expect(storage.isLocal()).toBe(false);
    });

    it("throws StorageError when S3 config is incomplete", () => {
      process.env.STORAGE_PROVIDER = "s3";
      process.env.S3_ENDPOINT = "https://s3.example.com";
      // Missing other required vars

      expect(() => getStorage()).toThrow(/Missing required S3 environment variables/);
    });

    it("returns singleton instance", () => {
      process.env.STORAGE_PROVIDER = "local";
      const storage1 = getStorage();
      const storage2 = getStorage();
      expect(storage1).toBe(storage2);
    });

    it("resets singleton when resetStorage is called", () => {
      process.env.STORAGE_PROVIDER = "local";
      const storage1 = getStorage();
      resetStorage();
      const storage2 = getStorage();
      expect(storage1).not.toBe(storage2);
    });
  });

  describe("generateStorageKey", () => {
    it("generates key with correct category prefix for resource", () => {
      const key = generateStorageKey("material", "user123", "document.pdf");
      expect(key).toMatch(/^materials\/user123\/[a-f0-9]+-\d+\.pdf$/);
    });

    it("generates key with correct category prefix for preview", () => {
      const key = generateStorageKey("preview", "user123", "image.png");
      expect(key).toMatch(/^previews\/user123\/[a-f0-9]+-\d+\.png$/);
    });

    it("generates key with correct category prefix for avatar", () => {
      const key = generateStorageKey("avatar", "user123", "photo.jpg");
      expect(key).toMatch(/^avatars\/user123\/[a-f0-9]+-\d+\.jpg$/);
    });

    it("preserves file extension", () => {
      const key = generateStorageKey("resource", "user123", "file.docx");
      expect(key).toMatch(/\.docx$/);
    });

    it("generates unique keys each time", () => {
      const key1 = generateStorageKey("resource", "user123", "file.pdf");
      const key2 = generateStorageKey("resource", "user123", "file.pdf");
      expect(key1).not.toBe(key2);
    });
  });

  describe("isLegacyLocalPath", () => {
    it("returns true for paths starting with /uploads/", () => {
      expect(isLegacyLocalPath("/uploads/resources/user123/file.pdf")).toBe(true);
      expect(isLegacyLocalPath("/uploads/previews/user123/image.png")).toBe(true);
    });

    it("returns false for storage keys", () => {
      expect(isLegacyLocalPath("resources/user123/file.pdf")).toBe(false);
    });

    it("returns false for full URLs", () => {
      expect(isLegacyLocalPath("https://cdn.example.com/file.pdf")).toBe(false);
    });
  });

  describe("legacyPathToKey", () => {
    it("removes /uploads/ prefix", () => {
      expect(legacyPathToKey("/uploads/resources/user123/file.pdf")).toBe(
        "resources/user123/file.pdf"
      );
    });

    it("handles paths without /uploads/ prefix", () => {
      expect(legacyPathToKey("resources/user123/file.pdf")).toBe("resources/user123/file.pdf");
    });
  });

  describe("getLegacyFilePath", () => {
    it("returns full filesystem path", () => {
      const result = getLegacyFilePath("/uploads/resources/user123/file.pdf");
      expect(result).toContain("public");
      // Normalize path separators for cross-platform compatibility
      const normalizedResult = result.replace(/\\/g, "/");
      expect(normalizedResult).toContain("/uploads/resources/user123/file.pdf");
      expect(normalizedResult).toMatch(/.*\/public\/uploads\/resources\/user123\/file\.pdf$/);
    });
  });
});
