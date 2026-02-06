/**
 * Test user credentials and data for E2E tests.
 *
 * These users are created by the seed-test-data.ts script
 * and used throughout the E2E test suite.
 *
 * IMPORTANT: These credentials are for testing only and should
 * never be used in production environments.
 */

import type { UserRole } from "@prisma/client";

export interface TestUser {
  id: string;
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

/**
 * Test buyer user - basic authenticated user who can browse and purchase.
 */
export const TEST_BUYER: TestUser = {
  id: "test-buyer-001",
  email: "test-buyer@currico.test",
  password: "TestBuyer123!",
  displayName: "Test Buyer",
  role: "BUYER",
};

/**
 * Test seller user - can upload and sell teaching materials.
 * Has completed Stripe Connect onboarding (mocked).
 */
export const TEST_SELLER: TestUser = {
  id: "test-seller-001",
  email: "test-seller@currico.test",
  password: "TestSeller123!",
  displayName: "Test Seller",
  role: "SELLER",
};

/**
 * Test admin user - has full platform administration access.
 */
export const TEST_ADMIN: TestUser = {
  id: "test-admin-001",
  email: "test-admin@currico.test",
  password: "TestAdmin123!",
  displayName: "Test Admin",
  role: "ADMIN",
};

/**
 * Test school user - institutional account for schools.
 */
export const TEST_SCHOOL: TestUser = {
  id: "test-school-001",
  email: "test-school@currico.test",
  password: "TestSchool123!",
  displayName: "Test School",
  role: "SCHOOL",
};

/**
 * All test users for iteration.
 */
export const ALL_TEST_USERS: TestUser[] = [TEST_BUYER, TEST_SELLER, TEST_ADMIN, TEST_SCHOOL];

/**
 * Get test user by role.
 */
export function getTestUserByRole(role: UserRole): TestUser {
  const user = ALL_TEST_USERS.find((u) => u.role === role);
  if (!user) {
    throw new Error(`No test user found for role: ${role}`);
  }
  return user;
}

/**
 * Test material IDs for consistent test data references.
 */
export const TEST_MATERIAL_IDS = {
  FREE_MATERIAL: "test-material-free-001",
  PAID_MATERIAL: "test-material-paid-001",
  PENDING_MATERIAL: "test-material-pending-001",
} as const;

/**
 * Test collection IDs for consistent test data references.
 */
export const TEST_COLLECTION_IDS = {
  BUYER_COLLECTION: "test-collection-buyer-001",
} as const;

/**
 * Test comment IDs for consistent test data references.
 */
export const TEST_COMMENT_IDS = {
  BUYER_COMMENT: "test-comment-001",
  SECOND_COMMENT: "test-comment-002",
} as const;

/**
 * Test comment reply IDs for consistent test data references.
 */
export const TEST_COMMENT_REPLY_IDS = {
  SELLER_REPLY: "test-comment-reply-001",
} as const;

/**
 * Test review IDs for consistent test data references.
 */
export const TEST_REVIEW_IDS = {
  BUYER_REVIEW: "test-review-001",
} as const;
