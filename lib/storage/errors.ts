/**
 * Storage error codes
 */
export type StorageErrorCode =
  | "UPLOAD_FAILED"
  | "DOWNLOAD_FAILED"
  | "FILE_NOT_FOUND"
  | "DELETE_FAILED"
  | "INVALID_CONFIG"
  | "PERMISSION_DENIED"
  | "BUCKET_NOT_FOUND"
  | "SIGNED_URL_FAILED";

/**
 * Custom error class for storage operations
 */
export class StorageError extends Error {
  public readonly code: StorageErrorCode;
  public readonly cause?: Error;

  constructor(code: StorageErrorCode, message: string, cause?: Error) {
    super(message);
    this.name = "StorageError";
    this.code = code;
    this.cause = cause;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }
}
