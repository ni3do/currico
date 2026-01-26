import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { hash } from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import { seedCurriculum } from "./seed-curriculum";

// Parse DATABASE_URL for adapter config
function parseDbUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1),
  };
}

const dbConfig = parseDbUrl(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

// Pre-defined IDs for consistent upserts
const TEST_USER_ID = "test-user-id";
const ADMIN_USER_ID = "admin-user-id";
const ADMIN_EMAIL = "admin@easy-lehrer.ch";
const ADMIN_USERNAME = "ADMINISTRATOR";
const RESOURCE_IDS = {
  math: "test-resource-math",
  german: "test-resource-german",
  nmg: "test-resource-nmg",
};

async function main() {
  console.log("🌱 Starting seed...");

  // Hash passwords
  const testPasswordHash = await hash("test", 12);
  const adminPasswordHash = await hash("12345678", 12);

  // 1. Upsert ADMINISTRATOR (super admin) user
  console.log("👑 Creating ADMINISTRATOR user...");
  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password_hash: adminPasswordHash,
      updated_at: new Date(),
    },
    create: {
      id: ADMIN_USER_ID,
      email: ADMIN_EMAIL,
      password_hash: adminPasswordHash,
      name: ADMIN_USERNAME,
      display_name: ADMIN_USERNAME,
      role: "ADMIN",
      is_protected: true, // Cannot be deleted through UI
      emailVerified: new Date(),
    },
  });
  console.log(`   ✓ Admin user: ${adminUser.email} (ID: ${adminUser.id})`);

  // 2. Upsert test user with full seller profile
  console.log("👤 Creating test user...");
  const testUser = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {
      password_hash: testPasswordHash,
      updated_at: new Date(),
    },
    create: {
      id: TEST_USER_ID,
      email: "test@test.com",
      password_hash: testPasswordHash,
      name: "Test User",
      display_name: "Frau Test",
      role: "SELLER",
      subjects: ["Mathematik", "Deutsch", "NMG"],
      cycles: ["Zyklus 1", "Zyklus 2"],
      cantons: ["Zürich"],
      emailVerified: new Date(),
      stripe_onboarding_complete: true,
      stripe_charges_enabled: true,
      stripe_payouts_enabled: true,
      seller_terms_accepted_at: new Date(),
    },
  });
  console.log(`   ✓ Test user: ${testUser.email} (ID: ${testUser.id})`);

  // 3. Copy sample files to public/uploads/resources/
  console.log("📁 Copying sample files...");
  const seedFilesDir = path.join(__dirname, "seed-files");
  const uploadsDir = path.join(__dirname, "..", "public", "uploads", "resources");

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const files = [
    { src: "sample-math-worksheet.pdf", dest: "sample-math-worksheet.pdf" },
    { src: "sample-german-reading.pdf", dest: "sample-german-reading.pdf" },
    { src: "sample-nmg-activity.pdf", dest: "sample-nmg-activity.pdf" },
  ];

  for (const file of files) {
    const srcPath = path.join(seedFilesDir, file.src);
    const destPath = path.join(uploadsDir, file.dest);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`   ✓ Copied ${file.src}`);
    } else {
      console.log(`   ⚠ Source file not found: ${file.src}`);
    }
  }

  // 4. Upsert sample resources
  console.log("📚 Creating sample resources...");

  const resources = [
    {
      id: RESOURCE_IDS.math,
      title: "Mathematik Arbeitsblatt: Addition",
      description:
        "Ein einfaches Arbeitsblatt für Zyklus 1 mit Additionsübungen. Perfekt für den Einstieg in die Grundrechenarten.",
      price: 0, // Free
      file_url: "/uploads/resources/sample-math-worksheet.pdf",
      preview_url: null,
      subjects: ["Mathematik"],
      cycles: ["Zyklus 1"],
      is_published: true,
      is_approved: true,
      status: "VERIFIED" as const,
      is_public: true,
      seller_id: testUser.id,
    },
    {
      id: RESOURCE_IDS.german,
      title: "Deutsch Leseübung: Der Fuchs",
      description:
        "Eine kurze Leseübung mit Verständnisfragen für Zyklus 2. Die Geschichte handelt von einem kleinen Fuchs im Wald.",
      price: 500, // 5 CHF
      file_url: "/uploads/resources/sample-german-reading.pdf",
      preview_url: null,
      subjects: ["Deutsch"],
      cycles: ["Zyklus 2"],
      is_published: true,
      is_approved: true,
      status: "VERIFIED" as const,
      is_public: true,
      seller_id: testUser.id,
    },
    {
      id: RESOURCE_IDS.nmg,
      title: "NMG Experiment: Wasserkreislauf",
      description:
        "Ein einfaches Experiment zum Thema Wasserkreislauf für Zyklus 2. Mit Materialliste und Schritt-für-Schritt Anleitung.",
      price: 300, // 3 CHF
      file_url: "/uploads/resources/sample-nmg-activity.pdf",
      preview_url: null,
      subjects: ["NMG"],
      cycles: ["Zyklus 2"],
      is_published: true,
      is_approved: true,
      status: "VERIFIED" as const,
      is_public: true,
      seller_id: testUser.id,
    },
  ];

  for (const resource of resources) {
    const upserted = await prisma.resource.upsert({
      where: { id: resource.id },
      update: {
        title: resource.title,
        description: resource.description,
        price: resource.price,
        file_url: resource.file_url,
        subjects: resource.subjects,
        cycles: resource.cycles,
        is_published: resource.is_published,
        is_approved: resource.is_approved,
        status: resource.status,
        is_public: resource.is_public,
      },
      create: resource,
    });
    console.log(`   ✓ Resource: ${upserted.title}`);
  }

  // 5. Seed curriculum data (LP21, textbooks)
  await seedCurriculum(prisma);

  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("Admin credentials:");
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log("  Password: 12345678");
  console.log("");
  console.log("Test user credentials:");
  console.log("  Email: test@test.com");
  console.log("  Password: test");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
