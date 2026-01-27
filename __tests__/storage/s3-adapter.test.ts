import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Create mock functions
const mockSend = vi.fn();
const mockGetSignedUrl = vi.fn();

// Mock AWS SDK before importing the adapter
vi.mock("@aws-sdk/client-s3", () => {
  // Create mock classes
  class MockS3Client {
    send = mockSend;
  }

  class MockPutObjectCommand {
    Bucket: string;
    Key: string;
    Body: Buffer;
    ContentType: string;
    Metadata?: Record<string, string>;
    ACL?: string;
    constructor(params: Record<string, unknown>) {
      Object.assign(this, params);
    }
  }

  class MockDeleteObjectCommand {
    Bucket: string;
    Key: string;
    constructor(params: Record<string, unknown>) {
      Object.assign(this, params);
    }
  }

  class MockGetObjectCommand {
    Bucket: string;
    Key: string;
    ResponseContentDisposition?: string;
    constructor(params: Record<string, unknown>) {
      Object.assign(this, params);
    }
  }

  class MockHeadObjectCommand {
    Bucket: string;
    Key: string;
    constructor(params: Record<string, unknown>) {
      Object.assign(this, params);
    }
  }

  return {
    S3Client: MockS3Client,
    PutObjectCommand: MockPutObjectCommand,
    DeleteObjectCommand: MockDeleteObjectCommand,
    GetObjectCommand: MockGetObjectCommand,
    HeadObjectCommand: MockHeadObjectCommand,
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
}));

// Import after mocking
import { S3StorageAdapter } from "@/lib/storage/adapters/s3";

