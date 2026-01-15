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
  "resources:list": { limit: 60, windowMs: 60 * 1000 }, // 60 per minute
  "resources:create": { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  "user:profile": { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
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
export function checkRateLimit(
  identifier: string,
  routeKey: string
): RateLimitResult {
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
