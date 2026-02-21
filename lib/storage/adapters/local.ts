import { mkdir, writeFile, unlink, readFile, access } from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  StorageProvider,
  UploadOptions,
  UploadResult,
  SignedUrlOptions,
  FileCategory,
  getCategoryDir,
} from "../types";
import { StorageError } from "../errors";

/**
 * Local filesystem storage adapter
 * Used for development and as a fallback
 */
export class LocalStorageAdapter implements StorageProvider {
  private readonly uploadDir: string;
  private readonly publicUrl: string;

  constructor(uploadDir?: string, publicUrl?: string) {
    this.uploadDir = uploadDir || path.join(process.cwd(), "public", "uploads");
    // Use /api/uploads for standalone mode compatibility (runtime uploads aren't served from public/)
    this.publicUrl = publicUrl || "/api/uploads";
  }

  /**
   * Get the full filesystem path for a key
   */
  private getFilePath(key: string): string {
    return path.join(this.uploadDir, key);
  }

  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    const { category, userId, filename, contentType } = options;

    // Generate unique filename with hash
    const ext = path.extname(filename);
    const hash = crypto.randomBytes(16).toString("hex");
    const uniqueFilename = `${hash}${ext}`;

    // Build the storage key
    const categoryDir = getCategoryDir(category);
    const key = `${categoryDir}/${userId}/${uniqueFilename}`;

    // Create directory if it doesn't exist
    const dir = path.dirname(this.getFilePath(key));
    await mkdir(dir, { recursive: true });

    // Write the file
    const filePath = this.getFilePath(key);
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      throw new StorageError(
        "UPLOAD_FAILED",
        `Failed to write file to ${filePath}`,
        error instanceof Error ? error : undefined
      );
    }

    // For local storage, public URL is the same as the key path
    const publicUrl = `${this.publicUrl}/${key}`;

    return {
      key,
      publicUrl: category !== "material" ? publicUrl : undefined,
      size: buffer.length,
      contentType,
    };
  }

  async getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string> {
    // Local storage doesn't have signed URLs - just return the local path
    // In a real scenario, you might want to implement a token-based system
    const _expiresIn = options?.expiresIn;
    return `${this.publicUrl}/${key}`;
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  async delete(key: string, _category: FileCategory): Promise<void> {
    const filePath = this.getFilePath(key);
    try {
      await unlink(filePath);
    } catch (error) {
      // Don't throw if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw new StorageError(
          "DELETE_FAILED",
          `Failed to delete file at ${filePath}`,
          error instanceof Error ? error : undefined
        );
      }
    }
  }

  async exists(key: string, _category: FileCategory): Promise<boolean> {
    const filePath = this.getFilePath(key);
    try {
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFile(key: string, _category: FileCategory): Promise<Buffer> {
    const filePath = this.getFilePath(key);
    try {
      return await readFile(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new StorageError("FILE_NOT_FOUND", `File not found at ${filePath}`);
      }
      throw new StorageError(
        "DOWNLOAD_FAILED",
        `Failed to read file at ${filePath}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  isLocal(): boolean {
    return true;
  }
}
