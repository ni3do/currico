import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveStorageUrl, getPreviewImageUrl, getAvatarUrl } from "@/lib/storage/client";

// Store original env
const originalEnv = { ...process.env };

describe("Storage Client Utilities", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("resolveStorageUrl", () => {
    describe("with null/undefined input", () => {
      it("returns null for null input", () => {
        expect(resolveStorageUrl(null)).toBeNull();
      });

      it("returns null for undefined input", () => {
        expect(resolveStorageUrl(undefined)).toBeNull();
      });
    });

    describe("with legacy local paths", () => {
      it("returns legacy path as-is", () => {
        const url = "/uploads/resources/user123/file.pdf";
        expect(resolveStorageUrl(url)).toBe(url);
      });

      it("handles preview legacy paths", () => {
        const url = "/uploads/previews/user123/image.png";
        expect(resolveStorageUrl(url)).toBe(url);
      });
    });

    describe("with full URLs", () => {
      it("returns https URLs as-is", () => {
        const url = "https://cdn.example.com/file.pdf";
        expect(resolveStorageUrl(url)).toBe(url);
      });

      it("returns http URLs as-is", () => {
        const url = "http://localhost:9000/bucket/file.pdf";
        expect(resolveStorageUrl(url)).toBe(url);
      });
    });

    describe("with storage keys", () => {
      it("falls back to local path when NEXT_PUBLIC_STORAGE_PUBLIC_URL is not set", () => {
        delete process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL;
        const key = "previews/user123/image.png";
        expect(resolveStorageUrl(key)).toBe("/uploads/previews/user123/image.png");
      });

      it("uses CDN URL when NEXT_PUBLIC_STORAGE_PUBLIC_URL is set", () => {
        process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL = "https://cdn.example.com";
        const key = "previews/user123/image.png";
        expect(resolveStorageUrl(key, "public")).toBe(
          "https://cdn.example.com/previews/user123/image.png"
        );
      });

      it("returns null for private bucket items (should use download API)", () => {
        process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL = "https://cdn.example.com";
        const key = "resources/user123/file.pdf";
        expect(resolveStorageUrl(key, "private")).toBeNull();
      });
    });
  });

  describe("getPreviewImageUrl", () => {
    it("resolves preview URL correctly", () => {
      const url = "/uploads/previews/user123/image.png";
      expect(getPreviewImageUrl(url)).toBe(url);
    });

    it("handles null input", () => {
      expect(getPreviewImageUrl(null)).toBeNull();
    });

    it("handles undefined input", () => {
      expect(getPreviewImageUrl(undefined)).toBeNull();
    });

    it("uses public bucket for storage keys", () => {
      process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL = "https://cdn.example.com";
      const key = "previews/user123/image.png";
      expect(getPreviewImageUrl(key)).toBe("https://cdn.example.com/previews/user123/image.png");
    });
  });

  describe("getAvatarUrl", () => {
    it("resolves avatar URL correctly", () => {
      const url = "/uploads/avatars/user123/photo.jpg";
      expect(getAvatarUrl(url)).toBe(url);
    });

    it("handles null input", () => {
      expect(getAvatarUrl(null)).toBeNull();
    });

    it("uses public bucket for storage keys", () => {
      process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL = "https://cdn.example.com";
      const key = "avatars/user123/photo.jpg";
      expect(getAvatarUrl(key)).toBe("https://cdn.example.com/avatars/user123/photo.jpg");
    });
  });
});
