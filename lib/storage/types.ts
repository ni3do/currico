/**
 * Storage abstraction types
 */

export type FileCategory = "material" | "preview" | "avatar";

export type StorageProviderType = "local" | "s3";

export interface StorageConfig {
  provider: StorageProviderType;
  // S3 configuration
  s3?: {
    endpoint: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    publicBucket: string;
    privateBucket: string;
    publicBucketUrl: string;
  };
  // Local configuration
  local?: {
    uploadDir: string;
    publicUrl: string;
  };
}

export interface UploadOptions {
  /** File category determines the bucket (public/private) */
  category: FileCategory;
  /** User ID for organizing files */
  userId: string;
  /** Original filename (used for extension) */
  filename: string;
  /** Content type of the file */
  contentType: string;
  /** Custom metadata to store with the file */
  metadata?: Record<string, string>;
}

export interface UploadResult {
  /** Storage key (path within the bucket) */
  key: string;
  /** Public URL if applicable (for public bucket items) */
  publicUrl?: string;
  /** Size of the uploaded file in bytes */
  size: number;
  /** Content type of the file */
  contentType: string;
}

export interface SignedUrlOptions {
  /** Expiration time in seconds (default: 3600 = 1 hour) */
  expiresIn?: number;
  /** Filename for Content-Disposition header */
  downloadFilename?: string;
}

export interface StorageProvider {
  /**
   * Upload a file to storage
   */
  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult>;

  /**
   * Generate a signed URL for temporary access to a private file
   */
  getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string>;

  /**
   * Get the public URL for a file in the public bucket
   */
  getPublicUrl(key: string): string;

  /**
   * Delete a file from storage
   */
  delete(key: string, category: FileCategory): Promise<void>;

  /**
   * Check if a file exists in storage
   */
  exists(key: string, category: FileCategory): Promise<boolean>;

  /**
   * Get a file's contents from storage
   */
  getFile(key: string, category: FileCategory): Promise<Buffer>;

  /**
   * Check if this is the local adapter
   */
  isLocal(): boolean;
}
