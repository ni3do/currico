import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
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
  is_seller: true,
  seller_verified: true,
  created_at: true,
} as const;

// Private profile - visible only to the user themselves
export const privateUserSelect = {
  ...publicUserSelect,
  email: true,
  emailVerified: true,
  legal_first_name: true,
  legal_last_name: true,
  iban: true,
  address_street: true,
  address_city: true,
  address_postal: true,
  address_country: true,
  payout_enabled: true,
  role: true,
} as const;

// Admin view - full access
export const adminUserSelect = {
  ...privateUserSelect,
  password_hash: false, // Never expose password hash
  updated_at: true,
} as const;