describe("S3StorageAdapter", () => {
  const config = {
    endpoint: "https://s3.example.com",
    region: "us-east-1",
    accessKeyId: "test-access-key",
    secretAccessKey: "test-secret-key",
    publicBucket: "test-public",
    privateBucket: "test-private",
    publicBucketUrl: "https://test-public.s3.example.com",
  };

  let adapter: S3StorageAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({});
    mockGetSignedUrl.mockResolvedValue("https://signed-url.example.com/file");
    adapter = new S3StorageAdapter(config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("upload", () => {
    it("uploads resource to private bucket", async () => {
      const buffer = Buffer.from("test content");
      const result = await adapter.upload(buffer, {
        category: "resource",
        userId: "user123",
        filename: "document.pdf",
        contentType: "application/pdf",
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.Bucket).toBe("test-private");
      expect(command.Key).toMatch(/^resources\/user123\/[a-f0-9]+\.pdf$/);
      expect(command.Body).toBe(buffer);
      expect(command.ContentType).toBe("application/pdf");
      expect(command.ACL).toBeUndefined(); // No ACL for private

      expect(result.key).toMatch(/^resources\/user123\/[a-f0-9]+\.pdf$/);
      expect(result.publicUrl).toBeUndefined();
      expect(result.size).toBe(buffer.length);
    });

    it("uploads preview to public bucket with public-read ACL", async () => {
      const buffer = Buffer.from("image data");
      const result = await adapter.upload(buffer, {
        category: "preview",
        userId: "user123",
        filename: "preview.png",
        contentType: "image/png",
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.Bucket).toBe("test-public");
      expect(command.Key).toMatch(/^previews\/user123\/[a-f0-9]+\.png$/);
      expect(command.ACL).toBe("public-read");

      expect(result.publicUrl).toMatch(
        /^https:\/\/test-public\.s3\.example\.com\/previews\/user123\/[a-f0-9]+\.png$/
      );
    });

    it("uploads avatar to public bucket", async () => {
      const buffer = Buffer.from("avatar data");
      const result = await adapter.upload(buffer, {
        category: "avatar",
        userId: "user123",
        filename: "avatar.jpg",
        contentType: "image/jpeg",
      });

      const command = mockSend.mock.calls[0][0];
      expect(command.Bucket).toBe("test-public");
      expect(command.Key).toMatch(/^avatars\/user123\/[a-f0-9]+\.jpg$/);
      expect(result.publicUrl).toBeDefined();
    });

    it("includes metadata when provided", async () => {
      const buffer = Buffer.from("content");
      await adapter.upload(buffer, {
        category: "resource",
        userId: "user123",
        filename: "file.pdf",
        contentType: "application/pdf",
        metadata: { resourceId: "res123", originalName: "my-file.pdf" },
      });

      const command = mockSend.mock.calls[0][0];
      expect(command.Metadata).toEqual({
        resourceId: "res123",
        originalName: "my-file.pdf",
      });
    });

    it("throws StorageError on S3 failure", async () => {
      mockSend.mockRejectedValueOnce(new Error("S3 error"));

      await expect(
        adapter.upload(Buffer.from("content"), {
          category: "resource",
          userId: "user123",
          filename: "file.pdf",
          contentType: "application/pdf",
        })
      ).rejects.toMatchObject({ code: "UPLOAD_FAILED" });
    });
  });

  describe("getSignedUrl", () => {
    it("generates signed URL for private file", async () => {
      const url = await adapter.getSignedUrl("resources/user123/file.pdf");

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          Bucket: "test-private",
          Key: "resources/user123/file.pdf",
        }),
        { expiresIn: 3600 }
      );
      expect(url).toBe("https://signed-url.example.com/file");
    });

    it("uses custom expiration time", async () => {
      await adapter.getSignedUrl("resources/user123/file.pdf", { expiresIn: 7200 });

      expect(mockGetSignedUrl).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
        expiresIn: 7200,
      });
    });

    it("includes content-disposition for download filename", async () => {
      await adapter.getSignedUrl("resources/user123/file.pdf", {
        downloadFilename: "My Document.pdf",
      });

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ResponseContentDisposition: 'attachment; filename="My%20Document.pdf"',
        }),
        expect.anything()
      );
    });

    it("throws StorageError on failure", async () => {
      mockGetSignedUrl.mockRejectedValueOnce(new Error("Signing failed"));

      await expect(adapter.getSignedUrl("resources/user123/file.pdf")).rejects.toMatchObject({
        code: "SIGNED_URL_FAILED",
      });
    });
  });

  describe("getPublicUrl", () => {
    it("returns CDN URL for public bucket", () => {
      const url = adapter.getPublicUrl("previews/user123/image.png");
      expect(url).toBe("https://test-public.s3.example.com/previews/user123/image.png");
    });
  });

  describe("delete", () => {
    it("deletes from private bucket for resources", async () => {
      await adapter.delete("resources/user123/file.pdf", "resource");

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.Bucket).toBe("test-private");
      expect(command.Key).toBe("resources/user123/file.pdf");
    });

    it("deletes from public bucket for previews", async () => {
      await adapter.delete("previews/user123/image.png", "preview");

      const command = mockSend.mock.calls[0][0];
      expect(command.Bucket).toBe("test-public");
    });

    it("throws StorageError on failure", async () => {
      mockSend.mockRejectedValueOnce(new Error("Delete failed"));

      await expect(adapter.delete("resources/user123/file.pdf", "resource")).rejects.toMatchObject({
        code: "DELETE_FAILED",
      });
    });
  });

  describe("exists", () => {
    it("returns true when file exists", async () => {
      mockSend.mockResolvedValueOnce({});
      const exists = await adapter.exists("resources/user123/file.pdf", "resource");
      expect(exists).toBe(true);
    });

    it("returns false when file does not exist", async () => {
      const notFoundError = new Error("Not found");
      (notFoundError as Error & { name: string }).name = "NotFound";
      mockSend.mockRejectedValueOnce(notFoundError);

      const exists = await adapter.exists("resources/nonexistent/file.pdf", "resource");
      expect(exists).toBe(false);
    });

    it("throws on other errors", async () => {
      mockSend.mockRejectedValueOnce(new Error("Network error"));

      await expect(adapter.exists("resources/user123/file.pdf", "resource")).rejects.toThrow();
    });
  });

  describe("getFile", () => {
    it("retrieves file contents from S3", async () => {
      const chunks = [new Uint8Array([116, 101, 115, 116])]; // "test"
      mockSend.mockResolvedValueOnce({
        Body: {
          [Symbol.asyncIterator]: async function* () {
            for (const chunk of chunks) {
              yield chunk;
            }
          },
        },
      });

      const result = await adapter.getFile("resources/user123/file.pdf", "resource");
      expect(result.toString()).toBe("test");
    });

    it("throws StorageError when file not found", async () => {
      const notFoundError = new Error("No such key");
      (notFoundError as Error & { name: string }).name = "NoSuchKey";
      mockSend.mockRejectedValueOnce(notFoundError);

      await expect(
        adapter.getFile("resources/nonexistent/file.pdf", "resource")
      ).rejects.toMatchObject({ code: "FILE_NOT_FOUND" });
    });

    it("throws StorageError when Body is empty", async () => {
      mockSend.mockResolvedValueOnce({ Body: null });

      await expect(adapter.getFile("resources/user123/file.pdf", "resource")).rejects.toMatchObject(
        { code: "FILE_NOT_FOUND" }
      );
    });
  });

  describe("isLocal", () => {
    it("returns false", () => {
      expect(adapter.isLocal()).toBe(false);
    });
  });
});
