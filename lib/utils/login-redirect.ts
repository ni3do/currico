/**
 * Build a login URL that preserves the return path.
 */
export function getLoginUrl(returnTo?: string): string {
  const base = "/anmelden";
  if (!returnTo || !isValidCallbackUrl(returnTo)) return base;
  return `${base}?callbackUrl=${encodeURIComponent(returnTo)}`;
}

/**
 * Validate that a callback URL is safe (relative path, no open redirect).
 */
export function isValidCallbackUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  // Must start with /
  if (!url.startsWith("/")) return false;
  // Must not be a protocol-relative URL
  if (url.startsWith("//")) return false;
  // Must not contain backslashes (redirect bypass)
  if (url.includes("\\")) return false;
  // Skip if already on auth pages
  if (url.startsWith("/anmelden") || url.startsWith("/registrieren")) return false;
  return true;
}
