/**
 * Integration test script for document upload and download flow
 * Run with: npx tsx scripts/test-upload-download-flow.ts
 *
 * This script tests:
 * 1. Creating test users (seller and buyer)
 * 2. Uploading a resource as a seller
 * 3. Downloading the resource as a buyer
 * 4. Verifying the resource appears in the buyer's library
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { writeFileSync, mkdirSync, existsSync, rmSync } from "fs";
import path from "path";

// Create Prisma client with the same config as the project
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/easy_lehrer",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Test data IDs
const TEST_SELLER_ID = "test-seller-upload-flow";
const TEST_BUYER_ID = "test-buyer-download-flow";
const TEST_RESOURCE_ID = "test-resource-upload-download";

async function cleanup() {
  console.log("\n🧹 Cleaning up test data...");

  // Delete test downloads
  await prisma.download.deleteMany({
    where: {
      OR: [{ user_id: TEST_BUYER_ID }, { resource_id: TEST_RESOURCE_ID }],
    },
  });

  // Delete test resource
  await prisma.resource.deleteMany({
    where: { id: TEST_RESOURCE_ID },
  });

  // Delete test users
  await prisma.user.deleteMany({
    where: {
      id: { in: [TEST_SELLER_ID, TEST_BUYER_ID] },
    },
  });

  // Clean up test files
  const testUploadDir = path.join(process.cwd(), "public", "uploads", "resources", TEST_SELLER_ID);
  if (existsSync(testUploadDir)) {
    rmSync(testUploadDir, { recursive: true, force: true });
  }

  console.log("✅ Cleanup complete");
}

async function createTestSeller() {
  console.log("\n👤 Creating test seller...");

  const seller = await prisma.user.create({
    data: {
      id: TEST_SELLER_ID,
      email: "test-seller@upload-flow.test",
      name: "Test Seller",
      display_name: "Lehrer Test",
      role: "SELLER",
      is_seller: true,
      seller_verified: true,
      subjects: ["Mathematik", "Deutsch"],
      cycles: ["Zyklus 1", "Zyklus 2"],
      legal_first_name: "Test",
      legal_last_name: "Seller",
      iban: "CH93 0076 2011 6238 5295 7",
    },
  });

  console.log(`✅ Created seller: ${seller.email} (${seller.id})`);
  return seller;
}

async function createTestBuyer() {
  console.log("\n👤 Creating test buyer...");

  const buyer = await prisma.user.create({
    data: {
      id: TEST_BUYER_ID,
      email: "test-buyer@download-flow.test",
      name: "Test Buyer",
      display_name: "Käufer Test",
      role: "BUYER",
    },
  });

  console.log(`✅ Created buyer: ${buyer.email} (${buyer.id})`);
  return buyer;
}

async function uploadTestResource() {
  console.log("\n📤 Simulating resource upload...");

  // Create upload directory
  const uploadDir = path.join(process.cwd(), "public", "uploads", "resources", TEST_SELLER_ID);
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  // Create a test PDF file (minimal valid PDF)
  const pdfContent = Buffer.from([
    0x25,
    0x50,
    0x44,
    0x46,
    0x2d,
    0x31,
    0x2e,
    0x34, // %PDF-1.4
    0x0a, // newline
    0x31,
    0x20,
    0x30,
    0x20,
    0x6f,
    0x62,
    0x6a, // 1 0 obj
    0x0a,
    0x3c,
    0x3c,
    0x2f,
    0x54,
    0x79,
    0x70,
    0x65,
    0x2f,
    0x43,
    0x61,
    0x74,
    0x61,
    0x6c,
    0x6f,
    0x67, // <</Type/Catalog
    0x3e,
    0x3e,
    0x0a, // >>
    0x65,
    0x6e,
    0x64,
    0x6f,
    0x62,
    0x6a,
    0x0a, // endobj
    0x25,
    0x25,
    0x45,
    0x4f,
    0x46, // %%EOF
  ]);

  const filename = `${TEST_RESOURCE_ID}-${Date.now()}.pdf`;
  const filePath = path.join(uploadDir, filename);
  writeFileSync(filePath, pdfContent);

  const fileUrl = `/uploads/resources/${TEST_SELLER_ID}/${filename}`;

  console.log(`✅ Created test file: ${fileUrl}`);

  // Create resource in database
  const resource = await prisma.resource.create({
    data: {
      id: TEST_RESOURCE_ID,
      title: "Test Mathematik Arbeitsblatt - Upload Flow Test",
      description: "This is a test resource created by the upload/download flow test script.",
      price: 0, // Free resource for testing
      subjects: ["Mathematik"],
      cycles: ["Zyklus 1"],
      file_url: fileUrl,
      is_published: true,
      is_approved: true,
      is_public: true,
      status: "VERIFIED",
      seller_id: TEST_SELLER_ID,
      language: "de",
    },
  });

  console.log(`✅ Created resource: ${resource.title} (${resource.id})`);
  return resource;
}

async function testDownloadAccess() {
  console.log("\n📥 Testing download access...");

  // Check resource exists and is accessible
  const resource = await prisma.resource.findUnique({
    where: { id: TEST_RESOURCE_ID },
    include: {
      seller: { select: { display_name: true } },
    },
  });

  if (!resource) {
    throw new Error("Resource not found!");
  }

  console.log(`✅ Resource found: ${resource.title}`);
  console.log(`   - Seller: ${resource.seller.display_name}`);
  console.log(`   - Price: ${resource.price === 0 ? "Free" : `${resource.price / 100} CHF`}`);
  console.log(`   - Published: ${resource.is_published}`);
  console.log(`   - Approved: ${resource.is_approved}`);
  console.log(`   - Public: ${resource.is_public}`);
  console.log(`   - File URL: ${resource.file_url}`);

  // Check file exists
  const filePath = path.join(process.cwd(), "public", resource.file_url);
  if (!existsSync(filePath)) {
    throw new Error(`File not found at: ${filePath}`);
  }

  console.log(`✅ File exists on disk`);

  return resource;
}

async function simulateBuyerDownload() {
  console.log("\n📥 Simulating buyer download...");

  // Record download in database (simulating what the API does)
  const download = await prisma.download.create({
    data: {
      user_id: TEST_BUYER_ID,
      resource_id: TEST_RESOURCE_ID,
    },
  });

  console.log(`✅ Download recorded: ${download.id}`);
  return download;
}

async function testLibraryContainsResource() {
  console.log("\n📚 Testing library contains downloaded resource...");

  // Query library (simulating the /api/user/library endpoint)
  const downloads = await prisma.download.findMany({
    where: { user_id: TEST_BUYER_ID },
    include: {
      resource: {
        select: {
          id: true,
          title: true,
          price: true,
          subjects: true,
          cycles: true,
          preview_url: true,
          seller: {
            select: {
              id: true,
              display_name: true,
            },
          },
        },
      },
    },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      buyer_id: TEST_BUYER_ID,
      status: "COMPLETED",
    },
    include: {
      resource: {
        select: {
          id: true,
          title: true,
          price: true,
          subjects: true,
          cycles: true,
          preview_url: true,
          seller: {
            select: {
              id: true,
              display_name: true,
            },
          },
        },
      },
    },
  });

  // Combine and deduplicate
  interface LibraryResource {
    id: string;
    title: string;
    price: number;
    subjects: string[];
    cycles: string[];
    preview_url: string | null;
    seller: { id: string; display_name: string | null };
    acquired_at: Date;
    acquisition_type: string;
  }
  const resourceMap = new Map<string, LibraryResource>();

  downloads.forEach((d) => {
    resourceMap.set(d.resource.id, {
      ...d.resource,
      acquired_at: d.created_at,
      acquisition_type: "download",
    });
  });

  transactions.forEach((t) => {
    if (!resourceMap.has(t.resource.id)) {
      resourceMap.set(t.resource.id, {
        ...t.resource,
        acquired_at: t.created_at,
        acquisition_type: "purchase",
      });
    }
  });

  const library = Array.from(resourceMap.values());

  console.log(`✅ Library contains ${library.length} resource(s)`);

  const testResource = library.find((r) => r.id === TEST_RESOURCE_ID);
  if (!testResource) {
    throw new Error("Test resource not found in library!");
  }

  console.log(`✅ Test resource found in library: ${testResource.title}`);
  return library;
}

async function testApiEndpoints() {
  console.log("\n🌐 Testing API endpoints via HTTP...");

  const baseUrl = "http://localhost:3000";

  // Test resources list endpoint
  console.log("   Testing GET /api/resources...");
  try {
    const res = await fetch(`${baseUrl}/api/resources`);
    const data = await res.json();

    if (res.ok) {
      console.log(`   ✅ Resources endpoint: ${data.resources?.length || 0} resources returned`);
    } else {
      console.log(`   ⚠️ Resources endpoint returned ${res.status}: ${data.error}`);
    }
  } catch (e) {
    console.log(`   ❌ Resources endpoint failed: ${e}`);
  }

  // Test resource detail endpoint
  console.log(`   Testing GET /api/resources/${TEST_RESOURCE_ID}...`);
  try {
    const res = await fetch(`${baseUrl}/api/resources/${TEST_RESOURCE_ID}`);
    const data = await res.json();

    if (res.ok) {
      console.log(`   ✅ Resource detail: ${data.resource?.title || data.title || "Found"}`);
    } else {
      console.log(`   ⚠️ Resource detail returned ${res.status}: ${data.error}`);
    }
  } catch (e) {
    console.log(`   ❌ Resource detail failed: ${e}`);
  }

  // Test download endpoint (should require auth)
  console.log(`   Testing GET /api/resources/${TEST_RESOURCE_ID}/download...`);
  try {
    const res = await fetch(`${baseUrl}/api/resources/${TEST_RESOURCE_ID}/download`);
    const data = await res.json();

    if (res.status === 401) {
      console.log(`   ✅ Download endpoint correctly requires auth: ${data.error}`);
    } else if (res.ok) {
      console.log(`   ⚠️ Download endpoint allowed unauthenticated access`);
    } else {
      console.log(`   ⚠️ Download endpoint returned ${res.status}: ${data.error}`);
    }
  } catch (e) {
    console.log(`   ❌ Download endpoint failed: ${e}`);
  }

  // Test library endpoint (should require auth)
  console.log("   Testing GET /api/user/library...");
  try {
    const res = await fetch(`${baseUrl}/api/user/library`);
    const data = await res.json();

    if (res.status === 401) {
      console.log(`   ✅ Library endpoint correctly requires auth: ${data.error}`);
    } else if (res.ok) {
      console.log(`   ⚠️ Library endpoint allowed unauthenticated access`);
    } else {
      console.log(`   ⚠️ Library endpoint returned ${res.status}: ${data.error}`);
    }
  } catch (e) {
    console.log(`   ❌ Library endpoint failed: ${e}`);
  }
}

async function main() {
  console.log("🚀 Starting Upload/Download Flow Test");
  console.log("=====================================");

  try {
    // Clean up any previous test data
    await cleanup();

    // Create test users
    await createTestSeller();
    await createTestBuyer();

    // Upload test resource
    await uploadTestResource();

    // Test download access
    await testDownloadAccess();

    // Simulate buyer download
    await simulateBuyerDownload();

    // Test library contains the resource
    await testLibraryContainsResource();

    // Test API endpoints
    await testApiEndpoints();

    console.log("\n=====================================");
    console.log("✅ All tests passed!");
    console.log("=====================================");

    // Clean up
    await cleanup();
  } catch (error) {
    console.error("\n❌ Test failed:", error);

    // Clean up on error too
    console.log("\nAttempting cleanup after error...");
    try {
      await cleanup();
    } catch (cleanupError) {
      console.error("Cleanup also failed:", cleanupError);
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
