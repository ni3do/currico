/**
 * Validate required environment variables at startup.
 * Call from instrumentation.ts to fail fast instead of crashing at runtime.
 */

const REQUIRED_VARS = ["AUTH_SECRET", "AUTH_URL", "DATABASE_URL"] as const;

const REQUIRED_FOR_PAYMENTS = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] as const;

const REQUIRED_FOR_EMAIL = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        `Check your .env file or deployment configuration.`
    );
  }

  // Warn about optional but recommended vars
  const warnings: string[] = [];

  for (const key of REQUIRED_FOR_PAYMENTS) {
    if (!process.env[key]) {
      warnings.push(`${key} (payments will not work)`);
    }
  }

  for (const key of REQUIRED_FOR_EMAIL) {
    if (!process.env[key]) {
      warnings.push(`${key} (email sending will not work)`);
    }
  }

  if (warnings.length > 0 && process.env.NODE_ENV === "production") {
    console.warn(`[env] Missing optional environment variables: ${warnings.join(", ")}`);
  }
}
