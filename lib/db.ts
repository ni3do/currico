import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
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
  website: true,
  school: true,
  teaching_experience: true,
  preferred_language: true,
  instagram: true,
  pinterest: true,
  role: true,
  stripe_charges_enabled: true, // Show if seller can receive payments
  created_at: true,
  is_private: true,
  // Teacher verification - public badge
  is_teacher_verified: true,
  // Verified seller - public badge
  is_verified_seller: true,
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
  // Teacher verification details (private)
  teacher_verified_at: true,
  teacher_verification_method: true,
  // Verified seller details (private)
  verified_seller_at: true,
  verified_seller_method: true,
  // Notification preferences
  notify_new_from_followed: true,
  notify_recommendations: true,
  notify_material_updates: true,
  notify_review_reminders: true,
  notify_wishlist_price_drops: true,
  notify_welcome_offers: true,
  notify_sales: true,
  notify_newsletter: true,
  notify_platform_updates: true,
} as const;

// Admin view - full access
export const adminUserSelect = {
  ...privateUserSelect,
  password_hash: false, // Never expose password hash
  is_protected: true,
  updated_at: true,
} as const;
