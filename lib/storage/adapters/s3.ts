import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import {
  StorageProvider,
  UploadOptions,
  UploadResult,
  SignedUrlOptions,
  FileCategory,
} from "../types";
import { StorageError } from "../errors";

export interface S3Config {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBucket: string;
  privateBucket: string;
  publicBucketUrl: string;
}

/**
 * S3-compatible storage adapter (works with AWS S3, Infomaniak, etc.)
 */
export class S3StorageAdapter implements StorageProvider {
  private readonly client: S3Client;
  private readonly config: S3Config;

  constructor(config: S3Config) {
    this.config = config;
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true, // Required for some S3-compatible services
    });
  }

  /**
   * Determine which bucket to use based on file category
   */
  private getBucket(category: FileCategory): string {
    // Resources go to private bucket, everything else to public
    return category === "resource" ? this.config.privateBucket : this.config.publicBucket;
  }

  /**
   * Get the prefix/folder for a file category
   */
  private getCategoryPrefix(category: FileCategory): string {
    switch (category) {
      case "resource":
        return "resources";
      case "preview":
        return "previews";
      case "avatar":
        return "avatars";
      default:
        return "misc";
    }
  }

  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    const { category, userId, filename, contentType, metadata } = options;

    // Generate unique filename
    const ext = path.extname(filename);
    const hash = crypto.randomBytes(16).toString("hex");
    const uniqueFilename = `${hash}${ext}`;

    // Build the storage key
    const prefix = this.getCategoryPrefix(category);
    const key = `${prefix}/${userId}/${uniqueFilename}`;
    const bucket = this.getBucket(category);

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
        // Set public-read ACL for public bucket items
        ...(category !== "resource" && { ACL: "public-read" }),
      });

      await this.client.send(command);

      // Build public URL for public bucket items
      let publicUrl: string | undefined;
      if (category !== "resource") {
        // Remove trailing slash from base URL to avoid double slashes
        const baseUrl = this.config.publicBucketUrl.replace(/\/+$/, "");
        publicUrl = `${baseUrl}/${key}`;
      }

      return {
        key,
        publicUrl,
        size: buffer.length,
        contentType,
      };
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new StorageError(
        "UPLOAD_FAILED",
        `Failed to upload file to S3: ${key}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string> {
    const expiresIn = options?.expiresIn || 3600; // Default 1 hour

    try {
      const command = new GetObjectCommand({
        Bucket: this.config.privateBucket,
        Key: key,
        ...(options?.downloadFilename && {
          ResponseContentDisposition: `attachment; filename="${encodeURIComponent(options.downloadFilename)}"`,
        }),
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error("S3 signed URL error:", error);
      throw new StorageError(
        "SIGNED_URL_FAILED",
        `Failed to generate signed URL for: ${key}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  getPublicUrl(key: string): string {
    // Remove trailing slash from base URL to avoid double slashes
    const baseUrl = this.config.publicBucketUrl.replace(/\/+$/, "");
    return `${baseUrl}/${key}`;
  }

  async delete(key: string, category: FileCategory): Promise<void> {
    const bucket = this.getBucket(category);

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      console.error("S3 delete error:", error);
      throw new StorageError(
        "DELETE_FAILED",
        `Failed to delete file from S3: ${key}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async exists(key: string, category: FileCategory): Promise<boolean> {
    const bucket = this.getBucket(category);

    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      // Check if it's a not found error
      if ((error as { name?: string }).name === "NotFound") {
        return false;
      }
      // Re-throw other errors
      throw error;
    }
  }

  async getFile(key: string, category: FileCategory): Promise<Buffer> {
    const bucket = this.getBucket(category);

    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        throw new StorageError("FILE_NOT_FOUND", `File not found: ${key}`);
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      if ((error as { name?: string }).name === "NoSuchKey") {
        throw new StorageError("FILE_NOT_FOUND", `File not found: ${key}`);
      }
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        "DOWNLOAD_FAILED",
        `Failed to download file from S3: ${key}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  isLocal(): boolean {
    return false;
  }
}
