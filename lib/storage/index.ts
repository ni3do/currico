import path from "path";
import crypto from "crypto";
import { StorageProvider, StorageProviderType, FileCategory } from "./types";
import { StorageError } from "./errors";
import { LocalStorageAdapter } from "./adapters/local";
import { S3StorageAdapter, S3Config } from "./adapters/s3";

// Re-export types
export * from "./types";
export * from "./errors";

// Singleton instance
let storageInstance: StorageProvider | null = null;

/**
 * Get the storage provider based on environment configuration
 */
export function getStorage(): StorageProvider {
  if (storageInstance) {
    return storageInstance;
  }

  const provider = (process.env.STORAGE_PROVIDER || "local") as StorageProviderType;

  if (provider === "s3") {
    // Validate required S3 environment variables
    const requiredVars = [
      "S3_ENDPOINT",
      "S3_REGION",
      "S3_ACCESS_KEY_ID",
      "S3_SECRET_ACCESS_KEY",
      "S3_PUBLIC_BUCKET",
      "S3_PRIVATE_BUCKET",
      "S3_PUBLIC_BUCKET_URL",
    ];

    const missingVars = requiredVars.filter((v) => !process.env[v]);
    if (missingVars.length > 0) {
      throw new StorageError(
        "INVALID_CONFIG",
        `Missing required S3 environment variables: ${missingVars.join(", ")}`
      );
    }

    const s3Config: S3Config = {
      endpoint: process.env.S3_ENDPOINT!,
      region: process.env.S3_REGION!,
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      publicBucket: process.env.S3_PUBLIC_BUCKET!,
      privateBucket: process.env.S3_PRIVATE_BUCKET!,
      publicBucketUrl: process.env.S3_PUBLIC_BUCKET_URL!,
    };

    storageInstance = new S3StorageAdapter(s3Config);
  } else {
    // Default to local storage
    storageInstance = new LocalStorageAdapter();
  }

  return storageInstance;
}

/**
 * Generate a storage key for a file
 * @param category File category (material, preview, avatar)
 * @param userId User ID
 * @param originalFilename Original filename (for extension)
 * @returns Generated storage key
 */
export function generateStorageKey(
  category: FileCategory,
  userId: string,
  originalFilename: string
): string {
  const ext = path.extname(originalFilename);
  const hash = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();

  const categoryDir = getCategoryDir(category);
  return `${categoryDir}/${userId}/${hash}-${timestamp}${ext}`;
}

/**
 * Get the directory name for a file category
 */
function getCategoryDir(category: FileCategory): string {
  switch (category) {
    case "material":
      return "materials";
    case "preview":
      return "previews";
    case "avatar":
      return "avatars";
    default:
      return "misc";
  }
}

/**
 * Check if a URL is a legacy local upload path
 * @param url URL to check
 * @returns True if the URL is a legacy /uploads/... path
 */
export function isLegacyLocalPath(url: string): boolean {
  return url.startsWith("/uploads/");
}

/**
 * Convert a legacy local path to a storage key
 * @param localPath Legacy local path (e.g., /uploads/materials/user123/file.pdf)
 * @returns Storage key without the /uploads/ prefix
 */
export function legacyPathToKey(localPath: string): string {
  return localPath.replace(/^\/uploads\//, "");
}

/**
 * Get the local file path for a legacy URL
 * This is used for backward compatibility with existing files
 * @param url Legacy URL (e.g., /uploads/materials/user123/file.pdf)
 * @returns Full filesystem path
 */
export function getLegacyFilePath(url: string): string {
  return path.join(process.cwd(), "public", url);
}

/**
 * Reset the storage singleton (mainly for testing)
 */
export function resetStorage(): void {
  storageInstance = null;
}
