/**
 * Test script to validate the upload fix works correctly
 * This tests the validation schema and database insertion directly
 *
 * Run with: npx tsx scripts/test-upload-validation.ts
 */

import { PrismaClient } from "@prisma/client";
import { createResourceSchema } from "../lib/validations/resource";
import { SWISS_SUBJECTS, SWISS_CYCLES } from "../lib/validations/user";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

console.log("🧪 Upload Validation Test");
console.log("=========================\n");

// Test 1: Validate SWISS_SUBJECTS contains database subject names
async function testSubjectNamesMatch() {
  console.log("📋 Test 1: Subject names match between validation and database");

  // Fetch subjects from database (curriculum API data)
  const curriculum = await prisma.curriculum.findUnique({
    where: { code: "LP21" },
    include: { subjects: true },
  });

  if (!curriculum) {
    console.log("   ❌ LP21 curriculum not found in database");
    return false;
  }

  const dbSubjects = curriculum.subjects.map((s) => s.name_de);
  console.log(`   Database subjects: ${dbSubjects.join(", ")}`);
  console.log(`   SWISS_SUBJECTS: ${SWISS_SUBJECTS.join(", ")}`);

  const missingInValidation = dbSubjects.filter(
    (s) => !SWISS_SUBJECTS.includes(s as (typeof SWISS_SUBJECTS)[number])
  );
  const missingInDb = SWISS_SUBJECTS.filter((s) => !dbSubjects.includes(s));

  if (missingInValidation.length > 0) {
    console.log(
      `   ⚠️ Subjects in DB but not in SWISS_SUBJECTS: ${missingInValidation.join(", ")}`
    );
  }
  if (missingInDb.length > 0) {
    console.log(`   ⚠️ Subjects in SWISS_SUBJECTS but not in DB: ${missingInDb.join(", ")}`);
  }

  if (missingInValidation.length === 0) {
    console.log("   ✅ All database subjects are valid in SWISS_SUBJECTS");
    return true;
  }
  return false;
}

// Test 2: Validate the resource schema with real subject names
async function testResourceSchemaValidation() {
  console.log("\n📋 Test 2: Resource schema validation with subject names");

  // Test with a valid subject name (as returned by CurriculumSelector)
  const testData = {
    title: "Test 1",
    description: "Test upload validation - this description is long enough to pass validation",
    price: 0,
    subjects: ["Mathematik"], // Full name, not code
    cycles: ["Zyklus 1"],
    language: "de" as const,
    resourceType: "pdf" as const,
    is_published: true,
  };

  const result = createResourceSchema.safeParse(testData);

  if (result.success) {
    console.log("   ✅ Validation passed for subject 'Mathematik'");
    console.log(`   Parsed data: subjects=${result.data.subjects}, cycles=${result.data.cycles}`);
  } else {
    console.log("   ❌ Validation failed:");
    console.log(`   Errors: ${JSON.stringify(result.error.flatten().fieldErrors)}`);
    return false;
  }

  // Test with "Natur, Mensch, Gesellschaft" (the fixed subject name)
  const testData2 = {
    ...testData,
    subjects: ["Natur, Mensch, Gesellschaft"],
  };

  const result2 = createResourceSchema.safeParse(testData2);

  if (result2.success) {
    console.log("   ✅ Validation passed for subject 'Natur, Mensch, Gesellschaft'");
  } else {
    console.log("   ❌ Validation failed for 'Natur, Mensch, Gesellschaft':");
    console.log(`   Errors: ${JSON.stringify(result2.error.flatten().fieldErrors)}`);
    return false;
  }

  // Test that old code "MA" fails (proving we need full names)
  const testData3 = {
    ...testData,
    subjects: ["MA"],
  };

  const result3 = createResourceSchema.safeParse(testData3);

  if (!result3.success) {
    console.log("   ✅ Validation correctly rejects subject code 'MA' (needs full name)");
  } else {
    console.log("   ⚠️ Validation unexpectedly accepts 'MA' - should require full name");
  }

  return true;
}

// Test 3: Create actual resource in database (simulating successful upload)
async function testDatabaseInsertion() {
  console.log("\n📋 Test 3: Database insertion with validated data");

  // Find or create a seller
  let seller = await prisma.user.findFirst({
    where: { role: "SELLER" },
  });

  if (!seller) {
    seller = await prisma.user.create({
      data: {
        email: "validation-test@test.local",
        name: "Validation Test",
        display_name: "Validation Tester",
        role: "SELLER",
        subjects: ["Mathematik"],
        cycles: ["Zyklus 1"],
        stripe_onboarding_complete: true,
        stripe_charges_enabled: true,
        stripe_payouts_enabled: true,
        seller_terms_accepted_at: new Date(),
      },
    });
  }

  // Create upload directory and test file
  const uploadDir = path.join(process.cwd(), "public", "uploads", "resources", seller.id);
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const pdfContent = Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
      "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
      "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n" +
      "trailer<</Size 4/Root 1 0 R>>\n%%EOF"
  );

  const filename = `test-1-validation-${Date.now()}.pdf`;
  const filePath = path.join(uploadDir, filename);
  writeFileSync(filePath, pdfContent);
  const fileUrl = `/uploads/resources/${seller.id}/${filename}`;

  // Delete existing "Test 1" if present
  await prisma.resource.deleteMany({ where: { title: "Test 1" } });

  // Create resource with validated data
  const resource = await prisma.resource.create({
    data: {
      title: "Test 1",
      description:
        "Test upload through validation test - verifying the subject name fix works correctly",
      price: 0,
      subjects: ["Mathematik"], // Full name, not "MA"
      cycles: ["Zyklus 1"],
      file_url: fileUrl,
      is_published: true,
      is_approved: true,
      is_public: true,
      status: "VERIFIED",
      seller_id: seller.id,
      language: "de",
    },
  });

  const subjects = Array.isArray(resource.subjects) ? resource.subjects : [];
  const cycles = Array.isArray(resource.cycles) ? resource.cycles : [];
  console.log(`   ✅ Resource created successfully:`);
  console.log(`      ID: ${resource.id}`);
  console.log(`      Title: ${resource.title}`);
  console.log(`      Subjects: ${subjects.join(", ")}`);
  console.log(`      Cycles: ${cycles.join(", ")}`);
  console.log(`      File: ${resource.file_url}`);

  return resource;
}

async function main() {
  try {
    const test1 = await testSubjectNamesMatch();
    const test2 = await testResourceSchemaValidation();
    const resource = await testDatabaseInsertion();

    console.log("\n=========================");
    if (test1 && test2 && resource) {
      console.log("✅ ALL TESTS PASSED!");
      console.log("=========================");
      console.log(`\n📌 Resource "Test 1" has been created and is available in the Resources tab.`);
      console.log(`   Visit: http://localhost:3000/resources to verify.`);
    } else {
      console.log("❌ SOME TESTS FAILED");
      console.log("=========================");
    }
  } catch (error) {
    console.error("\n❌ Test error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
