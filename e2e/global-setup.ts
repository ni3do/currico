/**
 * Playwright Global Setup
 *
 * This script runs once before all tests to:
 * 1. Ensure test data is seeded in the database
 * 2. Authenticate all test users and save their session states
 *
 * The authenticated states are stored in .auth/ and reused across tests,
 * avoiding repeated login flows.
 */

import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import {
  STORAGE_STATE_PATHS,
  loginAndSaveState,
} from './fixtures/auth.fixture';
import {
  TEST_BUYER,
  TEST_SELLER,
  TEST_ADMIN,
  TEST_SCHOOL,
  TestUser,
} from './fixtures/test-users';

const AUTH_DIR = path.join(process.cwd(), '.auth');

/**
 * Creates the .auth directory if it doesn't exist.
 */
function ensureAuthDirectory(): void {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    console.log('Created .auth directory');
  }
}

/**
 * Checks if a storage state file exists and is recent (less than 24 hours old).
 */
function isStorageStateValid(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const stats = fs.statSync(filePath);
  const ageMs = Date.now() - stats.mtimeMs;
  const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours

  return ageMs < maxAgeMs;
}

/**
 * Authenticates a user and saves their session state.
 */
async function authenticateUser(
  baseURL: string,
  user: TestUser,
  storagePath: string
): Promise<void> {
  // Skip if storage state is still valid
  if (isStorageStateValid(storagePath)) {
    console.log(`  Skipping ${user.role} - storage state still valid`);
    return;
  }

  console.log(`  Authenticating ${user.role}...`);

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  try {
    await loginAndSaveState(page, user, storagePath);
    console.log(`  ✓ ${user.role} authenticated and state saved`);
  } catch (error) {
    console.error(`  ✗ Failed to authenticate ${user.role}:`, error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Global setup function that runs before all tests.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  console.log('\n========================================');
  console.log('Playwright Global Setup');
  console.log('========================================\n');

  // Get base URL from config
  const baseURL =
    config.projects[0]?.use?.baseURL || 'http://localhost:3000/de';

  console.log(`Base URL: ${baseURL}\n`);

  // Ensure .auth directory exists
  ensureAuthDirectory();

  // Add .auth to .gitignore if not already there
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    if (!gitignore.includes('.auth')) {
      fs.appendFileSync(gitignorePath, '\n# Playwright auth states\n.auth/\n');
      console.log('Added .auth/ to .gitignore\n');
    }
  }

  // Authenticate all test users
  console.log('Authenticating test users...');

  const usersToAuth: Array<{ user: TestUser; path: string }> = [
    { user: TEST_BUYER, path: STORAGE_STATE_PATHS.buyer },
    { user: TEST_SELLER, path: STORAGE_STATE_PATHS.seller },
    { user: TEST_ADMIN, path: STORAGE_STATE_PATHS.admin },
    { user: TEST_SCHOOL, path: STORAGE_STATE_PATHS.school },
  ];

  for (const { user, path } of usersToAuth) {
    await authenticateUser(baseURL, user, path);
  }

  console.log('\n========================================');
  console.log('Global Setup Complete');
  console.log('========================================\n');
}

export default globalSetup;
