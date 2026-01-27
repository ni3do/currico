import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LocalStorageAdapter } from "@/lib/storage/adapters/local";
import { mkdir, rm, readFile, writeFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

describe("LocalStorageAdapter", () => {
  const testDir = path.join(process.cwd(), "tmp", "test-uploads");
  let adapter: LocalStorageAdapter;

  beforeEach(async () => {
    // Create test directory
    await mkdir(testDir, { recursive: true });
    adapter = new LocalStorageAdapter(testDir, "/uploads");
  });

  afterEach(async () => {
    // Clean up test directory
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe("upload", () => {
    it("uploads a file to the correct category directory", async () => {
      const buffer = Buffer.from("test content");
      const result = await adapter.upload(buffer, {
        category: "resource",
        userId: "user123",
        filename: "test.pdf",
        contentType: "application/pdf",
      });

      expect(result.key).toMatch(/^resources\/user123\/[a-f0-9]+\.pdf$/);
      expect(result.size).toBe(buffer.length);
      expect(result.contentType).toBe("application/pdf");

      // Verify file was actually written
      const filePath = path.join(testDir, result.key);
      const content = await readFile(filePath);
      expect(content.toString()).toBe("test content");
    });

    it("uploads preview to previews directory", async () => {
      const buffer = Buffer.from("image data");
      const result = await adapter.upload(buffer, {
        category: "preview",
        userId: "user123",
        filename: "preview.png",
        contentType: "image/png",
      });

      expect(result.key).toMatch(/^previews\/user123\/[a-f0-9]+\.png$/);
      expect(result.publicUrl).toMatch(/^\/uploads\/previews\/user123\/[a-f0-9]+\.png$/);
    });

    it("uploads avatar to avatars directory", async () => {
      const buffer = Buffer.from("avatar data");
      const result = await adapter.upload(buffer, {
        category: "avatar",
        userId: "user123",
        filename: "avatar.jpg",
        contentType: "image/jpeg",
      });

      expect(result.key).toMatch(/^avatars\/user123\/[a-f0-9]+\.jpg$/);
      expect(result.publicUrl).toBeDefined();
    });

    it("does not return publicUrl for resources (private)", async () => {
      const buffer = Buffer.from("private content");
      const result = await adapter.upload(buffer, {
        category: "resource",
        userId: "user123",
        filename: "document.pdf",
        contentType: "application/pdf",
      });

      expect(result.publicUrl).toBeUndefined();
    });

    it("generates unique filenames for same input", async () => {
      const buffer = Buffer.from("content");
      const options = {
        category: "resource" as const,
        userId: "user123",
        filename: "test.pdf",
        contentType: "application/pdf",
      };

      const result1 = await adapter.upload(buffer, options);
      const result2 = await adapter.upload(buffer, options);

      expect(result1.key).not.toBe(result2.key);
    });

    it("creates nested directories if they do not exist", async () => {
      const buffer = Buffer.from("content");
      const result = await adapter.upload(buffer, {
        category: "resource",
        userId: "new-user-456",
        filename: "file.pdf",
        contentType: "application/pdf",
      });

      const filePath = path.join(testDir, result.key);
      expect(existsSync(filePath)).toBe(true);
    });
  });

  describe("getSignedUrl", () => {
    it("returns a local path (no real signing for local)", async () => {
      const url = await adapter.getSignedUrl("resources/user123/file.pdf");
      expect(url).toBe("/uploads/resources/user123/file.pdf");
    });
  });

  describe("getPublicUrl", () => {
    it("returns the public URL path", () => {
      const url = adapter.getPublicUrl("previews/user123/image.png");
      expect(url).toBe("/uploads/previews/user123/image.png");
    });
  });

  describe("delete", () => {
    it("deletes an existing file", async () => {
      // First upload a file
      const buffer = Buffer.from("to be deleted");
      const result = await adapter.upload(buffer, {
        category: "resource",
        userId: "user123",
        filename: "delete-me.pdf",
        contentType: "application/pdf",
      });

      const filePath = path.join(testDir, result.key);
      expect(existsSync(filePath)).toBe(true);

      // Delete it
      await adapter.delete(result.key, "resource");
      expect(existsSync(filePath)).toBe(false);
    });

    it("does not throw when deleting non-existent file", async () => {
      await expect(
        adapter.delete("resources/nonexistent/file.pdf", "resource")
      ).resolves.not.toThrow();
    });
  });

  describe("exists", () => {
    it("returns true for existing file", async () => {
      const buffer = Buffer.from("exists");
      const result = await adapter.upload(buffer, {
        category: "resource",
        userId: "user123",
        filename: "exists.pdf",
        contentType: "application/pdf",
      });

      const exists = await adapter.exists(result.key, "resource");
      expect(exists).toBe(true);
    });

    it("returns false for non-existent file", async () => {
      const exists = await adapter.exists("resources/nonexistent/file.pdf", "resource");
      expect(exists).toBe(false);
    });
  });

  describe("getFile", () => {
    it("retrieves file contents", async () => {
      const originalContent = "file contents here";
      const buffer = Buffer.from(originalContent);
      const result = await adapter.upload(buffer, {
        category: "resource",
        userId: "user123",
        filename: "readable.pdf",
        contentType: "application/pdf",
      });

      const retrieved = await adapter.getFile(result.key, "resource");
      expect(retrieved.toString()).toBe(originalContent);
    });

    it("throws StorageError for non-existent file", async () => {
      await expect(
        adapter.getFile("resources/nonexistent/file.pdf", "resource")
      ).rejects.toMatchObject({ code: "FILE_NOT_FOUND" });
    });
  });

  describe("isLocal", () => {
    it("returns true", () => {
      expect(adapter.isLocal()).toBe(true);
    });
  });
});
