/**
 * Client-side storage URL utilities
 * These functions run in the browser and help resolve storage URLs
 */

/**
 * Check if a URL is a legacy local upload path
 */
function isLegacyLocalPath(url: string): boolean {
  return url.startsWith("/uploads/");
}

/**
 * Check if a URL is a storage key (not a full URL or legacy path)
 */
function isStorageKey(url: string): boolean {
  // Storage keys don't start with / or http
  return !url.startsWith("/") && !url.startsWith("http");
}

/**
 * Resolve a storage URL for client-side display
 *
 * This function handles three types of URLs:
 * 1. Legacy local paths (/uploads/...) - returned as-is for backward compatibility
 * 2. Full URLs (https://...) - returned as-is (e.g., S3 public URLs)
 * 3. Storage keys (previews/user123/file.jpg) - resolved using the public bucket URL
 *
 * @param url The URL or storage key from the database
 * @param bucket Which bucket the file is in ('public' or 'private')
 * @returns The resolved URL that can be used in <img> tags etc.
 */
export function resolveStorageUrl(
  url: string | null | undefined,
  bucket: "public" | "private" = "public"
): string | null {
  if (!url) {
    return null;
  }

  // Legacy local paths - return as-is
  if (isLegacyLocalPath(url)) {
    return url;
  }

  // Full URLs - return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Storage keys - resolve using public bucket URL
  if (isStorageKey(url)) {
    const publicBucketUrl = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL;

    // If no public bucket URL is configured, fall back to local path format
    if (!publicBucketUrl) {
      // For local development, storage keys are stored in /public/uploads
      return `/uploads/${url}`;
    }

    // For public bucket items, use the CDN URL
    if (bucket === "public") {
      return `${publicBucketUrl}/${url}`;
    }

    // Private bucket items shouldn't be resolved client-side
    // They need to go through the download API
    return null;
  }

  // Unknown format - return as-is
  return url;
}

/**
 * Get a preview image URL, handling all storage types
 *
 * @param previewUrl The preview URL from the database
 * @returns The resolved URL for display
 */
export function getPreviewImageUrl(previewUrl: string | null | undefined): string | null {
  return resolveStorageUrl(previewUrl, "public");
}

/**
 * Get an avatar image URL, handling all storage types
 *
 * @param avatarUrl The avatar URL from the database
 * @returns The resolved URL for display
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string | null {
  return resolveStorageUrl(avatarUrl, "public");
}
