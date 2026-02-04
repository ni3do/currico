/**
 * In-memory sliding window rate limiter
 *
 * Tracks requests by identifier (IP or user ID) with configurable
 * limits per route. Includes automatic cleanup of expired entries.
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitConfig {
  limit: number; // Max requests allowed
  windowMs: number; // Time window in milliseconds
}

// In-memory store for rate limit tracking
const store = new Map<string, RateLimitEntry>();

// Cleanup interval (runs every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// Rate limit configurations per route
export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  "auth:register": { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min
  "auth:login": { limit: 10, windowMs: 15 * 60 * 1000 }, // 10 per 15 min
  "auth:send-verification": { limit: 3, windowMs: 15 * 60 * 1000 }, // 3 per 15 min
  "resources:list": { limit: 60, windowMs: 60 * 1000 }, // 60 per minute
  "resources:create": { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  "user:profile": { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  // Social interaction rate limits (prevent spam)
  "resources:like": { limit: 30, windowMs: 60 * 1000 }, // 30 per minute
  "resources:review": { limit: 5, windowMs: 60 * 1000 }, // 5 per minute
  "resources:comment": { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  "users:follow": { limit: 20, windowMs: 60 * 1000 }, // 20 per minute
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfter?: number; // Seconds until retry allowed
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (IP address or user ID)
 * @param routeKey - Key for the rate limit config (e.g., "auth:register")
 * @returns RateLimitResult with success status and metadata
 */
export function checkRateLimit(identifier: string, routeKey: string): RateLimitResult {
  const config = rateLimitConfigs[routeKey];
  if (!config) {
    // No rate limit configured for this route
    return { success: true, limit: 0, remaining: 0 };
  }

  const now = Date.now();
  const key = `${routeKey}:${identifier}`;
  const windowStart = now - config.windowMs;

  // Get or create entry
  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Filter timestamps within the current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  const remaining = Math.max(0, config.limit - entry.timestamps.length);

  if (entry.timestamps.length >= config.limit) {
    // Rate limit exceeded
    const oldestTimestamp = entry.timestamps[0];
    const retryAfter = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000);

    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      retryAfter,
    };
  }

  // Add current request timestamp
  entry.timestamps.push(now);

  return {
    success: true,
    limit: config.limit,
    remaining: remaining - 1,
  };
}

/**
 * Get client IP address from request headers
 * Handles various proxy configurations (X-Forwarded-For, etc.)
 */
export function getClientIP(request: Request): string {
  // Check common headers for proxied requests
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP if multiple are present
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback for development/direct connections
  return "127.0.0.1";
}

/**
 * Create rate limit response headers
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
  };

  if (result.retryAfter) {
    headers["Retry-After"] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Cleanup expired entries from the store
 * Should be called periodically to prevent memory bloat
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const maxWindow = Math.max(...Object.values(rateLimitConfigs).map((c) => c.windowMs));

  for (const [key, entry] of store.entries()) {
    // Remove entries with no recent timestamps
    entry.timestamps = entry.timestamps.filter((ts) => ts > now - maxWindow);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

// Start cleanup interval (only in non-test environments)
if (typeof setInterval !== "undefined" && process.env.NODE_ENV !== "test") {
  setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS);
}

/**
 * Reset rate limit for a specific identifier (useful for testing)
 */
export function resetRateLimit(identifier: string, routeKey: string): void {
  const key = `${routeKey}:${identifier}`;
  store.delete(key);
}

/**
 * Clear all rate limit data (useful for testing)
 */
export function clearAllRateLimits(): void {
  store.clear();
}

/**
 * Validate ID format (for resource/user IDs)
 * Accepts:
 * - UUID format: 8-4-4-4-12 hex characters
 * - CUID format used by Prisma: starts with 'c' and is 25 chars
 * - CUID2 format (newer Prisma): 24-32 lowercase alphanumeric
 * - Custom string IDs: alphanumeric with hyphens/underscores (1-50 chars)
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  if (id.length > 50) return false;

  // UUID v4 format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // CUID format (Prisma default)
  const cuidRegex = /^c[a-z0-9]{24}$/;

  // CUID2 format (newer Prisma)
  const cuid2Regex = /^[a-z0-9]{24,32}$/;

  // Custom string IDs (alphanumeric with hyphens/underscores, 1-50 chars)
  const customIdRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,49}$/;

  return uuidRegex.test(id) || cuidRegex.test(id) || cuid2Regex.test(id) || customIdRegex.test(id);
}

/**
 * Safely parse integer with NaN handling
 * Returns defaultValue if parsing fails or results in NaN
 */
export function safeParseInt(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
