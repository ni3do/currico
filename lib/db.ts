import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Parse DATABASE_URL for adapter config
function parseDbUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1),
  };
}

function createPrismaClient() {
  const dbConfig = parseDbUrl(process.env.DATABASE_URL!);
  const adapter = new PrismaMariaDb({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectionLimit: 10,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ============================================================
// PRISMA SELECT OBJECTS - Access Control
// ============================================================

// Public profile - visible to everyone
export const publicUserSelect = {
  id: true,
  name: true,
  display_name: true,
  image: true,
  bio: true,
  subjects: true,
  cycles: true,
  cantons: true,
  role: true,
  stripe_charges_enabled: true, // Show if seller can receive payments
  created_at: true,
} as const;

// Private profile - visible only to the user themselves
export const privateUserSelect = {
  ...publicUserSelect,
  email: true,
  emailVerified: true,
  stripe_customer_id: true,
  stripe_account_id: true,
  stripe_onboarding_complete: true,
  stripe_payouts_enabled: true,
  seller_terms_accepted_at: true,
} as const;

// Admin view - full access
export const adminUserSelect = {
  ...privateUserSelect,
  password_hash: false, // Never expose password hash
  is_protected: true,
  updated_at: true,
} as const;
