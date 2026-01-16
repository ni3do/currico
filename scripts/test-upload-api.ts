/**
 * Integration test for the upload API endpoint
 * Tests the actual form submission flow with authentication
 *
 * Run with: npx tsx scripts/test-upload-api.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync, rmSync } from "fs";
import path from "path";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/easy_lehrer",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BASE_URL = "http://localhost:3000";
const TEST_USER_EMAIL = "upload-test@test.local";
const TEST_USER_PASSWORD = "TestPassword123!";

async function setupTestSeller() {
  console.log("👤 Setting up test seller...");

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email: TEST_USER_EMAIL },
  });

  if (user) {
    console.log("   User already exists, updating...");
    user = await prisma.user.update({
      where: { email: TEST_USER_EMAIL },
      data: {
        password_hash: await bcrypt.hash(TEST_USER_PASSWORD, 10),
        role: "SELLER",
        is_seller: true,
        seller_verified: true,
        display_name: "Upload Test Seller",
        subjects: ["Mathematik"],
        cycles: ["Zyklus 1"],
        legal_first_name: "Test",
        legal_last_name: "Upload",
        iban: "CH93 0076 2011 6238 5295 7",
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        email: TEST_USER_EMAIL,
        password_hash: await bcrypt.hash(TEST_USER_PASSWORD, 10),
        name: "Upload Test",
        display_name: "Upload Test Seller",
        role: "SELLER",
        is_seller: true,
        seller_verified: true,
        subjects: ["Mathematik"],
        cycles: ["Zyklus 1"],
        legal_first_name: "Test",
        legal_last_name: "Upload",
        iban: "CH93 0076 2011 6238 5295 7",
      },
    });
  }

  console.log(`✅ Test seller ready: ${user.email} (${user.id})`);
  return user;
}

async function login(): Promise<string | null> {
  console.log("\n🔐 Logging in...");

  try {
    // Get CSRF token first
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;

    // Get cookies from csrf response
    const cookies = csrfRes.headers.get("set-cookie") || "";

    console.log(`   CSRF token obtained`);

    // Login with credentials
    const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookies,
      },
      body: new URLSearchParams({
        csrfToken,
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      }),
      redirect: "manual",
    });

    // Get session cookie from response
    const sessionCookies = loginRes.headers.get("set-cookie");

    if (loginRes.status === 302 || loginRes.status === 200) {
      console.log(`✅ Login successful`);

      // Combine cookies
      const allCookies = [cookies, sessionCookies].filter(Boolean).join("; ");
      return allCookies;
    } else {
      console.log(`❌ Login failed: ${loginRes.status}`);
      const text = await loginRes.text();
      console.log(`   Response: ${text.substring(0, 200)}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Login error:`, error);
    return null;
  }
}

async function testUpload(cookies: string) {
  console.log("\n📤 Testing upload API...");

  // Create a minimal valid PDF
  const pdfContent = Buffer.from(
    "%PDF-1.4\n" +
      "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
      "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
      "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n" +
      "xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \n" +
      "trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
  );

  // Create FormData
  const formData = new FormData();
  formData.append("title", "Test 1");
  formData.append(
    "description",
    "Test upload through API - testing the upload fix for subject validation"
  );
  formData.append("language", "de");
  formData.append("resourceType", "pdf");
  formData.append("subjects", JSON.stringify(["Mathematik"]));
  formData.append("cycles", JSON.stringify(["Zyklus 1"]));
  formData.append("price", "0");
  formData.append("is_published", "true");

  // Create a Blob from the PDF content
  const pdfBlob = new Blob([pdfContent], { type: "application/pdf" });
  formData.append("file", pdfBlob, "test-upload.pdf");

  console.log("   Sending upload request...");

  try {
    const response = await fetch(`${BASE_URL}/api/resources`, {
      method: "POST",
      headers: {
        Cookie: cookies,
      },
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Upload successful!`);
      console.log(`   Resource ID: ${result.resource?.id}`);
      console.log(`   Title: ${result.resource?.title}`);
      console.log(`   Message: ${result.message}`);
      return result.resource;
    } else {
      console.log(`❌ Upload failed: ${response.status}`);
      console.log(`   Error: ${result.error}`);
      if (result.details) {
        console.log(`   Details:`, JSON.stringify(result.details, null, 2));
      }
      if (result.missing) {
        console.log(`   Missing fields:`, result.missing);
      }
      return null;
    }
  } catch (error) {
    console.error(`❌ Upload error:`, error);
    return null;
  }
}

async function verifyResourceExists(resourceId: string) {
  console.log("\n🔍 Verifying resource in database...");

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: {
      seller: {
        select: { display_name: true, email: true },
      },
    },
  });

  if (resource) {
    console.log(`✅ Resource found in database:`);
    console.log(`   ID: ${resource.id}`);
    console.log(`   Title: ${resource.title}`);
    console.log(`   Subjects: ${resource.subjects.join(", ")}`);
    console.log(`   Cycles: ${resource.cycles.join(", ")}`);
    console.log(`   Seller: ${resource.seller.display_name}`);
    console.log(`   File URL: ${resource.file_url}`);
    console.log(`   Published: ${resource.is_published}`);
    console.log(`   Status: ${resource.status}`);

    // Check if file exists
    const filePath = path.join(process.cwd(), "public", resource.file_url);
    if (existsSync(filePath)) {
      console.log(`✅ File exists on disk`);
    } else {
      console.log(`⚠️ File NOT found on disk at: ${filePath}`);
    }

    return resource;
  } else {
    console.log(`❌ Resource NOT found in database`);
    return null;
  }
}

async function cleanup(resourceId?: string) {
  console.log("\n🧹 Cleanup (optional - keeping test data for verification)...");
  // Not cleaning up so user can verify the resource in the UI
  // Uncomment below to clean up:
  /*
  if (resourceId) {
    await prisma.resource.delete({ where: { id: resourceId } }).catch(() => {});
  }
  await prisma.user.delete({ where: { email: TEST_USER_EMAIL } }).catch(() => {});
  */
  console.log("   Skipping cleanup - resource available for UI verification");
}

async function main() {
  console.log("🚀 Upload API Integration Test");
  console.log("===============================\n");

  try {
    // Setup
    await setupTestSeller();

    // Login
    const cookies = await login();
    if (!cookies) {
      throw new Error("Failed to login - cannot proceed with upload test");
    }

    // Test upload
    const resource = await testUpload(cookies);

    if (resource) {
      // Verify
      await verifyResourceExists(resource.id);

      console.log("\n===============================");
      console.log("✅ UPLOAD TEST PASSED!");
      console.log("===============================");
      console.log(`\n📌 You can now view "Test 1" in the Resources tab at ${BASE_URL}/resources`);
    } else {
      console.log("\n===============================");
      console.log("❌ UPLOAD TEST FAILED");
      console.log("===============================");
    }

    await cleanup(resource?.id);
  } catch (error) {
    console.error("\n❌ Test error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
