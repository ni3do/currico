import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ============================================================
// PRISMA SELECT OBJECTS - Access Control
// ============================================================

// Public profile - visible to everyone
export const publicUserSelect = {
  id: true,
  display_name: true,
  avatar_url: true,
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
  legal_first_name: true,
  legal_last_name: true,
  iban: true,
  address_street: true,
  address_city: true,
  address_postal: true,
  address_country: true,
  payout_enabled: true,
  email_verified: true,
  role: true,
} as const;

// Admin view - full access
export const adminUserSelect = {
  ...privateUserSelect,
  password_hash: false, // Never expose password hash
  updated_at: true,
} as const;
