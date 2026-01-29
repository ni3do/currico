/**
 * E2E Test Data Seed Script
 *
 * Creates test users and sample data for E2E testing.
 * Run this script before running E2E tests to ensure test data exists.
 *
 * Usage:
 *   npx tsx e2e/fixtures/seed-test-data.ts
 *
 * This script is idempotent - running it multiple times will not
 * create duplicate data.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  ALL_TEST_USERS,
  TEST_RESOURCE_IDS,
  TEST_COLLECTION_IDS,
  TEST_SELLER,
  TEST_BUYER,
} from './test-users';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;

/**
 * Seeds all test users with hashed passwords.
 */
async function seedTestUsers() {
  console.log('Seeding test users...');

  for (const testUser of ALL_TEST_USERS) {
    const passwordHash = await bcrypt.hash(testUser.password, BCRYPT_ROUNDS);

    await prisma.user.upsert({
      where: { id: testUser.id },
      update: {
        email: testUser.email,
        password_hash: passwordHash,
        display_name: testUser.displayName,
        name: testUser.displayName,
        role: testUser.role,
        emailVerified: new Date(),
      },
      create: {
        id: testUser.id,
        email: testUser.email,
        password_hash: passwordHash,
        display_name: testUser.displayName,
        name: testUser.displayName,
        role: testUser.role,
        emailVerified: new Date(),
        // Seller-specific fields for TEST_SELLER
        ...(testUser.role === 'SELLER' && {
          stripe_account_id: 'acct_test_seller_001',
          stripe_onboarding_complete: true,
          stripe_charges_enabled: true,
          stripe_payouts_enabled: true,
          seller_terms_accepted_at: new Date(),
          bio: 'Test seller account for E2E testing. Creates quality teaching materials.',
          subjects: JSON.stringify(['MA', 'DE']),
          cycles: JSON.stringify([1, 2]),
        }),
        // Admin-specific fields
        ...(testUser.role === 'ADMIN' && {
          is_protected: true,
        }),
      },
    });

    console.log(`  Created/updated user: ${testUser.email} (${testUser.role})`);
  }
}

/**
 * Seeds sample resources owned by the test seller.
 */
async function seedTestResources() {
  console.log('Seeding test resources...');

  // Free resource (price = 0)
  await prisma.resource.upsert({
    where: { id: TEST_RESOURCE_IDS.FREE_RESOURCE },
    update: {},
    create: {
      id: TEST_RESOURCE_IDS.FREE_RESOURCE,
      title: 'Gratis Mathematik Arbeitsblatt',
      description:
        'Ein kostenloses Arbeitsblatt zum Thema Addition und Subtraktion für Zyklus 1. Ideal zum Testen der Download-Funktionalität.',
      price: 0,
      file_url: 'https://storage.test/test-free-resource.pdf',
      preview_url: 'https://storage.test/test-free-resource-preview.jpg',
      subjects: JSON.stringify(['MA']),
      cycles: JSON.stringify([1]),
      is_published: true,
      is_approved: true,
      is_public: true,
      status: 'VERIFIED',
      swiss_verified: true,
      eszett_checked: true,
      language: 'de',
      seller_id: TEST_SELLER.id,
    },
  });
  console.log('  Created/updated free resource');

  // Paid resource
  await prisma.resource.upsert({
    where: { id: TEST_RESOURCE_IDS.PAID_RESOURCE },
    update: {},
    create: {
      id: TEST_RESOURCE_IDS.PAID_RESOURCE,
      title: 'Premium Deutsch Lernpaket',
      description:
        'Ein umfassendes Lernpaket für den Deutschunterricht in Zyklus 2. Enthält Arbeitsblätter, Übungen und Lösungen.',
      price: 990, // CHF 9.90 in Rappen
      file_url: 'https://storage.test/test-paid-resource.pdf',
      preview_url: 'https://storage.test/test-paid-resource-preview.jpg',
      subjects: JSON.stringify(['DE']),
      cycles: JSON.stringify([2]),
      is_published: true,
      is_approved: true,
      is_public: true,
      status: 'VERIFIED',
      swiss_verified: true,
      eszett_checked: true,
      language: 'de',
      seller_id: TEST_SELLER.id,
    },
  });
  console.log('  Created/updated paid resource');

  // Pending resource (not yet verified)
  await prisma.resource.upsert({
    where: { id: TEST_RESOURCE_IDS.PENDING_RESOURCE },
    update: {},
    create: {
      id: TEST_RESOURCE_IDS.PENDING_RESOURCE,
      title: 'Neues Material zur Prüfung',
      description:
        'Dieses Material wartet noch auf die Überprüfung durch das Admin-Team.',
      price: 490, // CHF 4.90 in Rappen
      file_url: 'https://storage.test/test-pending-resource.pdf',
      subjects: JSON.stringify(['NMG']),
      cycles: JSON.stringify([1, 2]),
      is_published: false,
      is_approved: false,
      is_public: false,
      status: 'PENDING',
      swiss_verified: false,
      eszett_checked: false,
      language: 'de',
      seller_id: TEST_SELLER.id,
    },
  });
  console.log('  Created/updated pending resource');
}

/**
 * Seeds a sample collection for the test buyer.
 */
async function seedTestCollections() {
  console.log('Seeding test collections...');

  await prisma.collection.upsert({
    where: { id: TEST_COLLECTION_IDS.BUYER_COLLECTION },
    update: {},
    create: {
      id: TEST_COLLECTION_IDS.BUYER_COLLECTION,
      name: 'Meine Favoriten',
      description: 'Eine Sammlung meiner Lieblingsmaterialien.',
      is_public: false,
      owner_id: TEST_BUYER.id,
    },
  });
  console.log('  Created/updated buyer collection');
}

/**
 * Seeds a wishlist entry for the test buyer.
 */
async function seedTestWishlists() {
  console.log('Seeding test wishlists...');

  // Add paid resource to buyer's wishlist
  await prisma.wishlist.upsert({
    where: {
      user_id_resource_id: {
        user_id: TEST_BUYER.id,
        resource_id: TEST_RESOURCE_IDS.PAID_RESOURCE,
      },
    },
    update: {},
    create: {
      user_id: TEST_BUYER.id,
      resource_id: TEST_RESOURCE_IDS.PAID_RESOURCE,
    },
  });
  console.log('  Created/updated wishlist entry');
}

/**
 * Main seed function.
 */
async function main() {
  console.log('========================================');
  console.log('E2E Test Data Seed');
  console.log('========================================\n');

  try {
    await seedTestUsers();
    await seedTestResources();
    await seedTestCollections();
    await seedTestWishlists();

    console.log('\n========================================');
    console.log('E2E test data seeded successfully!');
    console.log('========================================');
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
}

// Export for programmatic use
export { seedTestUsers, seedTestResources, seedTestCollections, seedTestWishlists };

// Run if executed directly
main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
