/**
 * Script to create a test resource "Test 1" for verification
 * Run with: npx tsx scripts/create-test-resource.ts
 */

import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Creating Test 1 resource...\n");

  try {
    // First, find or create a seller user to attach the resource to
    let seller = await prisma.user.findFirst({
      where: { role: "SELLER" },
    });

    if (!seller) {
      console.log("No seller found, creating a test seller...");
      seller = await prisma.user.create({
        data: {
          id: "test-seller-for-test-1",
          email: "test-seller@test.local",
          name: "Test Seller",
          display_name: "Test Verkäufer",
          role: "SELLER",
          subjects: ["Mathematik"],
          cycles: ["Zyklus 1"],
          stripe_onboarding_complete: true,
          stripe_charges_enabled: true,
          stripe_payouts_enabled: true,
          seller_terms_accepted_at: new Date(),
        },
      });
      console.log(`✅ Created test seller: ${seller.id}`);
    } else {
      console.log(`✅ Using existing seller: ${seller.display_name || seller.email}`);
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "resources", seller.id);
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // Create a minimal valid PDF file
    const pdfContent = Buffer.from(
      "%PDF-1.4\n" +
        "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
        "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
        "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n" +
        "xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \n" +
        "trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
    );

    const filename = `test-1-${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, filename);
    writeFileSync(filePath, pdfContent);

    const fileUrl = `/uploads/resources/${seller.id}/${filename}`;
    console.log(`✅ Created PDF file: ${fileUrl}`);

    // Check if Test 1 already exists
    const existing = await prisma.resource.findFirst({
      where: { title: "Test 1" },
    });

    if (existing) {
      console.log(`⚠️ Resource "Test 1" already exists with ID: ${existing.id}`);
      console.log("   Deleting and recreating...");
      await prisma.resource.delete({ where: { id: existing.id } });
    }

    // Create the resource in database
    const resource = await prisma.resource.create({
      data: {
        title: "Test 1",
        description:
          "Dies ist ein Testdokument, um die Upload-Funktion zu überprüfen. Created by test script.",
        price: 0,
        subjects: ["Mathematik"],
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

    console.log(`\n✅ SUCCESS! Created resource "Test 1"`);
    console.log(`   ID: ${resource.id}`);
    console.log(`   Title: ${resource.title}`);
    console.log(`   Seller: ${seller.display_name || seller.email}`);
    console.log(`   File: ${resource.file_url}`);
    console.log(`   Status: Published, Approved, Public`);
    console.log(`\n📌 You can now view this resource in the Resources tab!`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
